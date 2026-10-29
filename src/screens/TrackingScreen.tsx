import React, { useState } from 'react';
import { ScreenType, HazardTicket } from '../types';
import { ASSETS } from '../data/mockData';
import { api } from '../services/api';

interface TrackingScreenProps {
  onNavigate: (screen: ScreenType) => void;
  ticket: HazardTicket | null;
}

export const TrackingScreen: React.FC<TrackingScreenProps> = ({ onNavigate, ticket }) => {
  const [mediaMode, setMediaMode] = useState<'citizen' | 'telemetry'>('citizen');
  const [voteSubmitted, setVoteSubmitted] = useState<string | null>(null);
  const [commuterCount, setCommuterCount] = useState(ticket?.corroborations || 1);
  const [subscribed, setSubscribed] = useState(true);

  if (!ticket) {
    return (
      <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#eff4ff] text-[#904d00] flex items-center justify-center mb-4 border border-[#dce9ff]">
          <span className="material-symbols-outlined text-3xl">wrong_location</span>
        </div>
        <h2 className="font-headline text-xl font-bold mb-2">No Ticket Selected</h2>
        <p className="text-sm text-[#45464d] max-w-sm mb-6">
          There are currently no active tickets selected. Report a pothole or choose one from the live GIS map to track repair progress.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('map')}
            className="px-5 py-2.5 rounded-xl bg-[#fe932c] text-[#2f1500] font-headline text-sm font-bold shadow-sm hover:bg-[#e8801b] cursor-pointer"
          >
            Go to Live Map
          </button>
          <button
            onClick={() => onNavigate('report')}
            className="px-5 py-2.5 rounded-xl bg-[#131b2e] text-white font-headline text-sm font-bold shadow-sm hover:bg-black cursor-pointer"
          >
            Report Hazard
          </button>
        </div>
      </div>
    );
  }

  const handleVote = async (type: 'danger' | 'fixed') => {
    if (voteSubmitted) return;
    setVoteSubmitted(type);
    if (type === 'danger') {
      setCommuterCount((prev) => prev + 1);
    }
    await api.voteTicket(ticket.id, type);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `RoadWatch ${ticket.id}`,
        text: `Live tracking for ${ticket.location}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      alert(`Tracking Link copied for ${ticket.id}: ${ticket.location}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col selection:bg-[#fe932c] selection:text-[#663500]">
      {/* HEADER (Responsive for mobile & laptop) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#e5eeff] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('map')}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-[#0b1c30] hover:bg-[#eff4ff] active:bg-[#e5eeff] transition-colors cursor-pointer"
            title="Back to Map"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <div>
            <h1 className="font-headline text-base sm:text-xl font-bold text-[#0b1c30] truncate leading-tight">
              Report Details &amp; Live Tracking
            </h1>
            <span className="text-[11px] text-[#45464d] font-mono hidden sm:inline">
              Master Ticket {ticket.id} • SLA {ticket.slaHoursTotal}h Response
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('map')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] font-headline text-xs font-semibold transition-all border border-[#dce9ff] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-[#904d00]">map</span>
            <span>View on GIS Map</span>
          </button>
        </div>
      </header>

      {/* Status & Priority Banner */}
      <div className="w-full bg-[#eff4ff] border-b border-[#dce9ff] px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fe932c] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#904d00]"></span>
          </span>
          <span className="font-headline text-xs sm:text-sm text-[#0b1c30] font-bold tracking-wide">
            {ticket.ward} • {ticket.statusLabel || 'Report Logged'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            aria-label="Share ticket"
            onClick={handleShare}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#0b1c30] hover:bg-[#dce9ff] active:scale-95 transition-transform cursor-pointer"
            title="Share Ticket"
          >
            <span className="material-symbols-outlined text-[18px]">share</span>
          </button>
          <button
            aria-label="Subscribe alerts"
            onClick={() => setSubscribed(!subscribed)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 transition-transform cursor-pointer ${
              subscribed ? 'text-[#904d00]' : 'text-[#76777d]'
            }`}
            title="Alert Notifications"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={{ fontVariationSettings: subscribed ? "'FILL' 1" : "'FILL' 0" }}
            >
              notifications_active
            </span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN: Media Evidence, Location & Community Voting */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            {/* Media Card */}
            <div className="relative w-full rounded-3xl overflow-hidden bg-[#e5eeff] shadow-sm border border-[#dce9ff]">
              <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
                <div className="inline-flex p-0.5 rounded-xl bg-[#213145]/90 backdrop-blur-md shadow-sm">
                  <button
                    onClick={() => setMediaMode('citizen')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-headline font-semibold transition-all cursor-pointer ${
                      mediaMode === 'citizen'
                        ? 'bg-white text-[#0b1c30] shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Citizen Evidence
                  </button>
                  <button
                    onClick={() => setMediaMode('telemetry')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-headline font-semibold transition-all cursor-pointer ${
                      mediaMode === 'telemetry'
                        ? 'bg-white text-[#0b1c30] shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Telemetry LIDAR
                  </button>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#ba1a1a] text-white font-headline text-xs font-bold tracking-wider flex items-center gap-1 shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  {ticket.depthCm}cm DEPTH
                </span>
              </div>

              {mediaMode === 'citizen' ? (
                <div className="relative w-full h-64 sm:h-80 transition-all duration-300 flex items-center justify-center bg-slate-900">
                  {ticket.imageUrl ? (
                    <img
                      className="w-full h-full object-cover"
                      alt="Citizen Snap Evidence"
                      src={ticket.imageUrl}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <span className="material-symbols-outlined text-4xl">photo</span>
                      <span className="font-headline text-xs">No Photo Uploaded</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e]/80 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-center justify-between gap-1 text-white">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[16px] shrink-0">photo_camera</span>
                      <span className="font-headline text-[11px] sm:text-sm tracking-tight opacity-90 font-medium truncate">
                        {ticket.reportedDate}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md font-mono shrink-0">
                      {ticket.coordinates?.str}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-64 sm:h-80 transition-all duration-300 flex items-center justify-center bg-slate-900">
                  {ticket.lidarUrl ? (
                    <img
                      className="w-full h-full object-cover"
                      alt="LIDAR Volumetric Scan"
                      src={ticket.lidarUrl}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <span className="material-symbols-outlined text-4xl">view_in_ar</span>
                      <span className="font-headline text-xs">LIDAR Scan Calibrating</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#131b2e]/85 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-center justify-between gap-1 text-white">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="material-symbols-outlined text-[16px] shrink-0">view_in_ar</span>
                      <span className="font-headline text-[11px] sm:text-sm tracking-tight opacity-90 font-medium truncate">
                        Vol. {ticket.patchVolumeM3 || 0.2}m³
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-md bg-[#6ffbbe] text-[#002113] font-headline font-bold shrink-0">
                      CALIBRATED
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Location Pill */}
            <div className="p-4 rounded-3xl bg-white shadow-sm border border-[#e5eeff] flex items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] flex items-center justify-center shrink-0 text-[#904d00] border border-[#dce9ff]">
                  <span className="material-symbols-outlined text-[22px]">location_on</span>
                </div>
                <div className="min-w-0">
                  <p className="font-headline text-sm font-bold text-[#0b1c30] truncate">
                    {ticket.location}
                  </p>
                  <p className="text-xs text-[#45464d] truncate mt-0.5">
                    {ticket.ward} {ticket.landmark ? `• Landmark: ${ticket.landmark}` : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('map')}
                className="px-3 py-1.5 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#904d00] text-xs font-headline font-bold border border-[#dce9ff] cursor-pointer"
              >
                Map Pin
              </button>
            </div>

            {/* Community Corroboration & Verification Widget */}
            <div className="p-5 rounded-3xl bg-white shadow-sm border border-[#e5eeff] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#904d00] text-lg">👍</span>
                  <span className="font-headline text-sm font-bold text-[#0b1c30]">
                    {commuterCount} Commuters corroborated
                  </span>
                </div>
              </div>

              {/* Citizen Poll Prompt Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[#0b1c30]">
                  <span className="material-symbols-outlined text-[#fe932c] text-xl">explore</span>
                  <h4 className="font-headline text-sm font-bold">Are you near {ticket.location}?</h4>
                </div>
                <p className="text-xs text-[#45464d] leading-relaxed">
                  Is this road hazard still open, or has leveling occurred?
                </p>

                {!voteSubmitted ? (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => handleVote('danger')}
                      className="py-3 px-4 rounded-xl bg-white hover:bg-[#eff4ff] text-[#904d00] font-headline text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all border border-[#e5eeff] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">thumb_down</span>
                      <span>Still Dangerous</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleVote('fixed')}
                      className="py-3 px-4 rounded-xl bg-[#6ffbbe] hover:bg-[#4edea3] text-[#002113] font-headline text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      <span>Fixed / Covered</span>
                    </button>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[#6ffbbe]/40 text-[#002113] font-headline text-xs font-bold text-center border border-[#6ffbbe]">
                    {voteSubmitted === 'danger'
                      ? 'Noted: Incident confirmed active. Public Works notified.'
                      : 'Thank you! Municipal crew alerted to resolution.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Municipal Action Timeline & Dispatch Details */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className="p-5 sm:p-6 rounded-3xl bg-white shadow-sm border border-[#e5eeff] flex flex-col gap-5">
              <div className="flex items-center justify-between pb-2 border-b border-[#e5eeff]">
                <div>
                  <h2 className="font-headline text-base sm:text-lg font-bold text-[#0b1c30]">
                    Municipal Action Timeline
                  </h2>
                  <p className="text-xs text-[#45464d]">Live civic dispatch tracking</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdcc3] text-[#663500] font-headline text-xs font-bold shadow-sm">
                  <span className="material-symbols-outlined text-[15px]">timer</span>
                  <span>SLA: {ticket.slaHoursTotal}h Total</span>
                </div>
              </div>

              {/* Vertical Steps */}
              <div className="flex flex-col relative pl-1">
                {/* Step 1: Reported */}
                <div className="flex items-start gap-3.5 pb-6 relative">
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-[#4edea3]"></div>
                  <div className="w-8 h-8 rounded-full bg-[#6ffbbe] text-[#002113] flex items-center justify-center shrink-0 z-10 shadow-sm">
                    <span className="material-symbols-outlined text-base font-bold">check</span>
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline text-sm font-bold text-[#0b1c30]">Reported &amp; Logged</h3>
                      <span className="text-xs text-[#45464d]">{ticket.reportedDate}</span>
                    </div>
                    <p className="text-xs text-[#45464d] mt-0.5">Submitted via Mobile Civic Portal</p>
                  </div>
                </div>

                {/* Step 2: Verification */}
                <div className="flex items-start gap-3.5 pb-6 relative">
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-[#4edea3]"></div>
                  <div className="w-8 h-8 rounded-full bg-[#6ffbbe] text-[#002113] flex items-center justify-center shrink-0 z-10 shadow-sm">
                    <span className="material-symbols-outlined text-base font-bold">check</span>
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline text-sm font-bold text-[#0b1c30]">AI Verified</h3>
                      <span className="text-xs text-[#45464d]">{ticket.aiConfidence}% CV Confidence</span>
                    </div>
                    <p className="text-xs text-[#45464d] mt-0.5">Automated Depth &amp; Severity Classification</p>
                  </div>
                </div>

                {/* Step 3: Dispatch */}
                <div className="flex items-start gap-3.5 pb-6 relative">
                  <div
                    className={`absolute left-4 top-8 bottom-0 w-0.5 ${
                      ticket.status === 'repaired' ? 'bg-[#4edea3]' : 'bg-[#e5eeff]'
                    }`}
                  ></div>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm ${
                      ticket.status === 'dispatched' || ticket.status === 'repaired'
                        ? 'bg-[#fe932c] text-[#2f1500]'
                        : 'bg-[#eff4ff] text-[#76777d]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base font-bold">
                      {ticket.status === 'dispatched' || ticket.status === 'repaired' ? 'local_shipping' : 'pending'}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline text-sm font-bold text-[#0b1c30]">
                        {ticket.status === 'dispatched'
                          ? 'Work Order Dispatched'
                          : ticket.status === 'repaired'
                          ? 'Repaired & Complete'
                          : 'Awaiting Crew Dispatch'}
                      </h3>
                      {ticket.workOrderId && (
                        <span className="text-xs font-mono font-bold text-[#904d00]">{ticket.workOrderId}</span>
                      )}
                    </div>
                    <p className="text-xs text-[#45464d] mt-0.5">
                      Contractor: {ticket.assignedContractor || 'Unassigned'}
                    </p>
                  </div>
                </div>

                {/* Step 4: Repaired */}
                <div className="flex items-start gap-3.5 relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm ${
                      ticket.status === 'repaired'
                        ? 'bg-[#009668] text-white'
                        : 'bg-[#eff4ff] text-[#76777d]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base font-bold">verified</span>
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline text-sm font-bold text-[#0b1c30]">Repair Verification</h3>
                      <span className="text-xs text-[#45464d]">
                        {ticket.status === 'repaired' ? 'Complete' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-xs text-[#45464d] mt-0.5">
                      Inspector: {ticket.assignedInspector || 'Unassigned'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
