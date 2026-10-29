import React, { useState, useEffect } from 'react';
import { ScreenType, HazardTicket } from '../types';
import { ASSETS } from '../data/mockData';
import { api } from '../services/api';

interface MapScreenProps {
  onNavigate: (screen: ScreenType) => void;
  tickets: HazardTicket[];
  selectedTicketId: string;
  onSelectTicket: (id: string) => void;
  isPickingLocationForReport?: boolean;
  onConfirmLocationForReport?: (loc: {
    location: string;
    landmark: string;
    ward: string;
    coordinates: { lat: number; lng: number; str: string };
  }) => void;
  onCancelPickingLocation?: () => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  onNavigate,
  tickets,
  selectedTicketId,
  onSelectTicket,
  isPickingLocationForReport = false,
  onConfirmLocationForReport,
  onCancelPickingLocation,
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'repair' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [mapLayer, setMapLayer] = useState<'standard' | 'satellite'>('standard');
  const [activeTab, setActiveTab] = useState<'map' | 'reports' | 'leaderboard'>('map');
  const [isRecentering, setIsRecentering] = useState(false);
  const [isLaptopLayout, setIsLaptopLayout] = useState(false);
  const [mapEngine, setMapEngine] = useState<'google' | 'vector'>('google');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 19.2431, lng: 73.1342 });
  const [mapZoom, setMapZoom] = useState(15);

  useEffect(() => {
    const checkSize = () => {
      setIsLaptopLayout(window.innerWidth >= 1024);
    };
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  const handleRecenter = () => {
    setIsRecentering(true);
    setMapCenter({ lat: 19.2431, lng: 73.1342 });
    setMapZoom(15);
    setTimeout(() => setIsRecentering(false), 600);
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'critical') return t.severity === 'dangerous';
    if (filter === 'repair') return t.status === 'dispatched';
    if (filter === 'resolved') return t.status === 'repaired';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col selection:bg-[#fe932c] selection:text-[#663500]">
      {/* LAPTOP / DESKTOP RESPONSIVE HEADER BAR */}
      <header className="w-full bg-white/95 backdrop-blur-xl border-b border-[#e5eeff] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 z-40 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#fe932c] flex items-center justify-center text-[#2f1500] shadow-sm group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[20px] font-bold">minor_crash</span>
            </div>
            <div>
              <span className="font-headline text-lg sm:text-xl font-bold text-[#0b1c30] leading-none block">
                RoadWatch
              </span>
              <span className="text-[10px] text-[#45464d] font-medium hidden sm:inline">
                Live Spatial Hazard Telemetry
              </span>
            </div>
          </button>

          <div className="hidden sm:inline-flex items-center gap-1.5 bg-[#dce9ff] px-2.5 py-1 rounded-full shadow-sm ml-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fe932c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#904d00]"></span>
            </span>
            <span className="font-headline text-[10px] text-[#0b1c30] font-bold tracking-wide uppercase">
              18 Wards Active
            </span>
          </div>
        </div>

        {/* Global Search & Filter in Header on Laptop */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative flex items-center w-full shadow-sm rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
            <span className="material-symbols-outlined text-[#76777d] ml-3 text-[18px] pointer-events-none">
              search
            </span>
            <input
              className="w-full bg-transparent py-2 pl-2 pr-10 font-body text-xs text-[#0b1c30] placeholder:text-[#76777d] focus:outline-none"
              placeholder="Search street, ward, or hazard ID..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              onClick={handleRecenter}
              className="absolute right-1 w-7 h-7 rounded-lg bg-white text-[#904d00] flex items-center justify-center shadow-xs"
              title="Locate me"
            >
              <span className="material-symbols-outlined text-[16px]">my_location</span>
            </button>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('report')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-[#fe932c] text-[#2f1500] font-headline text-xs font-bold shadow-sm hover:bg-[#e8801b] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base font-bold">add</span>
            <span className="hidden sm:inline">Report Pothole</span>
            <span className="sm:hidden">Report</span>
          </button>

          <button
            onClick={() => onNavigate('ops')}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#131b2e] text-white font-headline text-xs font-semibold hover:bg-black transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-[#fe932c]">shield</span>
            <span>Ops View</span>
          </button>
        </div>
      </header>

      {/* Location Picker Banner when selecting location for report */}
      {isPickingLocationForReport && (
        <div className="bg-[#fe932c] text-[#2f1500] px-4 py-3 flex items-center justify-between shadow-md z-40 border-b border-[#e8801b]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-2xl font-bold shrink-0">location_searching</span>
            <div className="min-w-0">
              <span className="font-headline text-xs sm:text-sm font-bold block sm:inline">
                Selecting Location for Hazard Report
              </span>
              <span className="text-[11px] sm:text-xs opacity-90 sm:ml-2">
                Click any incident marker or road hotspot to pick your location
              </span>
            </div>
          </div>
          <button
            onClick={onCancelPickingLocation}
            className="px-3 py-1.5 rounded-xl bg-black/15 hover:bg-black/25 text-[#2f1500] font-headline text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Cancel &amp; Return
          </button>
        </div>
      )}

      {/* MOBILE-ONLY SEARCH & QUICK FILTER PILLS */}
      <div className="md:hidden px-4 pt-2.5 pb-2 flex flex-col gap-2 bg-white border-b border-[#e5eeff]">
        <div className="relative flex items-center w-full shadow-sm rounded-xl bg-[#eff4ff] border border-[#dce9ff]">
          <span className="material-symbols-outlined text-[#76777d] ml-3 text-[18px] pointer-events-none">
            search
          </span>
          <input
            className="w-full bg-transparent py-2 pl-2 pr-10 font-body text-xs text-[#0b1c30] placeholder:text-[#76777d] focus:outline-none"
            placeholder="Search street, ward or locality..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={handleRecenter}
            className="absolute right-1 w-7 h-7 rounded-lg bg-white text-[#904d00] flex items-center justify-center shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">my_location</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setFilter('all')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-headline transition-all cursor-pointer ${filter === 'all'
              ? 'bg-[#131b2e] text-white shadow-sm font-semibold'
              : 'bg-white text-[#0b1c30] border border-[#dce9ff] shadow-sm'
              }`}
          >
            <span>All Hazards ({tickets.length})</span>
          </button>

          <button
            onClick={() => setFilter('critical')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-headline transition-all cursor-pointer ${filter === 'critical'
              ? 'bg-[#131b2e] text-white shadow-sm font-semibold'
              : 'bg-white text-[#0b1c30] border border-[#dce9ff] shadow-sm'
              }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
            <span>Critical Potholes ({tickets.filter((t) => t.severity === 'dangerous').length})</span>
          </button>

          <button
            onClick={() => setFilter('repair')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-headline transition-all cursor-pointer ${filter === 'repair'
              ? 'bg-[#131b2e] text-white shadow-sm font-semibold'
              : 'bg-white text-[#0b1c30] border border-[#dce9ff] shadow-sm'
              }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#fe932c]"></span>
            <span>Under Repair ({tickets.filter((t) => t.status === 'dispatched').length})</span>
          </button>

          <button
            onClick={() => setFilter('resolved')}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-headline transition-all cursor-pointer ${filter === 'resolved'
              ? 'bg-[#131b2e] text-white shadow-sm font-semibold'
              : 'bg-white text-[#0b1c30] border border-[#dce9ff] shadow-sm'
              }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#009668]"></span>
            <span>Resolved Today ({tickets.filter((t) => t.status === 'repaired').length})</span>
          </button>
        </div>
      </div>

      {/* MAIN BODY: ADAPTS RESPONSIVELY TO MOBILE OR LAPTOP */}
      <div className="flex-1 w-full flex flex-col lg:flex-row relative overflow-hidden min-h-[calc(100vh-65px)]">
        {/* LAPTOP LEFT SIDEBAR: INCIDENT FEED LIST (visible on lg+) */}
        <div className="hidden lg:flex w-88 xl:w-96 bg-white border-r border-[#e5eeff] flex-col shrink-0 overflow-hidden shadow-sm z-20">
          <div className="p-4 border-b border-[#e5eeff] bg-[#eff4ff]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-headline text-xs font-bold uppercase tracking-wider text-[#0b1c30]">
                Incident Stream (Ward 4)
              </span>
              <span className="font-headline text-xs font-bold text-[#904d00] bg-white px-2 py-0.5 rounded-full border border-[#dce9ff]">
                {filteredTickets.length} Active
              </span>
            </div>

            {/* Laptop Filter Tabs */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setFilter('all')}
                className={`py-1.5 px-2 rounded-lg text-xs font-headline font-semibold transition-all ${filter === 'all'
                  ? 'bg-[#131b2e] text-white shadow-xs'
                  : 'bg-white text-[#0b1c30] hover:bg-[#dce9ff] border border-[#dce9ff]'
                  }`}
              >
                All Hazards
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`py-1.5 px-2 rounded-lg text-xs font-headline font-semibold transition-all ${filter === 'critical'
                  ? 'bg-[#131b2e] text-white shadow-xs'
                  : 'bg-white text-[#0b1c30] hover:bg-[#dce9ff] border border-[#dce9ff]'
                  }`}
              >
                Critical Potholes
              </button>
            </div>
          </div>

          {/* List of Incidents */}
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 custom-scroll">
            {filteredTickets.length === 0 ? (
              <div className="p-6 flex flex-col items-center justify-center text-center text-[#76777d] my-auto">
                <span className="material-symbols-outlined text-3xl mb-1 text-[#904d00]">check_circle</span>
                <span className="font-headline text-xs font-bold text-[#0b1c30]">No Incidents in Queue</span>
                <span className="text-[11px] mt-1">No potholes reported matching current filter.</span>
              </div>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket && t.id === selectedTicket.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTicket(t.id)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all border ${isSelected
                      ? 'bg-[#eff4ff] border-[#fe932c] shadow-sm ring-1 ring-[#fe932c]/50'
                      : 'bg-white border-[#e5eeff] hover:bg-[#f8f9ff]'
                      }`}
                  >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-headline font-bold uppercase ${t.severity === 'dangerous'
                        ? 'bg-red-100 text-red-700'
                        : t.severity === 'moderate'
                          ? 'bg-[#ffdcc3] text-[#663500]'
                          : 'bg-[#e5eeff] text-[#0b1c30]'
                        }`}
                    >
                      {t.severity === 'dangerous' ? 'Grade 3 Severe' : 'Moderate'}
                    </span>
                    <span className="font-mono text-xs text-[#76777d]">{t.reportedTimeAgo}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#dce9ff] border border-[#e5eeff]">
                      <img className="w-full h-full object-cover" alt={t.title} src={t.imageUrl} />
                      <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] font-bold text-center">
                        {t.depthCm}cm
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-headline text-xs font-bold text-[#0b1c30] truncate">
                        {t.title}
                      </h4>
                      <p className="text-[11px] text-[#45464d] truncate mt-0.5">{t.location}</p>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="text-[#009668] font-semibold">Scheduled 14:00</span>
                        <span className="text-[#76777d]">{t.corroborations} signals</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          </div>

          <div className="p-3 border-t border-[#e5eeff] bg-white flex items-center justify-between">
            <button
              onClick={() => onNavigate('tracking')}
              className="w-full py-2 px-3 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] font-headline text-xs font-bold transition-all text-center border border-[#dce9ff]"
            >
              Open Full Tracking Timeline →
            </button>
          </div>
        </div>

        {/* MAP CANVAS VIEWPORT (expands to 100% width on both mobile and laptop) */}
        <div className="flex-1 relative bg-[#dce9ff] overflow-hidden select-none min-h-[480px]">
          {/* Engine indicator chip */}
          <div className="absolute left-3 sm:left-6 top-3 sm:top-6 z-30 flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-[#e5eeff] flex items-center gap-1.5 text-[#0b1c30]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-headline text-[10px] font-bold">
                {mapEngine === 'google' ? 'Google Maps Live Embed Active' : 'GIS Vector Blueprint'}
              </span>
            </div>
          </div>

          {mapEngine === 'google' ? (
            /* RESPONSIVE GOOGLE MAPS EMBED IFRAME (Zero API Key / Quota Required) */
            <div className="absolute inset-0 w-full h-full flex flex-col bg-slate-100">
              <iframe
                title="Google Maps Pothole & Road Hazard Live GIS Embed"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  selectedTicket ? `${selectedTicket.coordinates.lat},${selectedTicket.coordinates.lng}` : '19.2431,73.1342'
                )}&z=${mapZoom}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full flex-1"
              />
            </div>
          ) : (
            /* SVG Map Graphics */
            <svg
              className="absolute inset-0 w-full h-full select-none"
              preserveAspectRatio="xMidYMid slice"
              viewBox="0 0 390 580"
            >
              {/* Background Urban Blocks */}
              <rect fill={mapLayer === 'satellite' ? '#1e293b' : '#eff4ff'} height="100%" width="100%"></rect>

              {/* Green / Park Reserves */}
              <path
                d="M -10,340 C 40,320 80,360 110,410 C 130,445 100,500 70,530 C 20,580 -20,540 -30,480 Z"
                fill={mapLayer === 'satellite' ? '#14532d' : '#dae2fd'}
                opacity="0.7"
              ></path>
              <path
                d="M 280,-20 C 310,40 370,60 410,50 L 410,-20 Z"
                fill={mapLayer === 'satellite' ? '#14532d' : '#dae2fd'}
                opacity="0.7"
              ></path>

              {/* Waterway Canal */}
              <path
                d="M 400,210 C 290,230 210,180 140,240 C 80,290 60,370 -20,400"
                fill="none"
                stroke="#cbdbf5"
                strokeLinecap="round"
                strokeWidth="18"
              ></path>
              <path
                d="M 400,210 C 290,230 210,180 140,240 C 80,290 60,370 -20,400"
                fill="none"
                stroke="#d3e4fe"
                strokeLinecap="round"
                strokeWidth="8"
              ></path>

              {/* Minor Street Network */}
              <g stroke={mapLayer === 'satellite' ? '#475569' : '#ffffff'} strokeLinecap="round" strokeWidth="6">
                <line x1="-20" x2="410" y1="90" y2="90"></line>
                <line x1="-20" x2="410" y1="160" y2="160"></line>
                <line x1="-20" x2="260" y1="280" y2="280"></line>
                <line x1="120" x2="410" y1="280" y2="300"></line>
                <line x1="-20" x2="410" y1="470" y2="470"></line>
                <line x1="60" x2="60" y1="-10" y2="600"></line>
                <line x1="310" x2="310" y1="-10" y2="600"></line>
                <line x1="200" x2="200" y1="90" y2="470"></line>
              </g>

              {/* Arterial Avenues */}
              <g stroke={mapLayer === 'satellite' ? '#64748b' : '#ffffff'} strokeLinecap="round" strokeWidth="12">
                <path d="M -10,380 L 150,330 L 260,200 L 410,150"></path>
                <path d="M 160,-20 L 160,260 L 250,420 L 270,600"></path>
              </g>

              {/* Arterial Inner Road Treads */}
              <g stroke={mapLayer === 'satellite' ? '#334155' : '#e5eeff'} strokeLinecap="round" strokeWidth="8">
                <path d="M -10,380 L 150,330 L 260,200 L 410,150"></path>
                <path d="M 160,-20 L 160,260 L 250,420 L 270,600"></path>
              </g>

              {/* Centerlines */}
              <g stroke="#bec6e0" strokeDasharray="4,4" strokeWidth="1.2">
                <path d="M -10,380 L 150,330 L 260,200 L 410,150"></path>
                <path d="M 160,-20 L 160,260 L 250,420 L 270,600"></path>
              </g>

              {/* Street Typography */}
              <text fill="#7c839b" fontFamily="Geist" fontSize="9" fontWeight="600" letterSpacing="0.8" x="80" y="84">
                GRAND CENTRAL AVE
              </text>
              <text
                fill="#7c839b"
                fontFamily="Geist"
                fontSize="9"
                fontWeight="600"
                letterSpacing="0.8"
                transform="rotate(90 170 52)"
                x="170"
                y="52"
              >
                M.G. ROAD
              </text>
              <text fill="#7c839b" fontFamily="Geist" fontSize="9" fontWeight="600" letterSpacing="0.8" x="210" y="274">
                MARKET STREET
              </text>
              <text fill="#7c839b" fontFamily="Geist" fontSize="8" fontWeight="500" letterSpacing="0.6" x="22" y="464">
                WARD 4 CORRIDOR
              </text>
              <text fill="#005236" fontFamily="Geist" fontSize="8.5" fontWeight="600" letterSpacing="0.5" x="28" y="520">
                VICTORIA BOTANIC PARK
              </text>

              {/* Active User GPS Beacon */}
              <g transform="translate(160, 310)">
                <circle fill="#fe932c" fillOpacity="0.22" r="20">
                  <animate attributeName="r" dur="2.4s" repeatCount="indefinite" values="10;22;10" />
                  <animate attributeName="fill-opacity" dur="2.4s" repeatCount="indefinite" values="0.25;0.05;0.25" />
                </circle>
                <circle fill="#fe932c" r="6" />
                <circle fill="#ffffff" r="2.5" />
              </g>
            </svg>
          )}

          {/* Density Heatmap Overlay */}
          {showHeatmap && (
            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply bg-gradient-to-tr from-[#fe932c]/30 via-transparent to-[#ba1a1a]/25 transition-opacity"></div>
          )}

          {/* Floating Map HUD Control Stack */}
          <div className="absolute right-3 sm:right-6 top-3 sm:top-6 flex flex-col gap-2 z-30">
            {/* Toggle Google Maps vs Vector */}
            <button
              onClick={() => setMapEngine(mapEngine === 'google' ? 'vector' : 'google')}
              className={`w-10 h-10 rounded-xl backdrop-blur-md shadow-md flex items-center justify-center transition-all cursor-pointer ${mapEngine === 'google' ? 'bg-[#4285F4] text-white ring-2 ring-blue-300' : 'bg-white/95 text-[#0b1c30]'
                }`}
              title={mapEngine === 'google' ? 'Switch to Vector Blueprint' : 'Switch to Google Maps'}
            >
              <span className="material-symbols-outlined text-[20px]">public</span>
            </button>

            <button
              onClick={() => setMapLayer(mapLayer === 'standard' ? 'satellite' : 'standard')}
              className={`w-10 h-10 rounded-xl backdrop-blur-md shadow-md flex items-center justify-center transition-all cursor-pointer ${mapLayer === 'satellite' ? 'bg-[#131b2e] text-white' : 'bg-white/95 text-[#0b1c30]'
                }`}
              title="Toggle Layer"
            >
              <span className="material-symbols-outlined text-[20px]">layers</span>
            </button>

            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`w-10 h-10 rounded-xl backdrop-blur-md shadow-md flex items-center justify-center transition-all cursor-pointer ${showHeatmap ? 'bg-white/95 text-[#fe932c]' : 'bg-white/95 text-[#76777d]'
                }`}
              title="Toggle Heatmap"
            >
              <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
            </button>

            <button
              onClick={handleRecenter}
              className={`w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md text-[#0b1c30] shadow-md flex items-center justify-center transition-all cursor-pointer ${isRecentering ? 'animate-spin' : ''
                }`}
              title="Recenter GPS"
            >
              <span className="material-symbols-outlined text-[20px]">gps_fixed</span>
            </button>
          </div>

          {/* Vector Map Pins (Only rendered when in vector mode) */}
          {mapEngine === 'vector' && (
            <>
              {filteredTickets.map((t, idx) => {
                const isSelected = selectedTicket && t.id === selectedTicket.id;
                const offsetX = 200 + (t.coordinates.lng - 73.1342) * 22000;
                const offsetY = 250 - (t.coordinates.lat - 19.2431) * 22000;
                const x = Math.max(40, Math.min(350, offsetX || 134 + (idx * 50) % 200));
                const y = Math.max(80, Math.min(480, offsetY || 200 + (idx * 60) % 220));

                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTicket(t.id)}
                    style={{ left: `${x}px`, top: `${y}px` }}
                    className={`absolute -translate-x-1/2 -translate-y-full cursor-pointer transition-transform ${
                      isSelected ? 'z-30 scale-110' : 'z-20 hover:scale-105'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-1 bg-[#131b2e] text-white px-2 py-0.5 rounded-full shadow-md text-[10px] font-headline font-semibold whitespace-nowrap">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        t.severity === 'dangerous' ? 'bg-[#ba1a1a]' : t.severity === 'moderate' ? 'bg-[#fe932c]' : 'bg-[#009668]'
                      }`}></span>
                      <span>{t.id} ({t.depthCm}cm)</span>
                    </div>
                    <div className={`relative mx-auto w-7 h-7 rounded-full text-white flex items-center justify-center shadow-md ring-2 ring-white ${
                      t.severity === 'dangerous' ? 'bg-[#ba1a1a]' : t.severity === 'moderate' ? 'bg-[#fe932c]' : 'bg-[#009668]'
                    }`}>
                      <span className="material-symbols-outlined text-[15px]">
                        {t.severity === 'dangerous' ? 'warning' : t.status === 'repaired' ? 'check' : 'pin_drop'}
                      </span>
                    </div>
                    <div className="w-0.5 h-1.5 bg-[#131b2e] mx-auto"></div>
                  </div>
                );
              })}
            </>
          )}

          {/* Floating Bottom Hazard Inspector Card */}
          <div className="absolute left-3 right-3 sm:left-6 sm:right-auto sm:w-[420px] bottom-3 sm:bottom-6 z-30">
            {selectedTicket ? (
              <div className="bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-xl border border-[#e5eeff] flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6ffbbe] text-[#002113] font-headline text-[9px] sm:text-[10px] font-bold shrink-0">
                      <span className="material-symbols-outlined text-[12px]">near_me</span>
                      Active Hazard
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#fe932c] text-[#663500] font-headline text-[9px] sm:text-[10px] font-bold truncate max-w-[130px] sm:max-w-none">
                      {selectedTicket.severityLabel || 'Severe (Grade 3)'}
                    </span>
                  </div>
                  <span className="font-headline text-[10px] text-[#76777d] font-bold tracking-wide shrink-0">
                    ID {selectedTicket.id}
                  </span>
                </div>

                {/* Middle Body */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 bg-[#dce9ff] shadow-sm border border-[#e5eeff] flex items-center justify-center">
                    {selectedTicket.imageUrl ? (
                      <img
                        className="w-full h-full object-cover"
                        alt={selectedTicket.title}
                        src={selectedTicket.imageUrl}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-2xl text-slate-400">photo</span>
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-[#131b2e]/85 backdrop-blur-xs py-0.5 text-center">
                      <span className="font-headline text-[9px] text-white font-bold tracking-tight">
                        {selectedTicket.depthCm}cm Depth
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <h2 className="font-headline text-xs sm:text-base font-bold text-[#0b1c30] truncate">
                      {selectedTicket.title}
                    </h2>
                    <p className="font-body text-[11px] sm:text-xs text-[#45464d] truncate mt-0.5">
                      {selectedTicket.location}
                    </p>
                    <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#904d00] w-fit max-w-full border border-[#dce9ff]">
                      <span className="material-symbols-outlined text-[13px] shrink-0">settings</span>
                      <span className="font-headline text-[9px] sm:text-[10px] font-semibold truncate">
                        {selectedTicket.statusLabel || 'Report Logged'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-2 flex flex-col gap-2 border-t border-[#e5eeff]">
                  {isPickingLocationForReport ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (onConfirmLocationForReport) {
                          onConfirmLocationForReport({
                            location: selectedTicket.location,
                            landmark: selectedTicket.landmark,
                            ward: selectedTicket.ward,
                            coordinates: selectedTicket.coordinates,
                          });
                        }
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#fe932c] hover:bg-[#e8801b] text-[#2f1500] font-headline text-xs sm:text-sm font-bold shadow-md shadow-[#fe932c]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <span className="material-symbols-outlined text-[18px] font-bold">check_circle</span>
                      <span>Use this Location for Hazard Report</span>
                    </button>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[#76777d] min-w-0">
                        <span className="material-symbols-outlined text-[14px] shrink-0">group</span>
                        <span className="font-headline text-[10px] sm:text-[11px] truncate">
                          {selectedTicket.corroborations} commuters • {selectedTicket.ward}
                        </span>
                      </div>
                      <button
                        onClick={() => onNavigate('tracking')}
                        className="inline-flex items-center gap-1 font-headline text-[11px] sm:text-xs font-bold text-[#904d00] hover:underline cursor-pointer shrink-0"
                      >
                        <span>View Live Tracking</span>
                        <span className="material-symbols-outlined text-xs sm:text-sm">arrow_forward</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-[#e5eeff] flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#fe932c]">info</span>
                  <span className="font-headline text-xs sm:text-sm font-bold text-[#0b1c30]">
                    Sector Clear • No Hazards Reported
                  </span>
                </div>
                <p className="font-body text-xs text-[#45464d]">
                  No active road damage reports found in this sector. Tap below to log a new hazard report.
                </p>
                <button
                  onClick={() => onNavigate('report')}
                  className="mt-1 w-full py-2.5 px-4 rounded-xl bg-[#fe932c] hover:bg-[#e8801b] text-[#2f1500] font-headline text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  Report Pothole
                </button>
              </div>
            )}
          </div>

          {/* Floating Action Button (+) on mobile positioned safely above inspector card */}
          <div className="sm:hidden absolute bottom-[185px] right-3 z-40">
            <button
              onClick={() => onNavigate('report')}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-[#fe932c] text-[#2f1500] shadow-[0_4px_16px_rgba(254,147,44,0.45)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Report Pothole"
            >
              <span className="material-symbols-outlined text-[26px] font-bold">add</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (hidden on laptop lg+; profile taken out for clean spacing) */}
      <nav className="lg:hidden w-full h-15 bg-[#f8f9ff]/95 backdrop-blur-xl border-t border-[#e5eeff] px-2 flex items-center justify-around z-40 sticky bottom-0">
        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${activeTab === 'map' ? 'text-[#904d00] font-bold' : 'text-[#45464d]'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">map</span>
          <span className="font-headline text-[10px] sm:text-[11px] mt-0.5">Map</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('reports');
            onNavigate('tracking');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${activeTab === 'reports' ? 'text-[#904d00] font-bold' : 'text-[#45464d]'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">assignment</span>
          <span className="font-headline text-[10px] sm:text-[11px] mt-0.5">My Reports</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('leaderboard');
            onNavigate('landing');
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer transition-colors ${activeTab === 'leaderboard' ? 'text-[#904d00] font-bold' : 'text-[#45464d]'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">leaderboard</span>
          <span className="font-headline text-[10px] sm:text-[11px] mt-0.5">Leaderboard</span>
        </button>
      </nav>
    </div>
  );
};
