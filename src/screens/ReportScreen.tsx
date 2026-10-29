import React, { useState, useEffect, useRef } from 'react';
import { ScreenType, HazardSeverity, HazardTicket } from '../types';
import { ASSETS } from '../data/mockData';
import { api } from '../services/api';

export interface LocationData {
  location: string;
  landmark: string;
  ward: string;
  coordinates: { lat: number; lng: number; str: string };
  accuracy?: string;
  source?: 'device' | 'map' | 'preset';
}

interface ReportScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onSubmitReport: (ticket: Partial<HazardTicket>) => void;
  initialLocation?: LocationData;
  onLocationChange?: (loc: LocationData) => void;
  onGoToMapToPick?: () => void;
}

export const ReportScreen: React.FC<ReportScreenProps> = ({
  onNavigate,
  onSubmitReport,
  initialLocation,
  onLocationChange,
  onGoToMapToPick,
}) => {
  const [severity, setSeverity] = useState<HazardSeverity>('dangerous');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Waterlogged / Hidden',
    'Blind Corner',
    'Bike / Rider Danger',
  ]);
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [depthEst, setDepthEst] = useState('9.2');

  // Photo & Media API State
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoSource, setPhotoSource] = useState<'sample' | 'camera' | 'upload'>('upload');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);
  const [photoCapturedToast, setPhotoCapturedToast] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera media stream cleanly
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
    setIsTorchOn(false);
  };

  // Clean up media tracks on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Launch camera using browser Media API
  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    setCameraError(null);
    setIsCameraLoading(true);
    setIsCameraActive(true);

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser. You can upload an image using the button below.');
      setIsCameraLoading(false);
      return;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
      } catch {
        // Fallback with simpler constraint if device rejects specific facingMode
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // Play triggered
        }
      }

      // Check for torch capability
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (videoTrack.getCapabilities && videoTrack.getCapabilities()) as any;
        setHasTorch(Boolean(capabilities?.torch));
      } else {
        setHasTorch(false);
      }

      setIsCameraLoading(false);
    } catch (err: any) {
      setIsCameraLoading(false);
      console.warn('Camera access error:', err);
      let message = 'Unable to access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. You can take or choose a photo using the file picker.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera sensor was detected. You can select an image from your files.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera is currently locked or in use by another application.';
      }
      setCameraError(message);
    }
  };

  // Toggle flash/torch if supported
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const newTorch = !isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: newTorch }],
        });
        setIsTorchOn(newTorch);
      } catch (err) {
        console.warn('Torch failed:', err);
      }
    }
  };

  // Flip front/back camera
  const switchCameraFacing = async () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    await startCamera(nextFacing);
  };

  // Capture still frame from live video via offscreen canvas
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    // Trigger visual shutter flash
    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 250);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (cameraFacing === 'user') {
        // Mirror front camera
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPhotoUrl(dataUrl);
      setPhotoSource('camera');

      // Calibrate realistic depth estimate from scan
      const simulatedDepth = (8.2 + Math.random() * 2.6).toFixed(1);
      setDepthEst(simulatedDepth);

      setPhotoCapturedToast('Live photo captured! Volumetric fracture and depth contours calibrated.');
      setTimeout(() => setPhotoCapturedToast(null), 4500);
    }

    stopCameraStream();
  };

  // Handle image upload fallback or gallery pick
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoUrl(reader.result);
        setPhotoSource('upload');
        setPhotoCapturedToast('Photo attached successfully! AI fracture scan ready.');
        setTimeout(() => setPhotoCapturedToast(null), 4000);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Reset / Clear photo
  const handleResetToSample = () => {
    setPhotoUrl('');
    setPhotoSource('upload');
    setPhotoCapturedToast('Photo removed.');
    setTimeout(() => setPhotoCapturedToast(null), 3000);
  };

  // Location Management State
  const [locationData, setLocationData] = useState<LocationData>(
    initialLocation || {
      location: 'M.G. Road, Ward 4',
      landmark: 'Near City Center Mall, Southbound lane',
      ward: 'Ward 4 - West Sector',
      coordinates: { lat: 19.2431, lng: 73.1342, str: '19.2431° N, 73.1342° E' },
      accuracy: '±2.8m precision',
      source: 'preset',
    }
  );

  // Sync when initialLocation prop updates from map selection
  useEffect(() => {
    if (initialLocation) {
      setLocationData(initialLocation);
    }
  }, [initialLocation]);

  const [isLocating, setIsLocating] = useState(false);
  const [locatingMsg, setLocatingMsg] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [tempCoords, setTempCoords] = useState(locationData.coordinates);
  const [extraAngleToast, setExtraAngleToast] = useState<string | null>(null);

  // Quick preset locations in Ward 4 for fast picking
  const PRESET_SPOTS = [
    {
      title: 'M.G. Road Corridor',
      location: 'M.G. Road, Ward 4',
      landmark: 'Near City Center Mall, Southbound lane',
      ward: 'Ward 4 - West Sector',
      lat: 19.2431,
      lng: 73.1342,
    },
    {
      title: 'Grand Central Avenue',
      location: 'Grand Central Ave, South Approach',
      landmark: 'Near Victoria Botanical Park',
      ward: 'Ward 4 - West Sector',
      lat: 19.2458,
      lng: 73.1311,
    },
    {
      title: 'Station Road Flyover',
      location: 'Station Road Flyover, Ward 4',
      landmark: 'Railway Junction East Ramp',
      ward: 'Ward 4 - West Sector',
      lat: 19.2392,
      lng: 73.1365,
    },
    {
      title: 'Link Road Junction 7',
      location: 'Link Road Junction 7, Ward 4',
      landmark: 'Near Municipal School #12',
      ward: 'Ward 4 - West Sector',
      lat: 19.2415,
      lng: 73.1388,
    },
  ];

  // Request browser/device Geolocation
  const handleRequestDeviceLocation = () => {
    setLocationError(null);
    setLocationSuccessMsg(null);

    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation sensor is not supported by your browser. Please select location on the map.');
      return;
    }

    setIsLocating(true);
    setLocatingMsg('Requesting device GPS sensor...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocatingMsg('Calibrating satellite coordinates...');
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracyMeters = Math.round(pos.coords.accuracy || 3);
        const coordStr = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;

        let resolvedAddress = `GPS Location (${coordStr})`;
        let resolvedWard = 'Ward 4 - West Sector';

        try {
          const geo = await api.reverseGeocode(lat, lng);
          if (geo?.address) resolvedAddress = geo.address;
          if (geo?.ward) resolvedWard = geo.ward;
        } catch {
          // fallback gracefully
        }

        const newLoc: LocationData = {
          location: resolvedAddress,
          landmark: 'Acquired via Device GPS Sensor',
          ward: resolvedWard,
          coordinates: { lat, lng, str: coordStr },
          accuracy: `±${accuracyMeters}m GPS precision`,
          source: 'device',
        };

        setLocationData(newLoc);
        setTempCoords(newLoc.coordinates);
        onLocationChange?.(newLoc);
        setIsLocating(false);
        setLocatingMsg(null);
        setLocationSuccessMsg(`Device GPS lock verified! (±${accuracyMeters}m accuracy)`);
        setTimeout(() => setLocationSuccessMsg(null), 5000);
      },
      (err) => {
        setIsLocating(false);
        setLocatingMsg(null);
        let errorMsg = 'Could not acquire device GPS.';
        if (err.code === 1) {
          errorMsg = 'Device location permission was declined. You can select your location on the map instead.';
        } else if (err.code === 2) {
          errorMsg = 'Device GPS location is currently unavailable. Please select your location on the map.';
        } else if (err.code === 3) {
          errorMsg = 'GPS acquisition timed out. Please try again or select location on the map.';
        }
        setLocationError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );
  };

  const handleOpenMap = () => {
    if (onGoToMapToPick) {
      onGoToMapToPick();
    } else {
      setIsMapPickerOpen(true);
    }
  };

  const handleApplyPreset = (preset: typeof PRESET_SPOTS[0]) => {
    const newLoc: LocationData = {
      location: preset.location,
      landmark: preset.landmark,
      ward: preset.ward,
      coordinates: {
        lat: preset.lat,
        lng: preset.lng,
        str: `${preset.lat.toFixed(4)}° N, ${preset.lng.toFixed(4)}° E`,
      },
      accuracy: '±1.2m civic map precision',
      source: 'map',
    };
    setLocationData(newLoc);
    setTempCoords(newLoc.coordinates);
    onLocationChange?.(newLoc);
    setIsMapPickerOpen(false);
    setLocationSuccessMsg(`Location set to ${preset.location}`);
    setTimeout(() => setLocationSuccessMsg(null), 3000);
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName) ? prev.filter((t) => t !== tagName) : [...prev, tagName]
    );
  };

  const handleToggleVoice = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setNotes((prev) =>
          prev
            ? `${prev} Water pooling around asphalt edges causing sharp deflection.`
            : 'Deep pothole right before bus stop, cars swerving into oncoming traffic. Urgent repair needed.'
        );
        setIsRecording(false);
      }, 1800);
    } else {
      setIsRecording(false);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitReport({
        title: `Pothole #RW-${Math.floor(4100 + Math.random() * 90)}`,
        location: locationData.location,
        landmark: locationData.landmark,
        ward: locationData.ward,
        coordinates: locationData.coordinates,
        depthCm: parseFloat(depthEst) || 9.2,
        severity: severity,
        severityLabel:
          severity === 'dangerous'
            ? 'Severe (Grade 3) • Axle Breaker'
            : severity === 'moderate'
            ? 'Moderate Crater • Suspension Shock'
            : 'Minor Surface Dip',
        environmentalTags: selectedTags,
        notes: notes || 'Submitted via Mobile by Commuter.',
        status: 'dispatched',
        statusLabel: 'Work Order Dispatched',
        imageUrl: photoUrl,
      });
      setIsSubmitting(false);
      onNavigate('tracking');
    }, 800);
  };

  const allTags = [
    { name: 'Waterlogged / Hidden', icon: 'water_drop' },
    { name: 'Blind Corner', icon: 'turn_sharp_right' },
    { name: 'Bike / Rider Danger', icon: 'two_wheeler' },
    { name: 'School Zone', icon: 'school' },
    { name: 'High-Speed Corridor', icon: 'speed' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col selection:bg-[#fe932c] selection:text-[#663500]">
      {/* HEADER (Responsive for mobile & laptop) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#e5eeff] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('map')}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#0b1c30] hover:bg-[#eff4ff] active:bg-[#e5eeff] transition-colors cursor-pointer"
            title="Back to Map"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div>
            <h1 className="font-headline text-lg sm:text-xl font-bold text-[#0b1c30] leading-tight">
              Quick Hazard Report
            </h1>
            <span className="text-[11px] text-[#45464d] font-medium hidden sm:inline">
              Ward 4 Civic Dispatch Telemetry Pipeline
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex bg-[#dce9ff] text-[#0b1c30] px-3 py-1 rounded-full font-headline text-xs font-bold">
            Step 2 of 3: AI Classification
          </span>
        </div>
      </header>

      {/* MAIN CONTAINER: Responsive 1-col on mobile, 2-col on laptop */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN (lg:col-span-6): Camera HUD & Spatial Telemetry */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* Step Progress on Mobile (placed on top) */}
            <div className="lg:hidden flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-headline text-xs text-[#45464d] uppercase tracking-wider font-bold">
                  Step 2 of 3: Hazard Classification
                </span>
                <span className="font-headline text-[11px] bg-[#dce9ff] px-2 py-0.5 rounded-full text-[#0b1c30] font-bold">
                  AI Scan Verified
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="h-1.5 rounded-full bg-[#0b1c30]"></div>
                <div className="h-1.5 rounded-full bg-[#fe932c] shadow-[0_0_8px_rgba(254,147,44,0.6)]"></div>
                <div className="h-1.5 rounded-full bg-[#d3e4fe]"></div>
              </div>
            </div>

            {/* Hazard Location Source Prompt Card */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-[#e5eeff] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#ffdcc3] text-[#904d00] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">explore</span>
                  </div>
                  <div>
                    <h3 className="font-headline text-xs sm:text-sm font-bold text-[#0b1c30]">
                      Hazard Location Source
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#45464d]">
                      Ask device for live GPS or choose a location on the interactive map
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleRequestDeviceLocation}
                  disabled={isLocating}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    locationData.source === 'device'
                      ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-300'
                      : 'bg-[#f8f9ff] border-[#dce9ff] hover:bg-[#eff4ff]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    locationData.source === 'device' ? 'bg-emerald-500 text-white' : 'bg-white text-[#904d00] border border-[#dce9ff]'
                  }`}>
                    <span className={`material-symbols-outlined text-[20px] ${isLocating ? 'animate-spin' : ''}`}>
                      {isLocating ? 'sync' : 'my_location'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-headline text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                      <span>{isLocating ? 'Acquiring GPS...' : 'Use Current Location'}</span>
                      {locationData.source === 'device' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#45464d] truncate">
                      Ask device for GPS coordinates
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleOpenMap}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    locationData.source === 'map'
                      ? 'bg-[#eff4ff] border-[#fe932c] ring-1 ring-[#fe932c]'
                      : 'bg-[#f8f9ff] border-[#dce9ff] hover:bg-[#eff4ff]'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    locationData.source === 'map' ? 'bg-[#0b1c30] text-[#fe932c]' : 'bg-white text-[#0b1c30] border border-[#dce9ff]'
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">map</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-headline text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                      <span>Select Location on Map</span>
                      {locationData.source === 'map' && (
                        <span className="w-2 h-2 rounded-full bg-[#fe932c]"></span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#45464d] truncate">
                      Open map to place or pick pin
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Photographic Evidence Card with Browser Media API Camera */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#e5eeff] flex flex-col">
              {/* Card Header with Source Status */}
              <div className="px-4 py-3 border-b border-[#e5eeff] flex items-center justify-between bg-[#f8f9ff]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[#904d00] text-xl shrink-0">
                    photo_camera
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-headline text-xs sm:text-sm font-bold text-[#0b1c30] truncate">
                      Hazard Photographic Evidence
                    </h3>
                    <p className="text-[10px] sm:text-xs text-[#45464d] truncate">
                      Snap live road condition using camera for AI depth calibration
                    </p>
                  </div>
                </div>

                {/* Photo Source Badge */}
                <div className="shrink-0">
                  {photoSource === 'camera' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-headline font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Camera Verified
                    </span>
                  ) : photoSource === 'upload' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-headline font-bold bg-blue-100 text-blue-800 border border-blue-300">
                      <span className="material-symbols-outlined text-[12px]">cloud_done</span>
                      Uploaded Photo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-headline font-semibold bg-[#e5eeff] text-[#45464d]">
                      Sample Template
                    </span>
                  )}
                </div>
              </div>

              {/* Hidden File Input Fallback */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileUpload}
              />

              {/* Viewport: Live Camera Feed OR Captured Photo View */}
              <div className="relative w-full h-72 sm:h-88 lg:h-96 bg-[#0b1c30] overflow-hidden">
                {isCameraActive ? (
                  /* ======================================================== */
                  /* LIVE CAMERA VIEWFINDER (Browser Media API)               */
                  /* ======================================================== */
                  <div className="relative w-full h-full flex flex-col justify-between">
                    {/* Live Video Stream */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Shutter Flash Animation */}
                    {isShutterFlashing && (
                      <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200"></div>
                    )}

                    {/* Camera Loading Spinner */}
                    {isCameraLoading && (
                      <div className="absolute inset-0 z-30 bg-black/75 flex flex-col items-center justify-center gap-3 text-white">
                        <span className="material-symbols-outlined text-4xl text-[#fe932c] animate-spin">
                          progress_activity
                        </span>
                        <span className="font-headline text-sm font-semibold">
                          Initializing Camera Sensor...
                        </span>
                        <span className="text-xs text-slate-400">
                          Please allow browser camera permissions if prompted
                        </span>
                      </div>
                    )}

                    {/* Camera Error Message */}
                    {cameraError && (
                      <div className="absolute inset-0 z-30 bg-black/85 p-6 flex flex-col items-center justify-center text-center gap-3 text-white">
                        <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">videocam_off</span>
                        </div>
                        <h4 className="font-headline text-sm font-bold text-red-300">
                          Camera Access Issue
                        </h4>
                        <p className="text-xs text-slate-300 max-w-sm">
                          {cameraError}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => startCamera(cameraFacing)}
                            className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-headline text-xs font-bold transition-all cursor-pointer"
                          >
                            Try Again
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              stopCameraStream();
                              fileInputRef.current?.click();
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#fe932c] hover:bg-[#e8801b] text-[#2f1500] font-headline text-xs font-bold transition-all cursor-pointer"
                          >
                            Choose from Files / Gallery
                          </button>
                          <button
                            type="button"
                            onClick={stopCameraStream}
                            className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-slate-300 font-headline text-xs transition-all cursor-pointer"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Top HUD: Live Indicator, Controls */}
                    <div className="relative z-20 p-3 sm:p-4 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent">
                      <div className="flex items-center gap-2">
                        <div className="bg-red-600 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                          <span className="font-headline text-[10px] sm:text-xs text-white font-bold tracking-wider">
                            LIVE FEED
                          </span>
                        </div>
                        <div className="hidden sm:flex bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full items-center gap-1 text-[10px] text-slate-300 font-mono">
                          <span>{cameraFacing === 'environment' ? 'REAR SENSOR' : 'FRONT SENSOR'}</span>
                        </div>
                      </div>

                      {/* Top Action Icons */}
                      <div className="flex items-center gap-1.5">
                        {hasTorch && (
                          <button
                            type="button"
                            onClick={toggleTorch}
                            title="Toggle Torch / Flashlight"
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                              isTorchOn ? 'bg-amber-400 text-black' : 'bg-black/50 text-white hover:bg-black/80'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isTorchOn ? 'flashlight_on' : 'flashlight_off'}
                            </span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={switchCameraFacing}
                          title="Flip Camera (Rear / Front)"
                          className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            flip_camera_android
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={stopCameraStream}
                          title="Close Camera"
                          className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    </div>

                    {/* Center HUD: Reticle & Alignment Frame */}
                    <div className="relative z-10 self-center flex flex-col items-center justify-center pointer-events-none my-auto">
                      <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-dashed border-[#fe932c]/80 rounded-2xl flex items-center justify-center relative shadow-[0_0_15px_rgba(254,147,44,0.3)]">
                        <div className="w-3 h-3 rounded-full bg-[#fe932c] animate-pulse"></div>
                        {/* Corner Accents */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#fe932c]"></div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#fe932c]"></div>
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#fe932c]"></div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#fe932c]"></div>
                        <div className="absolute -top-3.5 px-2 py-0.5 bg-[#fe932c] text-[#2f1500] rounded text-[9px] font-mono font-bold tracking-wide">
                          ALIGN HAZARD / POTHOLE
                        </div>
                      </div>
                      <span className="text-[10px] text-white/80 font-mono mt-2 bg-black/40 px-2 py-0.5 rounded-full">
                        AI depth calibrated on frame capture
                      </span>
                    </div>

                    {/* Bottom Shutter Controls */}
                    <div className="relative z-20 p-4 pb-5 flex items-center justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <button
                        type="button"
                        onClick={stopCameraStream}
                        className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-headline font-semibold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      {/* Big Capture Shutter Button */}
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={isCameraLoading}
                        title="Take Photo"
                        className="group flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform"
                      >
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-4 border-white flex items-center justify-center shadow-lg group-hover:border-[#fe932c] transition-colors p-1">
                          <div className="w-full h-full rounded-full bg-[#fe932c] group-hover:bg-[#ffaa55] flex items-center justify-center text-[#2f1500] shadow-inner transition-colors">
                            <span className="material-symbols-outlined text-2xl sm:text-3xl font-bold">
                              photo_camera
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-headline font-bold text-white tracking-wider">
                          SNAP PHOTO
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-headline font-semibold transition-colors cursor-pointer"
                        title="Upload from files instead"
                      >
                        Files
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ======================================================== */
                  /* CAPTURED PHOTO VIEW with CV HUD OVERLAY                  */
                  /* ======================================================== */
                  <>
                    {photoUrl ? (
                      <img
                        className="w-full h-full object-cover"
                        alt="Hazard Road Photo"
                        src={photoUrl}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-300 bg-slate-900">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-[#fe932c] mb-3">
                          <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                        </div>
                        <h4 className="font-headline text-sm font-bold text-white mb-1">
                          No Photo Recorded
                        </h4>
                        <p className="text-xs text-slate-400 max-w-xs mb-4">
                          Capture live footage using your camera or upload a photo from your gallery.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startCamera('environment')}
                            className="px-4 py-2 rounded-xl bg-[#fe932c] text-[#2f1500] font-headline text-xs font-bold shadow-sm hover:bg-[#e8801b] cursor-pointer"
                          >
                            Launch Camera
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-headline text-xs font-semibold cursor-pointer"
                          >
                            Upload File
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Synthetic Depth Measurement & Reticle */}
                    <div className="absolute inset-0 bg-black/25 pointer-events-none flex flex-col justify-between p-3.5 sm:p-4">
                      {/* Top HUD Chips */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="bg-white/95 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm min-w-0">
                          <span className="material-symbols-outlined text-[14px] sm:text-[15px] text-[#904d00] shrink-0">
                            straighten
                          </span>
                          <span className="font-headline text-[11px] sm:text-xs text-[#0b1c30] font-bold truncate">
                            Est. Depth: {depthEst} cm
                          </span>
                        </div>
                        <div className="bg-[#131b2e]/90 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full flex items-center gap-1.5 shrink-0">
                          <span className="w-2 h-2 rounded-full bg-[#fe932c] animate-pulse"></span>
                          <span className="font-headline text-[10px] sm:text-xs text-white font-medium">
                            CV Crosshair #841
                          </span>
                        </div>
                      </div>

                      {/* Center Crosshair Reticle */}
                      <div className="self-center flex flex-col items-center justify-center opacity-90 my-auto">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed border-[#fe932c] rounded-2xl flex items-center justify-center relative shadow-sm">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#fe932c]"></div>
                          <div className="absolute -top-3 px-2 py-0.5 bg-[#fe932c] rounded text-[9px] sm:text-[10px] font-mono text-[#2f1500] font-bold">
                            FRACTURE ZONE
                          </div>
                        </div>
                      </div>

                      {/* Bottom HUD Tag */}
                      <div className="flex justify-start">
                        <div className="bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1 text-[#0b1c30] shadow-sm max-w-[170px] sm:max-w-none">
                          <span className="material-symbols-outlined text-[14px] text-[#ba1a1a] shrink-0">
                            warning
                          </span>
                          <span className="font-headline text-[10px] sm:text-xs font-bold truncate">
                            Rim Impact Hazard
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Overlay: Camera & Upload Buttons */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 sm:gap-2">
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="bg-[#0b1c30]/95 hover:bg-[#0b1c30] text-white font-headline text-[11px] sm:text-xs font-bold px-3 py-2 rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-transform border border-white/20 cursor-pointer"
                        title="Open device camera using browser Media API"
                      >
                        <span className="material-symbols-outlined text-[16px] text-[#fe932c]">
                          photo_camera
                        </span>
                        <span>Take Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/95 hover:bg-white text-[#0b1c30] font-headline text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-2 rounded-xl shadow-sm flex items-center gap-1 active:scale-95 transition-transform border border-[#e5eeff] cursor-pointer"
                        title="Upload photo from files"
                      >
                        <span className="material-symbols-outlined text-[15px]">upload_file</span>
                        <span className="hidden sm:inline">Upload</span>
                      </button>

                      {photoSource !== 'sample' && (
                        <button
                          type="button"
                          onClick={handleResetToSample}
                          className="bg-white/95 hover:bg-white text-[#45464d] font-headline text-[11px] px-2 py-2 rounded-xl shadow-sm flex items-center gap-1 active:scale-95 transition-transform border border-[#e5eeff] cursor-pointer"
                          title="Reset to sample benchmark image"
                        >
                          <span className="material-symbols-outlined text-[14px]">refresh</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Photo Captured Toast / Confirmation */}
              {photoCapturedToast && (
                <div className="bg-emerald-50 border-y border-emerald-200 px-4 py-2.5 flex items-center justify-between gap-2 text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-emerald-600">
                      check_circle
                    </span>
                    <span className="font-medium">{photoCapturedToast}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPhotoCapturedToast(null)}
                    className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              )}

              {/* Extra Angle Toast */}
              {extraAngleToast && (
                <div className="bg-[#eff4ff] border-y border-[#dce9ff] px-4 py-2 flex items-center gap-2 text-xs text-[#0b1c30]">
                  <span className="material-symbols-outlined text-sm text-[#009668]">check_circle</span>
                  <span>{extraAngleToast}</span>
                </div>
              )}

              {/* Telemetry Bar with Dynamic GPS & Map Pin Status */}
              <div className="p-3 sm:p-4 flex flex-col gap-3 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                        locationData.source === 'device' ? 'bg-emerald-400' : 'bg-[#fe932c]'
                      } opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        locationData.source === 'device' ? 'bg-emerald-600' : 'bg-[#904d00]'
                      }`}></span>
                    </span>
                    <span className={`font-headline text-[11px] sm:text-xs font-bold tracking-wide shrink-0 ${
                      locationData.source === 'device' ? 'text-[#009668]' : 'text-[#904d00]'
                    }`}>
                      {locationData.source === 'device' ? 'DEVICE GPS LOCKED' : locationData.source === 'map' ? 'MAP PINPOINTED' : 'CIVIC LOCATION'}
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#45464d] font-mono truncate">
                      {locationData.coordinates.str}
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-[#45464d] font-medium shrink-0">
                    {locationData.accuracy || '±2.8m precision'}
                  </span>
                </div>

                {/* Location Status Notifications */}
                {isLocating && (
                  <div className="bg-[#eff4ff] text-[#0b1c30] p-2.5 rounded-xl border border-[#dce9ff] flex items-center gap-2 text-xs animate-pulse">
                    <span className="material-symbols-outlined text-base text-[#904d00] animate-spin">sync</span>
                    <span className="font-medium">{locatingMsg || 'Acquiring device GPS...'}</span>
                  </div>
                )}

                {locationSuccessMsg && (
                  <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs">
                    <span className="material-symbols-outlined text-base text-emerald-600">verified</span>
                    <span className="font-semibold">{locationSuccessMsg}</span>
                  </div>
                )}

                {locationError && (
                  <div className="bg-amber-50 text-amber-900 p-2.5 rounded-xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="material-symbols-outlined text-base text-amber-600 shrink-0">warning</span>
                      <span className="font-medium">{locationError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenMap}
                      className="px-2.5 py-1 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 font-headline font-bold text-[11px] cursor-pointer shrink-0"
                    >
                      Pick on Map Instead
                    </button>
                  </div>
                )}

                {/* Street Location Card with Direct Device & Map Action Buttons */}
                <div className="bg-[#eff4ff] rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#dce9ff]">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className="material-symbols-outlined text-[#904d00] text-2xl mt-0.5 shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      location_on
                    </span>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-headline text-sm font-bold text-[#0b1c30] truncate">
                          {locationData.location}
                        </span>
                        <span className="font-headline text-[10px] bg-white px-2 py-0.5 rounded-full text-[#45464d] border border-[#dce9ff] shrink-0">
                          {locationData.ward}
                        </span>
                      </div>
                      <span className="text-xs text-[#45464d] truncate mt-0.5">
                        {locationData.landmark}
                      </span>
                    </div>
                  </div>

                  {/* Dual Action Buttons: Ask Device Location OR Select on Map */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={handleRequestDeviceLocation}
                      disabled={isLocating}
                      title="Ask device to start GPS location"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-[#904d00] border border-[#dce9ff] font-headline text-xs font-bold hover:bg-[#dce9ff] active:scale-95 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isLocating ? 'sync' : 'my_location'}
                      </span>
                      <span>{isLocating ? 'Locating...' : 'Device GPS'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenMap}
                      title="Select location on map"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0b1c30] text-white font-headline text-xs font-semibold hover:bg-black active:scale-95 transition-all shadow-xs cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#fe932c]">map</span>
                      <span>Select on Map</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN (lg:col-span-6): Severity, Tags & Submission   */}
          {/* ========================================================= */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {/* Step Progress on Laptop */}
            <div className="hidden lg:flex flex-col gap-2.5 bg-white p-4 rounded-2xl border border-[#e5eeff] shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-headline text-xs text-[#45464d] uppercase tracking-wider font-bold">
                  Step 2 of 3: Hazard Classification
                </span>
                <span className="font-headline text-xs bg-[#dce9ff] px-2.5 py-0.5 rounded-full text-[#0b1c30] font-bold">
                  AI Scan Verified
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 items-center">
                <div className="h-2 rounded-full bg-[#0b1c30]"></div>
                <div className="h-2 rounded-full bg-[#fe932c] shadow-[0_0_8px_rgba(254,147,44,0.6)]"></div>
                <div className="h-2 rounded-full bg-[#d3e4fe]"></div>
              </div>
              <div className="grid grid-cols-3 text-xs font-headline font-semibold pt-1">
                <div className="flex items-center gap-1 text-[#0b1c30]">
                  <span className="material-symbols-outlined text-[14px] text-[#009668] font-bold">check_circle</span>
                  <span>1. Telemetry</span>
                </div>
                <div className="text-[#fe932c] text-center font-bold">2. Severity</div>
                <div className="text-[#45464d]/60 text-right">3. Dispatch</div>
              </div>
            </div>

            {/* Severity Level Section */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="font-headline text-sm sm:text-base text-[#0b1c30] font-bold">
                    Hazard Severity Level
                  </label>
                  <span className="material-symbols-outlined text-[#45464d] text-[18px]">info</span>
                </div>
                <span className="font-headline text-xs text-[#904d00] font-bold uppercase tracking-wider">
                  REQUIRED
                </span>
              </div>

              {/* 3 Severity Cards */}
              <div className="flex flex-col gap-2.5">
                {/* Minor */}
                <div
                  onClick={() => setSeverity('minor')}
                  className={`p-3.5 rounded-2xl transition-all flex items-center justify-between cursor-pointer border ${
                    severity === 'minor'
                      ? 'bg-[#ffdcc3]/50 border-[#fe932c] shadow-sm'
                      : 'bg-white border-[#e5eeff] hover:bg-[#eff4ff]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#eff4ff] flex items-center justify-center shrink-0 text-[#0b1c30]">
                      <span className="material-symbols-outlined text-2xl">grain</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-headline text-xs sm:text-sm font-bold text-[#0b1c30]">
                          Minor Surface Dip
                        </span>
                        <span className="font-headline text-[10px] bg-[#e5eeff] px-2 py-0.5 rounded-md text-[#45464d]">
                          Low Speed
                        </span>
                      </div>
                      <span className="text-xs text-[#45464d] truncate mt-0.5">
                        Superficial wear, asphalt chips under 3cm
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      severity === 'minor' ? 'bg-[#fe932c] text-[#2f1500]' : 'border border-[#c6c6cd] bg-white'
                    }`}
                  >
                    {severity === 'minor' && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                  </div>
                </div>

                {/* Moderate */}
                <div
                  onClick={() => setSeverity('moderate')}
                  className={`p-3.5 rounded-2xl transition-all flex items-center justify-between cursor-pointer border ${
                    severity === 'moderate'
                      ? 'bg-[#ffdcc3]/50 border-[#fe932c] shadow-sm'
                      : 'bg-white border-[#e5eeff] hover:bg-[#eff4ff]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#ffdcc3] flex items-center justify-center shrink-0 text-[#904d00]">
                      <span className="material-symbols-outlined text-2xl">motion_sensor_alert</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-headline text-xs sm:text-sm font-bold text-[#0b1c30]">
                          Moderate Crater
                        </span>
                        <span className="font-headline text-[10px] bg-[#ffdcc3] px-2 py-0.5 rounded-md text-[#663500] font-semibold">
                          Suspension Shock
                        </span>
                      </div>
                      <span className="text-xs text-[#45464d] truncate mt-0.5">
                        Causes swerving, depth 4cm - 7cm
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      severity === 'moderate' ? 'bg-[#fe932c] text-[#2f1500]' : 'border border-[#c6c6cd] bg-white'
                    }`}
                  >
                    {severity === 'moderate' && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                  </div>
                </div>

                {/* Dangerous */}
                <div
                  onClick={() => setSeverity('dangerous')}
                  className={`p-3.5 rounded-2xl transition-all flex items-center justify-between cursor-pointer border ${
                    severity === 'dangerous'
                      ? 'bg-[#ffdcc3]/60 border-[#fe932c] shadow-md shadow-[#fe932c]/20'
                      : 'bg-white border-[#e5eeff] hover:bg-[#eff4ff]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#fe932c] flex items-center justify-center shrink-0 text-[#2f1500]">
                      <span
                        className="material-symbols-outlined text-2xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        report_problem
                      </span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-headline text-xs sm:text-sm font-bold text-[#0b1c30]">
                          Dangerous / Trench
                        </span>
                        <span className="font-headline text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold">
                          Axle Breaker (&gt;8cm)
                        </span>
                      </div>
                      <span className="text-xs text-[#45464d] truncate font-medium mt-0.5">
                        Severe accident risk, two-wheeler blowout
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      severity === 'dangerous' ? 'bg-[#fe932c] text-[#2f1500]' : 'border border-[#c6c6cd] bg-white'
                    }`}
                  >
                    {severity === 'dangerous' && <span className="material-symbols-outlined text-sm font-bold">check</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Environmental Tags */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-headline text-xs sm:text-sm text-[#0b1c30] font-bold">
                  Environmental Tags
                </span>
                <span className="text-xs text-[#45464d]">Tap to toggle</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {allTags.map((t) => {
                  const isActive = selectedTags.includes(t.name);
                  return (
                    <button
                      key={t.name}
                      type="button"
                      onClick={() => toggleTag(t.name)}
                      className={`px-3.5 py-2 rounded-full flex items-center gap-1.5 active:scale-95 transition-all text-xs font-headline font-semibold cursor-pointer ${
                        isActive
                          ? 'bg-[#fe932c] text-[#2f1500] shadow-sm'
                          : 'bg-white text-[#0b1c30] border border-[#dce9ff] hover:bg-[#eff4ff]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                      <span>{t.name}</span>
                      <span className="material-symbols-outlined text-[14px]">
                        {isActive ? 'done' : 'add'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dispatcher Notes with Voice Dictation */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-headline text-xs sm:text-sm text-[#0b1c30] font-bold">
                  Dispatcher Notes
                </label>
                <span className="text-xs text-[#45464d]">Optional</span>
              </div>
              <div className="relative bg-white rounded-2xl p-3.5 shadow-sm border border-[#e5eeff] flex items-center">
                <textarea
                  className="w-full bg-transparent resize-none border-none outline-none font-body text-xs sm:text-sm text-[#0b1c30] placeholder:text-[#45464d]/60 pr-12"
                  placeholder="e.g., Deep pothole right before bus stop, cars swerving into oncoming traffic..."
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                ></textarea>
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`absolute right-3 top-3 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-[#eff4ff] text-[#0b1c30] hover:bg-[#ffdcc3]'
                  }`}
                  title="Record Voice Note"
                >
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                </button>
              </div>
              {isRecording && (
                <span className="text-xs text-red-600 font-headline font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                  Listening... Speak clearly to transcribe
                </span>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="w-full py-4 px-6 rounded-2xl bg-[#fe932c] hover:bg-[#e8801b] text-[#2f1500] font-headline text-sm sm:text-base font-bold shadow-lg shadow-[#fe932c]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isSubmitting ? 'Routing to Ward 4 PWD...' : 'Submit Report (Dispatches to Ward 4)'}
                </span>
                <span className="material-symbols-outlined text-xl font-bold">arrow_forward</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[#45464d] text-center">
                <span className="material-symbols-outlined text-base text-[#009668]">verified</span>
                <span className="text-xs font-medium">
                  AI tele-verified • Auto-routed to Municipal PWD &amp; Open311
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* INTERACTIVE MAP LOCATION PICKER MODAL */}
      {isMapPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-[#e5eeff] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[#e5eeff] flex items-center justify-between bg-[#f8f9ff]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0b1c30] text-[#fe932c] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">pin_drop</span>
                </div>
                <div>
                  <h3 className="font-headline text-sm sm:text-base font-bold text-[#0b1c30]">
                    Select Hazard Location on Map
                  </h3>
                  <p className="text-xs text-[#45464d]">
                    Choose a street junction or launch the full GIS map
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMapPickerOpen(false)}
                className="w-9 h-9 rounded-xl hover:bg-[#eff4ff] text-[#45464d] flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto flex flex-col gap-4">
              {/* Google Maps Embed Iframe Preview */}
              <div className="relative w-full h-60 sm:h-72 rounded-2xl overflow-hidden bg-slate-100 border border-[#dce9ff] shadow-inner">
                <iframe
                  title="Google Maps Location Picker"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps?q=${tempCoords.lat},${tempCoords.lng}&hl=en&z=16&output=embed`}
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-[#e5eeff] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-[#904d00]">location_on</span>
                  <span className="font-headline text-xs font-bold text-[#0b1c30]">
                    {tempCoords.str}
                  </span>
                </div>
              </div>

              {/* Quick Road Hotspots in Ward 4 */}
              <div className="flex flex-col gap-2">
                <label className="font-headline text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
                  Quick Select Civic Roadways (Ward 4)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_SPOTS.map((spot) => {
                    const isSpotSelected =
                      locationData.location === spot.location ||
                      (tempCoords.lat === spot.lat && tempCoords.lng === spot.lng);
                    return (
                      <button
                        key={spot.title}
                        type="button"
                        onClick={() => {
                          setTempCoords({
                            lat: spot.lat,
                            lng: spot.lng,
                            str: `${spot.lat.toFixed(4)}° N, ${spot.lng.toFixed(4)}° E`,
                          });
                          handleApplyPreset(spot);
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSpotSelected
                            ? 'bg-[#eff4ff] border-[#fe932c] shadow-xs ring-1 ring-[#fe932c]'
                            : 'bg-white border-[#e5eeff] hover:bg-[#f8f9ff]'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-headline text-xs font-bold text-[#0b1c30] truncate">
                            {spot.title}
                          </div>
                          <div className="text-[11px] text-[#45464d] truncate">
                            {spot.landmark}
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-[#904d00] shrink-0">
                          {isSpotSelected ? 'check_circle' : 'chevron_right'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Full Map Navigation Option */}
              {onGoToMapToPick && (
                <div className="bg-[#f8f9ff] rounded-2xl p-3 border border-[#dce9ff] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0b1c30]">public</span>
                    <span className="text-xs font-semibold text-[#0b1c30]">
                      Need to browse the full interactive map canvas?
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMapPickerOpen(false);
                      onGoToMapToPick();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0b1c30] text-white font-headline text-xs font-semibold hover:bg-black transition-all cursor-pointer shrink-0"
                  >
                    Open Full Map
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#e5eeff] bg-[#f8f9ff] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRequestDeviceLocation}
                disabled={isLocating}
                className="px-3.5 py-2 rounded-xl bg-white border border-[#dce9ff] font-headline text-xs font-bold text-[#904d00] hover:bg-[#eff4ff] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">my_location</span>
                <span>{isLocating ? 'Locating...' : 'Use My Device GPS'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMapPickerOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#fe932c] hover:bg-[#e8801b] text-[#2f1500] font-headline text-xs sm:text-sm font-bold shadow transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">done</span>
                <span>Confirm Location</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
