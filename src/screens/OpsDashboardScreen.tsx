import React, { useState } from 'react';
import { ScreenType, HazardTicket } from '../types';
import { ASSETS } from '../data/mockData';
import { api } from '../services/api';

interface OpsDashboardScreenProps {
  onNavigate: (screen: ScreenType) => void;
  tickets: HazardTicket[];
  selectedTicketId: string;
  onSelectTicket: (id: string) => void;
  onUpdateTicketStatus: (ticketId: string, status: HazardTicket['status']) => void;
  onAddTicket: (ticket: Partial<HazardTicket>) => void;
}

export const OpsDashboardScreen: React.FC<OpsDashboardScreenProps> = ({
  onNavigate,
  tickets,
  selectedTicketId,
  onSelectTicket,
  onUpdateTicketStatus,
  onAddTicket,
}) => {
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showPotholes, setShowPotholes] = useState(true);
  const [showCrews, setShowCrews] = useState(true);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showWardBoundary, setShowWardBoundary] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'map' | 'triage'>('triage');
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDepth, setNewDepth] = useState('7.5');
  const [dispatchToast, setDispatchToast] = useState<string | null>(null);
  const [opsMapEngine, setOpsMapEngine] = useState<'google' | 'vector'>('google');

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0] || null;

  const handleApproveDispatch = (id: string) => {
    onUpdateTicketStatus(id, 'dispatched');
    api.dispatchWorkOrder(id);
    setDispatchToast(`Work order approved for ${id}. Crew dispatched with hot-mix asphalt unit.`);
    setTimeout(() => setDispatchToast(null), 4000);
  };

  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      features: tickets.map((t) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [t.coordinates.lng, t.coordinates.lat],
        },
        properties: {
          id: t.id,
          title: t.title,
          location: t.location,
          severity: t.severity,
          depthCm: t.depthCm,
          status: t.status,
          corroborations: t.corroborations,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `roadwatch-ward4-${new Date().toISOString().slice(0, 10)}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateManualTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation) return;
    const numeric = Math.floor(4110 + Math.random() * 80);
    onAddTicket({
      id: `#RW-${numeric}`,
      numericId: `${numeric}`,
      title: newTitle || `Hazard #RW-${numeric}`,
      location: newLocation,
      landmark: 'Ward 4 Priority Sector',
      ward: 'Ward 4 - West Sector',
      depthCm: parseFloat(newDepth) || 7.5,
      severity: parseFloat(newDepth) >= 8 ? 'dangerous' : 'moderate',
      severityLabel: parseFloat(newDepth) >= 8 ? 'Severe Trench' : 'Moderate Crater',
      status: 'reported',
      statusLabel: 'Logged by Dispatcher',
      reportedTimeAgo: 'Just now',
      reportedDate: 'Today',
      corroborations: 1,
      mergedCount: 1,
      aiConfidence: 95.0,
      imageUrl: ASSETS.photos.quickReportPothole,
      environmentalTags: ['Manual Dispatch Entry', 'Speed Limit 50 km/h'],
      assignedInspector: 'Inspector R. Dave (Zone 4)',
      assignedContractor: 'Apex Infra Repairs (#PWD-401)',
      slaHoursTotal: 72,
      slaHoursElapsed: 1,
    });
    setShowCreateModal(false);
    setNewLocation('');
    setNewTitle('');
    setDispatchToast(`Manual Ticket #RW-${numeric} created and added to triage queue.`);
    setTimeout(() => setDispatchToast(null), 4000);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      t.title.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = selectedSeverity === 'all' || t.severity === selectedSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex font-body selection:bg-[#fe932c] selection:text-[#663500] relative">
      {/* ========================================================= */}
      {/* MOBILE DRAWER OVERLAY (when sidebar is opened on mobile)  */}
      {/* ========================================================= */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 z-50 lg:hidden backdrop-blur-xs transition-opacity"
        ></div>
      )}

      {/* ========================================================= */}
      {/* LEFT SIDEBAR: Persistent on Laptop (lg+), Drawer on Mobile */}
      {/* ========================================================= */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 w-72 bg-[#131b2e] text-slate-200 shrink-0 flex flex-col justify-between border-r border-white/10 select-none z-50 transition-transform duration-300 ${
          mobileDrawerOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand */}
          <div className="px-5 pt-6 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => onNavigate('landing')}
                className="flex items-center gap-3 cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-[#fe932c] flex items-center justify-center text-[#2f1500] shadow-md">
                  <span className="material-symbols-outlined text-[20px] font-bold">shield</span>
                </div>
                <div>
                  <span className="font-headline text-lg font-bold tracking-tight text-white block">
                    RoadWatch Ops
                  </span>
                  <span className="font-headline text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
                    Municipal Infrastructure
                  </span>
                </div>
              </button>

              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Sync status */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/10 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-headline text-[10px] text-emerald-300 font-bold">Ward Sync Active</span>
            </div>

            {/* Ward selector */}
            <div className="mt-4">
              <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#213145] text-white hover:bg-[#2c3e55] transition-colors border border-white/10 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-[18px]">location_city</span>
                  <span className="font-headline text-xs font-semibold">Ward 4 - Central Zone</span>
                </div>
                <span className="material-symbols-outlined text-slate-400 text-[16px]">unfold_more</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 px-3 mt-4">
            <button
              onClick={() => {
                setMobileActiveTab('triage');
                setMobileDrawerOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#213145] text-white font-headline text-xs font-bold shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[19px] text-[#fe932c]">warning</span>
                <span>Triage Queue</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#fe932c] text-[#2f1500] text-[10px] font-extrabold">
                {tickets.length}
              </span>
            </button>

            <button
              onClick={() => {
                setMobileActiveTab('map');
                setMobileDrawerOpen(false);
              }}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:bg-[#213145] hover:text-white transition-colors font-headline text-xs font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[19px]">map</span>
                <span>Live GIS Map</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('tracking')}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:bg-[#213145] hover:text-white transition-colors font-headline text-xs font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[19px]">engineering</span>
                <span>Work Orders</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-semibold">
                28
              </span>
            </button>

            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:bg-[#213145] hover:text-white transition-colors font-headline text-xs font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[19px]">business</span>
                <span>Contractor Directory</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('tracking')}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:bg-[#213145] hover:text-white transition-colors font-headline text-xs font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[19px]">query_stats</span>
                <span>Analytics &amp; SLA</span>
              </div>
            </button>

            <button
              onClick={() => onNavigate('signin')}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-300 hover:bg-[#213145] hover:text-white transition-colors font-headline text-xs font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[19px]">settings</span>
                <span>Settings</span>
              </div>
            </button>
          </nav>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MAIN VIEWPORT (Laptop & Mobile Adaptive)                  */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toast Alert */}
        {dispatchToast && (
          <div className="bg-[#fe932c] text-[#2f1500] px-4 py-2.5 font-headline text-xs font-bold flex items-center justify-between shadow-md z-50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base">task_alt</span>
              <span>{dispatchToast}</span>
            </div>
            <button onClick={() => setDispatchToast(null)} className="text-[#2f1500] hover:text-black font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Top Header */}
        <header className="h-16 bg-white/95 backdrop-blur-xl border-b border-[#e5eeff] px-4 sm:px-6 flex items-center justify-between gap-3 z-30">
          <div className="flex items-center gap-2.5 flex-1 max-w-xl">
            {/* Mobile Hamburger Drawer Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#0b1c30] hover:bg-[#dce9ff] transition-colors"
              title="Open Navigation"
            >
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            {/* Search Input */}
            <div className="relative flex-1 flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-[#76777d] text-[20px]">search</span>
              <input
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] placeholder:text-[#76777d] border border-[#dce9ff] focus:outline-none focus:border-[#fe932c] text-xs font-body"
                placeholder="Search ticket #RW-, street..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="hidden sm:block px-3 py-1.5 rounded-xl bg-white border border-[#dce9ff] text-[#0b1c30] text-xs font-headline font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="dangerous">Critical</option>
              <option value="moderate">Moderate</option>
              <option value="minor">Minor</option>
            </select>

            <button
              onClick={handleExportGeoJSON}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#dce9ff] text-[#0b1c30] hover:bg-[#eff4ff] transition-colors text-xs font-headline font-semibold cursor-pointer"
              title="Download GIS Data"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span className="hidden xl:inline">Export GeoJSON</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#0b1c30] text-white hover:bg-[#131b2e] transition-colors text-xs font-headline font-bold shadow-sm cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px] text-[#fe932c]">add</span>
              <span className="hidden xs:inline">Manual Ticket</span>
              <span className="xs:hidden">Ticket</span>
            </button>
          </div>
        </header>

        {/* Top Stat Ticker Ribbon (Touch scrollable on mobile) */}
        <div className="w-full bg-white px-4 sm:px-6 py-2.5 border-b border-[#e5eeff] shadow-sm flex items-center justify-between gap-3 z-20 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdcc3] text-[#663500] shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#fe932c] animate-ping"></span>
              <span className="font-headline text-[10px] uppercase font-bold">Active Sector</span>
              <span className="font-headline text-xs font-extrabold text-[#2f1500]">Ward 4</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#eff4ff] border border-[#dce9ff] shrink-0">
              <div className="w-2 h-2 rounded-full bg-[#fe932c]"></div>
              <span className="font-headline text-xs text-[#45464d]">New Reports</span>
              <span className="font-headline text-xs font-bold text-[#0b1c30]">{tickets.length}</span>
              <span className="text-[10px] bg-[#ffdcc3] text-[#663500] px-1.5 py-0.2 rounded font-bold">+6/hr</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-50 border border-red-200 shrink-0">
              <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
              <span className="font-headline text-xs text-red-800">Overdue SLAs</span>
              <span className="font-headline text-xs font-bold text-red-700">4</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#e5eeff] border border-[#dce9ff] shrink-0">
              <span className="material-symbols-outlined text-[15px] text-[#0b1c30]">engineering</span>
              <span className="font-headline text-xs text-[#45464d]">Repairs: 12</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#6ffbbe]/30 border border-[#6ffbbe] shrink-0">
              <span className="material-symbols-outlined text-[15px] text-[#009668]">verified</span>
              <span className="font-headline text-xs text-[#002113]">Resolved (7D): 45</span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-right shrink-0">
            <div>
              <div className="font-headline text-[10px] text-[#45464d]">Telemetry Feed Sync</div>
              <div className="font-mono text-xs font-semibold text-[#0b1c30]">19.2431° N, 73.1342° E</div>
            </div>
            <span className="material-symbols-outlined text-[#76777d] text-[20px]">sensors</span>
          </div>
        </div>

        {/* MOBILE VIEW SWITCHER (Only shown on screens < xl) */}
        <div className="xl:hidden bg-white border-b border-[#e5eeff] px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => setMobileActiveTab('triage')}
              className={`flex-1 py-1.5 px-3 rounded-xl font-headline text-xs font-bold transition-all ${
                mobileActiveTab === 'triage'
                  ? 'bg-[#131b2e] text-white shadow-sm'
                  : 'bg-[#eff4ff] text-[#45464d]'
              }`}
            >
              📋 Triage Queue ({filteredTickets.length})
            </button>
            <button
              onClick={() => setMobileActiveTab('map')}
              className={`flex-1 py-1.5 px-3 rounded-xl font-headline text-xs font-bold transition-all ${
                mobileActiveTab === 'map'
                  ? 'bg-[#131b2e] text-white shadow-sm'
                  : 'bg-[#eff4ff] text-[#45464d]'
              }`}
            >
              🗺️ GIS Map View
            </button>
          </div>
        </div>

        {/* Split Screen Canvas: 60% Map / 40% Triage Queue on Laptop */}
        <div className="grid grid-cols-12 flex-1 w-full overflow-hidden">
          {/* ========================================================= */}
          {/* LEFT: GIS Telemetry Viewport (Visible on xl+, or mobile tab) */}
          {/* ========================================================= */}
          <section
            className={`col-span-12 xl:col-span-7 relative h-full bg-[#d3e4fe] overflow-hidden select-none min-h-[420px] ${
              mobileActiveTab === 'triage' ? 'hidden xl:block' : 'block'
            }`}
          >
            {opsMapEngine === 'google' ? (
              /* Google Maps Embed Iframe in Ops View */
              <div className="absolute inset-0 w-full h-full flex flex-col bg-slate-100">
                <iframe
                  title="Ops GIS Google Maps Embed"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    selectedTicket ? `${selectedTicket.coordinates.lat},${selectedTicket.coordinates.lng}` : '19.2431,73.1342'
                  )}&z=15&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full"
                />
              </div>
            ) : null}

            {/* SVG GIS Layer */}
            <svg className={`w-full h-full absolute inset-0 opacity-90 ${opsMapEngine === 'google' ? 'hidden' : 'block'}`} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="ops-grid-res" patternUnits="userSpaceOnUse" width="120" height="120">
                  <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#cbdbf5" strokeWidth="1.5" />
                  <path d="M 60 0 L 60 120 M 0 60 L 120 60" fill="none" stroke="#d3e4fe" strokeDasharray="2 4" strokeWidth="0.75" />
                </pattern>
                <radialGradient id="heat-danger-res" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ba1a1a" stopOpacity="0.45" />
                  <stop offset="45%" stopColor="#fe932c" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#fe932c" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="heat-warning-res" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fe932c" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#ffdcc3" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#ffdcc3" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="100%" height="100%" fill="url(#ops-grid-res)" />

              {/* Jurisdiction Polygon */}
              {showWardBoundary && (
                <polygon
                  points="60,90 840,40 1020,480 820,760 180,680"
                  fill="#dae2fd"
                  fillOpacity="0.35"
                  stroke="#131b2e"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
              )}

              {/* Road Corridors */}
              <path d="M -40,380 C 240,320 460,420 720,330 L 1100,280" fill="none" stroke="#cbdbf5" strokeWidth="28" strokeLinecap="round" />
              <path d="M -40,380 C 240,320 460,420 720,330 L 1100,280" fill="none" stroke="#ffffff" strokeWidth="20" strokeLinecap="round" />
              <path d="M -40,380 C 240,320 460,420 720,330 L 1100,280" fill="none" stroke="#fe932c" strokeWidth="3" strokeDasharray="8 6" />

              <path d="M 440,-20 L 410,260 L 520,580 L 610,920" fill="none" stroke="#cbdbf5" strokeWidth="18" strokeLinecap="round" />
              <path d="M 440,-20 L 410,260 L 520,580 L 610,920" fill="none" stroke="#ffffff" strokeWidth="12" strokeLinecap="round" />

              <path d="M 160,180 L 420,350 L 320,620" fill="none" stroke="#d3e4fe" strokeWidth="8" />
              <path d="M 720,330 L 780,680 L 980,720" fill="none" stroke="#d3e4fe" strokeWidth="8" />

              {/* Heatmap Blobs */}
              {showHeatmap && (
                <>
                  <circle cx="430" cy="355" r="140" fill="url(#heat-danger-res)" />
                  <circle cx="260" cy="240" r="95" fill="url(#heat-warning-res)" />
                  <circle cx="780" cy="460" r="110" fill="url(#heat-danger-res)" />
                </>
              )}
            </svg>

            {/* Labels */}
            <div className="absolute top-[32%] left-[16%] px-2 py-0.5 rounded bg-white/90 backdrop-blur shadow-sm pointer-events-none border border-[#e5eeff]">
              <span className="font-headline text-[10px] tracking-wider uppercase text-[#45464d] font-bold">
                M.G. Road Arterial Corridor
              </span>
            </div>

            {/* PINS ON MAP */}
            {showPotholes && (
              tickets.map((t, idx) => {
                const isSelected = selectedTicket && t.id === selectedTicket.id;
                const offsetX = 280 + (t.coordinates.lng - 73.1342) * 22000;
                const offsetY = 320 - (t.coordinates.lat - 19.2431) * 22000;
                const x = Math.max(60, Math.min(540, offsetX || 200 + (idx * 50) % 250));
                const y = Math.max(80, Math.min(480, offsetY || 220 + (idx * 60) % 200));

                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTicket(t.id)}
                    style={{ left: `${x}px`, top: `${y}px` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30 group ${
                      isSelected ? 'scale-110 z-40' : 'hover:scale-105'
                    }`}
                  >
                    {isSelected && <span className="absolute -inset-3 rounded-full bg-red-600/30 animate-ping"></span>}
                    <div className={`relative w-8 h-8 rounded-full text-white shadow-xl flex items-center justify-center ring-2 ring-white ${
                      t.severity === 'dangerous' ? 'bg-[#ba1a1a]' : t.severity === 'moderate' ? 'bg-[#fe932c]' : 'bg-[#009668]'
                    }`}>
                      <span className="material-symbols-outlined text-[17px]">
                        {t.severity === 'dangerous' ? 'warning' : 'pin_drop'}
                      </span>
                    </div>

                    {/* Callout Box on Selected */}
                    {isSelected && (
                      <div className="absolute left-10 -top-7 w-60 sm:w-64 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl pointer-events-auto border border-[#e5eeff] z-50">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`px-1.5 py-0.5 rounded font-headline text-[10px] font-bold uppercase ${
                            t.severity === 'dangerous' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {t.severityLabel || t.severity}
                          </span>
                          <span className="font-mono text-xs text-[#45464d] font-bold">{t.id}</span>
                        </div>
                        <div className="font-headline text-xs text-[#0b1c30] leading-tight font-bold">
                          {t.location}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-[#45464d]">
                          <span className="font-bold text-red-600">{t.depthCm}cm Depth</span>
                          <span>|</span>
                          <span>{t.ward}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Crew Pin */}
            {showCrews && (
              <div className="absolute top-[520px] left-[580px] -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group">
                <div className="w-8 h-8 rounded-full bg-[#6ffbbe] text-[#002113] shadow-lg flex items-center justify-center ring-2 ring-white">
                  <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                </div>
              </div>
            )}

            {/* Floating HUD Controls */}
            <div className="absolute top-4 left-4 z-30 flex items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-[#e5eeff]">
              <button
                onClick={() => setOpsMapEngine(opsMapEngine === 'google' ? 'vector' : 'google')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-headline text-xs transition-colors cursor-pointer ${
                  opsMapEngine === 'google' ? 'bg-[#4285F4] text-white font-bold' : 'text-[#0b1c30] hover:bg-[#eff4ff]'
                }`}
                title={opsMapEngine === 'google' ? 'Switch to Vector Blueprint' : 'Switch to Google Maps Embed'}
              >
                <span className="material-symbols-outlined text-[15px]">public</span>
                <span>{opsMapEngine === 'google' ? 'Maps Embed' : 'Vector GIS'}</span>
              </button>

              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-headline text-xs transition-colors cursor-pointer ${
                  showHeatmap ? 'bg-[#0b1c30] text-white font-bold' : 'text-[#0b1c30] hover:bg-[#eff4ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">local_fire_department</span>
                <span>Heatmap</span>
              </button>

              <button
                onClick={() => setShowPotholes(!showPotholes)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-headline text-xs transition-colors cursor-pointer ${
                  showPotholes ? 'bg-[#ffdcc3] text-[#663500] font-bold' : 'text-[#0b1c30] hover:bg-[#eff4ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] text-[#904d00]">location_on</span>
                <span>Pins ({tickets.length})</span>
              </button>

              <button
                onClick={() => setShowCrews(!showCrews)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-headline text-xs transition-colors cursor-pointer ${
                  showCrews ? 'bg-[#6ffbbe]/50 text-[#002113] font-bold' : 'text-[#0b1c30] hover:bg-[#eff4ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px] text-[#009668]">construction</span>
                <span>Crews</span>
              </button>
            </div>
          </section>

          {/* ========================================================= */}
          {/* RIGHT: Live Triage & Dispatch Queue                      */}
          {/* ========================================================= */}
          <section
            className={`col-span-12 xl:col-span-5 h-full bg-[#f8f9ff] flex flex-col border-l border-[#e5eeff] shadow-xl z-20 overflow-hidden ${
              mobileActiveTab === 'map' ? 'hidden xl:flex' : 'flex'
            }`}
          >
            {/* Header & KPI */}
            <div className="p-4 bg-white border-b border-[#e5eeff] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-headline text-base sm:text-lg text-[#0b1c30] font-bold tracking-tight">
                      Live Triage &amp; Dispatch
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#ffdcc3] text-[#663500] font-headline text-[10px] font-bold">
                      {filteredTickets.length} PENDING
                    </span>
                  </div>
                  <p className="text-xs text-[#45464d] mt-0.5">
                    Prioritized municipal hazard intake with AI CV corroboration
                  </p>
                </div>

                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#6ffbbe]/25 text-[#002113] text-xs font-headline font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live 30s</span>
                </div>
              </div>

              {/* Mini KPIs */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-[#eff4ff] flex flex-col border border-[#dce9ff]">
                  <span className="font-headline text-[10px] text-[#45464d]">Unassigned</span>
                  <span className="font-headline text-sm sm:text-base font-bold text-[#0b1c30]">
                    {tickets.filter((t) => !t.assignedInspector || t.assignedInspector === 'Unassigned').length}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-red-50 flex flex-col border border-red-200">
                  <span className="font-headline text-[10px] text-red-700">SLA At Risk</span>
                  <span className="font-headline text-sm sm:text-base font-bold text-red-700">
                    {tickets.filter((t) => t.slaHoursElapsed > t.slaHoursTotal && t.status !== 'repaired').length}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#eff4ff] flex flex-col border border-[#dce9ff]">
                  <span className="font-headline text-[10px] text-[#45464d]">Avg Response</span>
                  <span className="font-headline text-sm sm:text-base font-bold text-[#0b1c30]">
                    {tickets.length > 0 ? '1.8h' : '0h'}
                  </span>
                </div>
              </div>
            </div>

            {/* Scrollable Ticket List Feed */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scroll">
              {filteredTickets.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#76777d] my-auto">
                  <div className="w-14 h-14 rounded-2xl bg-[#eff4ff] text-[#009668] flex items-center justify-center mb-3 border border-[#dce9ff]">
                    <span className="material-symbols-outlined text-3xl">task_alt</span>
                  </div>
                  <h3 className="font-headline text-sm font-bold text-[#0b1c30] mb-1">Triage Queue Clear</h3>
                  <p className="text-xs text-[#45464d] max-w-xs mb-4">
                    No active hazard reports pending triage. Citizen reports and field inspections will populate here live.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 rounded-xl bg-[#fe932c] text-[#2f1500] font-headline text-xs font-bold shadow-sm hover:bg-[#e8801b] cursor-pointer"
                  >
                    + Log Field Hazard
                  </button>
                </div>
              ) : (
                <>
                  {/* EXPANDED ACTIVE FOCUS CARD */}
                  {selectedTicket && (
                    <div className="rounded-2xl bg-white p-4 shadow-sm border border-[#e5eeff] flex flex-col gap-3 relative">
                      <div className="absolute left-0 top-3 bottom-3 w-1.5 bg-[#ba1a1a] rounded-r"></div>

                      <div className="flex items-center justify-between pl-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-headline text-[10px] font-bold uppercase tracking-wider">
                            {selectedTicket.severityLabel || 'Hazard Trench'}
                          </span>
                          <span className="font-headline text-sm font-bold text-[#0b1c30] font-mono">
                            {selectedTicket.id}
                          </span>
                        </div>
                        <span className="text-xs text-[#45464d] font-medium">{selectedTicket.reportedTimeAgo}</span>
                      </div>

                      {/* Visual & Telemetry */}
                      <div className="grid grid-cols-12 gap-3 pl-2">
                        <div className="col-span-5 relative rounded-xl overflow-hidden bg-[#e5eeff] h-28 border border-[#dce9ff] flex items-center justify-center">
                          {selectedTicket.imageUrl ? (
                            <img
                              className="w-full h-full object-cover"
                              alt={selectedTicket.title}
                              src={selectedTicket.imageUrl}
                            />
                          ) : (
                            <span className="material-symbols-outlined text-2xl text-slate-400">photo</span>
                          )}
                          <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-[#131b2e]/90 text-white font-headline text-[10px] font-semibold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px] text-red-400">straighten</span>
                            <span>{selectedTicket.depthCm}cm Depth</span>
                          </div>
                        </div>

                        <div className="col-span-7 flex flex-col justify-between py-0.5">
                          <div>
                            <div className="flex items-center gap-1 text-red-600 font-headline text-xs font-bold">
                              <span className="material-symbols-outlined text-[15px]">smart_toy</span>
                              <span>{selectedTicket.aiConfidence}% CV Confidence</span>
                            </div>
                            <div className="font-headline text-xs font-bold text-[#0b1c30] mt-1 leading-snug">
                              {selectedTicket.location}
                            </div>
                            <div className="text-[11px] text-[#45464d] truncate mt-0.5">
                              {selectedTicket.landmark || selectedTicket.ward}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                            <span className="material-symbols-outlined text-[12px]">my_location</span>
                            <span>{selectedTicket.coordinates?.str}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deduplication Notice */}
                      <div className="ml-2 px-3 py-1.5 rounded-xl bg-[#ffdcc3]/50 border border-[#fe932c]/30 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-[#904d00]">merge</span>
                          <span className="font-headline text-xs font-bold text-[#663500]">
                            {selectedTicket.corroborations || 1} Commuter Signals
                          </span>
                        </div>
                        <span className="text-xs text-[#904d00]">{selectedTicket.statusLabel || 'Reported'}</span>
                      </div>

                      {/* Environmental Tags */}
                      {selectedTicket.environmentalTags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 ml-2">
                          {selectedTicket.environmentalTags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-0.5 rounded-lg bg-[#eff4ff] text-[#0b1c30] font-headline text-[10px] font-semibold border border-[#dce9ff]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Form controls */}
                      <div className="ml-2 p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col gap-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="font-headline text-[10px] text-[#45464d] font-bold block mb-1">
                              Zone Field Inspector
                            </label>
                            <select className="w-full bg-white rounded-lg py-1 px-2 font-body text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none cursor-pointer">
                              <option>{selectedTicket.assignedInspector || 'Inspector R. Dave (Zone 4)'}</option>
                              <option>Inspector S. Mehta (Zone 2)</option>
                              <option>Unassigned</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-headline text-[10px] text-[#45464d] font-bold block mb-1">
                              Assigned Contractor
                            </label>
                            <select className="w-full bg-white rounded-lg py-1 px-2 font-body text-xs text-[#0b1c30] border border-[#dce9ff] focus:outline-none cursor-pointer">
                              <option>{selectedTicket.assignedContractor || 'Apex Infra Repairs (#PWD-401)'}</option>
                              <option>Vanguard Roadworks Ltd.</option>
                              <option>Ward Municipal Rapid Crew</option>
                            </select>
                          </div>
                        </div>

                        {/* Volume & SLA */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-[#dce9ff]">
                            <span className="font-headline text-[10px] text-[#45464d]">Est. Vol:</span>
                            <span className="font-headline text-xs font-bold text-[#0b1c30]">
                              {selectedTicket.patchVolumeM3 || 0.3} m³ Hot-mix
                            </span>
                          </div>
                          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-[#dce9ff]">
                            <span className="font-headline text-[10px] text-[#45464d]">SLA Left:</span>
                            <span className="font-headline text-xs font-bold text-red-600">
                              {Math.max(0, selectedTicket.slaHoursTotal - selectedTicket.slaHoursElapsed)}h Left
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-2 flex items-center justify-between gap-2 pt-1">
                        <button
                          onClick={() => handleApproveDispatch(selectedTicket.id)}
                          className="flex-1 py-2.5 px-3 sm:px-4 rounded-xl bg-[#0b1c30] text-white hover:bg-[#131b2e] font-headline text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer min-w-0"
                        >
                          <span className="material-symbols-outlined text-[16px] text-[#fe932c] shrink-0">verified</span>
                          <span className="hidden sm:inline truncate">Approve &amp; Dispatch Work Order</span>
                          <span className="sm:hidden truncate">Approve &amp; Dispatch</span>
                        </button>

                        <button
                          onClick={() => onNavigate('tracking')}
                          className="py-2.5 px-3 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] font-headline text-xs font-semibold flex items-center justify-center gap-1 border border-[#dce9ff] cursor-pointer shrink-0"
                          title="Live Tracking"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* OTHER TICKETS */}
                  {filteredTickets
                    .filter((t) => !selectedTicket || t.id !== selectedTicket.id)
                    .map((t) => (
                      <div
                        key={t.id}
                        onClick={() => onSelectTicket(t.id)}
                        className="rounded-2xl bg-white p-3.5 shadow-sm hover:shadow-md transition-shadow border border-[#e5eeff] flex flex-col gap-2 relative cursor-pointer"
                      >
                        <div
                          className={`absolute left-0 top-2 bottom-2 w-1.5 rounded-r ${
                            t.severity === 'dangerous'
                              ? 'bg-[#ba1a1a]'
                              : t.severity === 'moderate'
                              ? 'bg-[#fe932c]'
                              : 'bg-[#565e74]'
                          }`}
                        ></div>

                        <div className="flex items-center justify-between pl-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`px-2 py-0.5 rounded font-headline text-[9px] sm:text-[10px] font-bold uppercase shrink-0 ${
                                t.severity === 'dangerous'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-[#ffdcc3] text-[#663500]'
                              }`}
                            >
                              {t.severity === 'dangerous' ? 'Hazard Trench' : 'Moderate Crater'}
                            </span>
                            <span className="font-mono text-xs font-bold text-[#0b1c30] shrink-0">{t.id}</span>
                          </div>
                          <span className="text-[11px] sm:text-xs text-[#45464d] shrink-0">{t.reportedTimeAgo}</span>
                        </div>

                        <div className="grid grid-cols-12 gap-3 pl-2 items-center">
                          <div className="col-span-3 h-16 rounded-xl overflow-hidden bg-[#e5eeff] border border-[#dce9ff] shrink-0 flex items-center justify-center">
                            {t.imageUrl ? (
                              <img className="w-full h-full object-cover" alt={t.title} src={t.imageUrl} />
                            ) : (
                              <span className="material-symbols-outlined text-xl text-slate-400">photo</span>
                            )}
                          </div>
                          <div className="col-span-9 flex flex-col justify-between min-w-0">
                            <div className="font-headline text-xs font-bold text-[#0b1c30] leading-snug truncate">
                              {t.location}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1 text-[11px] sm:text-xs text-[#45464d]">
                              <span className="font-bold text-[#904d00]">Depth: {t.depthCm}cm</span>
                              <span>•</span>
                              <span>{t.aiConfidence}% AI</span>
                              <span>•</span>
                              <span>{t.corroborations} Commuters</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pl-2 pt-1 border-t border-[#e5eeff]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTicket(t.id);
                              onNavigate('tracking');
                            }}
                            className="px-2.5 sm:px-3 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] font-headline text-[11px] sm:text-xs font-medium transition-colors"
                          >
                            Telemetry
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveDispatch(t.id);
                            }}
                            className="px-2.5 sm:px-3 py-1 rounded-lg bg-[#0b1c30] text-white hover:bg-[#131b2e] font-headline text-[11px] sm:text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px] text-[#fe932c]">send</span>
                            <span>Dispatch</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-white border-t border-[#e5eeff] shadow-sm flex items-center justify-between text-xs text-[#45464d] font-headline font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Node #409 Online</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleExportGeoJSON} className="hover:text-[#0b1c30] cursor-pointer">
                  Export CSV
                </button>
                <span>•</span>
                <span className="hover:text-[#0b1c30] cursor-pointer">Batch Ops</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* CREATE MANUAL TICKET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e5eeff] flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#e5eeff] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#fe932c] flex items-center justify-center text-[#2f1500]">
                  <span className="material-symbols-outlined text-lg">add</span>
                </div>
                <h3 className="font-headline text-base font-bold text-[#0b1c30]">Create Manual Municipal Ticket</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-[#eff4ff] hover:bg-[#dce9ff] flex items-center justify-center text-[#45464d] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualTicketSubmit} className="flex flex-col gap-3">
              <div>
                <label className="font-headline text-xs font-semibold text-[#0b1c30] block mb-1">
                  Ticket Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Severe Pothole near North Station"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#dce9ff] text-xs font-body focus:outline-none"
                />
              </div>

              <div>
                <label className="font-headline text-xs font-semibold text-[#0b1c30] block mb-1">
                  Street Corridor / Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Grand Central Ave, Northbound Lane 1"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#dce9ff] text-xs font-body focus:outline-none"
                />
              </div>

              <div>
                <label className="font-headline text-xs font-semibold text-[#0b1c30] block mb-1">
                  Estimated Depth (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newDepth}
                  onChange={(e) => setNewDepth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#dce9ff] text-xs font-body focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#eff4ff] text-[#0b1c30] font-headline text-xs font-semibold hover:bg-[#dce9ff] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#fe932c] text-[#2f1500] font-headline text-xs font-bold hover:bg-[#e8801b] shadow-md cursor-pointer"
                >
                  Submit &amp; Route to Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
