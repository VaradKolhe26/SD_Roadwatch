import React, { useState } from 'react';
import { ScreenType, UserRole } from '../types';
import { ASSETS } from '../data/mockData';

interface LandingScreenProps {
  onNavigate: (screen: ScreenType) => void;
  isLoggedIn: boolean;
  userRole: UserRole | null;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onNavigate,
  isLoggedIn,
  userRole,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleProtectedAction = (targetScreen: ScreenType) => {
    if (isLoggedIn) {
      onNavigate(targetScreen);
    } else {
      onNavigate('signin');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-body selection:bg-[#fe932c] selection:text-[#663500]">
      {/* 1. HEADER */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-[#f8f9ff]/90 backdrop-blur-xl border-b border-[#e5eeff] shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 sm:h-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 lg:gap-8 min-w-0">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2.5 shrink-0 py-1 text-left cursor-pointer group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#fe932c] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[#2f1500] text-xl sm:text-2xl font-bold">minor_crash</span>
              </div>
              <span className="font-headline text-lg sm:text-2xl text-[#0b1c30] tracking-tight font-bold">
                RoadWatch
              </span>
              <span className="hidden sm:inline-flex bg-[#dce9ff] text-[#0b1c30] px-2 py-0.5 rounded-full font-headline text-[10px] uppercase tracking-wider font-bold">
                CIVIC TECH
              </span>
            </button>

            {/* Clean, unauthenticated navigation: NO links to Map, Report, Ops without login */}
            <nav className="hidden xl:flex items-center gap-6 ml-4">
              <a
                href="#protocol"
                className="font-headline text-sm font-bold text-[#0b1c30] hover:text-[#904d00] transition-colors cursor-pointer"
              >
                How It Works
              </a>
              <a
                href="#impact"
                className="font-headline text-sm font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors cursor-pointer"
              >
                Impact &amp; Stats
              </a>
              <a
                href="#partners"
                className="font-headline text-sm font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors cursor-pointer"
              >
                Partnerships
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {!isLoggedIn ? (
              <button
                onClick={() => onNavigate('signin')}
                className="inline-flex min-h-[42px] sm:min-h-[46px] items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#131b2e] text-white hover:bg-black transition-all shadow-sm font-headline text-xs sm:text-sm font-bold cursor-pointer"
              >
                <span className="material-symbols-outlined text-base sm:text-lg text-[#fe932c]">login</span>
                <span>Sign In to Access Portal</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate(userRole === 'dispatcher' ? 'ops' : 'map')}
                  className="inline-flex min-h-[40px] items-center gap-1.5 px-4 py-2 rounded-xl bg-[#fe932c] text-[#2f1500] font-headline text-xs sm:text-sm font-bold shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">dashboard</span>
                  <span>Open {userRole === 'dispatcher' ? 'Ops Console' : 'Hazard Map'}</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden w-10 h-10 rounded-xl bg-[#eff4ff] flex items-center justify-center text-[#0b1c30] hover:bg-[#dce9ff] transition-colors"
              title="Toggle Menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-[#e5eeff] px-4 py-4 flex flex-col gap-2.5 shadow-lg animate-in slide-in-from-top-2">
            <a
              href="#protocol"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-xl text-left font-headline text-sm font-bold text-[#0b1c30] hover:bg-[#eff4ff]"
            >
              How It Works
            </a>
            <a
              href="#impact"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-xl text-left font-headline text-sm font-medium text-[#45464d] hover:bg-[#eff4ff]"
            >
              Impact &amp; Stats
            </a>
            <a
              href="#partners"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2 px-3 rounded-xl text-left font-headline text-sm font-medium text-[#45464d] hover:bg-[#eff4ff]"
            >
              Municipal Partners
            </a>
            <div className="pt-2 border-t border-[#e5eeff]">
              <button
                onClick={() => {
                  onNavigate('signin');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-[#fe932c] text-[#2f1500] font-headline text-xs font-bold text-center"
              >
                Sign In / Register Account
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN CONTENT WRAPPER */}
      <main className="w-full flex-1">
        {/* HERO SECTION */}
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-40 right-1/4 w-[320px] sm:w-[620px] h-[320px] sm:h-[480px] bg-[#fe932c]/10 rounded-full blur-[90px] sm:blur-[130px] pointer-events-none"></div>
          <div className="absolute top-1/2 -left-32 w-[320px] sm:w-[520px] h-[320px] sm:h-[520px] bg-[#d3e4fe]/60 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none"></div>

          <section className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-12 sm:pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Primary Pitch */}
              <div className="lg:col-span-7 flex flex-col items-start gap-4 sm:gap-6 z-10">
                {/* Civic Trust Pill */}
                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-[#e5eeff] border border-[#dce9ff] shadow-sm max-w-full">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fe932c] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#fe932c]"></span>
                  </span>
                  <span className="font-headline text-[11px] sm:text-xs text-[#0b1c30] font-bold tracking-wide uppercase truncate">
                    Official Ward Partnership • 18 Cities Active
                  </span>
                </div>

                {/* Main Headline */}
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[54px] font-headline text-[#0b1c30] tracking-tight font-extrabold leading-tight lg:leading-[60px]">
                  Turn Bumpy Roads into{' '}
                  <span className="text-[#fe932c] relative inline-block">
                    Safer Commutes
                    <svg
                      className="absolute -bottom-1 left-0 w-full h-2.5 text-[#fe932c]/40"
                      preserveAspectRatio="none"
                      viewBox="0 0 100 12"
                    >
                      <path d="M0,8 Q50,0 100,8" fill="none" stroke="currentColor" strokeWidth="4"></path>
                    </svg>
                  </span>
                </h1>

                {/* Sub-copy */}
                <p className="text-sm sm:text-lg text-[#45464d] max-w-xl leading-relaxed">
                  Instant mobile geo-tagged hazard reporting that routes potholes and road defects directly to
                  municipal public works crews with verifiable telemetry and SLA tracking.
                </p>

                {/* Action CTAs without direct unauthenticated map/report bypass */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-1 w-full sm:w-auto">
                  {!isLoggedIn ? (
                    <button
                      onClick={() => onNavigate('signin')}
                      className="group inline-flex min-h-[48px] items-center justify-center gap-2 px-5 sm:px-7 py-3 rounded-xl bg-[#fe932c] text-[#2f1500] font-headline text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:bg-[#e8801b] active:scale-[0.98] transition-all duration-200 text-center w-full sm:w-auto cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base sm:text-lg shrink-0">lock</span>
                      <span className="truncate">Sign In to Access Reporting &amp; Live Map</span>
                      <span className="material-symbols-outlined text-sm sm:text-base transition-transform group-hover:translate-x-1 shrink-0">
                        arrow_forward
                      </span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => onNavigate('report')}
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#fe932c] text-[#2f1500] font-headline text-sm font-bold shadow-md hover:bg-[#e8801b] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">photo_camera</span>
                        <span>Report a Pothole</span>
                      </button>
                      <button
                        onClick={() => onNavigate('map')}
                        className="inline-flex min-h-[48px] items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#e5eeff] text-[#0b1c30] font-headline text-sm font-bold hover:bg-[#dce9ff] border border-[#dce9ff] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">map</span>
                        <span>Open Live Map</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Trust Badges & Avatars */}
                <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6">
                  <div className="flex items-center -space-x-3 shrink-0">
                    <img
                      className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white"
                      alt="Verified commuter"
                      src={ASSETS.avatars.commuter1}
                    />
                    <img
                      className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white"
                      alt="Inspector"
                      src={ASSETS.avatars.inspector}
                    />
                    <img
                      className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-white"
                      alt="Commuter smiling"
                      src={ASSETS.avatars.commuter2}
                    />
                    <div className="w-10 h-10 rounded-full bg-[#131b2e] text-white flex items-center justify-center font-headline text-xs font-bold shadow-sm ring-2 ring-white">
                      +48k
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                      {[...Array(4)].map((_, i) => (
                        <span
                          key={i}
                          className="material-symbols-outlined text-[#fe932c] text-base"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                      <span
                        className="material-symbols-outlined text-[#fe932c] text-base"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star_half
                      </span>
                      <span className="font-headline text-sm text-[#0b1c30] font-bold ml-1">4.9/5</span>
                      <span className="text-xs text-[#45464d]">(Citizen Trust Score)</span>
                    </div>
                    <p className="text-xs text-[#45464d] font-medium mt-0.5">
                      Over 12,000 hazards resolved across 18 municipal wards
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Layered UI Preview Card */}
              <div className="lg:col-span-5 relative flex justify-center items-center py-4 w-full max-w-md mx-auto lg:max-w-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#e5eeff] to-[#dce9ff] rounded-3xl -rotate-2 transform scale-95 opacity-80 shadow-sm pointer-events-none"></div>

                {/* Card Container requiring sign in to inspect */}
                <div
                  onClick={() => handleProtectedAction('tracking')}
                  className="relative w-full max-w-[420px] rounded-3xl bg-white shadow-xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300 border border-[#e5eeff] cursor-pointer group"
                >
                  {/* Top Bar */}
                  <div className="px-4 pt-3.5 pb-2 bg-[#eff4ff] flex items-center justify-between border-b border-[#e5eeff]">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#fe932c] shrink-0"></span>
                      <span className="font-headline text-xs text-[#0b1c30] font-bold uppercase tracking-wider truncate">
                        RoadWatch Telemetry
                      </span>
                    </div>
                    <span className="text-xs text-[#45464d] font-mono shrink-0">AUTHENTICATED ONLY</span>
                  </div>

                  {/* Simulated Mini Map Base Layer */}
                  <div className="w-full h-44 bg-[#eff4ff] relative overflow-hidden">
                    <svg className="w-full h-full opacity-60" viewBox="0 0 380 180" fill="none">
                      <rect width="100%" height="100%" fill="#eff4ff" />
                      <line x1="0" y1="90" x2="380" y2="90" stroke="#cbd5e1" strokeWidth="8" />
                      <line x1="190" y1="0" x2="190" y2="180" stroke="#cbd5e1" strokeWidth="12" />
                      <line x1="0" y1="45" x2="380" y2="45" stroke="#e2e8f0" strokeWidth="4" />
                      <line x1="0" y1="135" x2="380" y2="135" stroke="#e2e8f0" strokeWidth="4" />
                      <line x1="95" y1="0" x2="95" y2="180" stroke="#e2e8f0" strokeWidth="4" />
                      <line x1="285" y1="0" x2="285" y2="180" stroke="#e2e8f0" strokeWidth="4" />
                    </svg>

                    {/* Pin Beacon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="w-11 h-11 rounded-full bg-[#fe932c] flex items-center justify-center shadow-lg animate-pulse">
                        <div className="w-6 h-6 rounded-full bg-[#0b1c30] flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-[#fe932c]"></div>
                        </div>
                      </div>
                      <div className="w-2.5 h-2.5 bg-[#fe932c] rotate-45 -mt-1 shadow"></div>
                      <div className="mt-1 px-2 py-0.5 rounded bg-white/95 backdrop-blur-md shadow text-center border border-[#e5eeff]">
                        <span className="font-headline text-[10px] text-[#0b1c30] font-bold">#HZ-9402</span>
                      </div>
                    </div>
                  </div>

                  {/* Hazard Data Card */}
                  <div className="p-4 flex flex-col gap-3 bg-white">
                    <div className="flex items-start gap-3">
                      <div className="relative w-18 h-18 rounded-xl overflow-hidden shrink-0 shadow-sm border border-[#e5eeff]">
                        <img
                          className="w-full h-full object-cover"
                          alt="Pothole"
                          src={ASSETS.photos.heroPothole}
                        />
                        <span className="absolute bottom-1 right-1 px-1 rounded bg-[#131b2e]/90 text-white font-headline text-[10px] font-semibold">
                          8.5cm
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full bg-[#ffdcc3] text-[#663500] font-headline text-[11px] font-bold">
                            Verified &amp; Dispatched
                          </span>
                          <span className="text-xs text-[#45464d] font-mono">14m ago</span>
                        </div>
                        <h3 className="font-headline text-base text-[#0b1c30] font-bold truncate mt-1">
                          Ward 4 Transit Corridor
                        </h3>
                        <p className="text-xs text-[#45464d] truncate font-mono">
                          37.7749° N, 122.4194° W • Lane 2
                        </p>
                      </div>
                    </div>

                    {/* Sign-in prompt banner on preview */}
                    <div className="p-2.5 bg-[#eff4ff] rounded-xl flex items-center justify-between gap-2 border border-[#dce9ff]">
                      <div className="flex items-center gap-1.5 pl-1">
                        <span className="material-symbols-outlined text-[#fe932c] text-base shrink-0">
                          lock
                        </span>
                        <span className="font-headline text-xs text-[#0b1c30] font-semibold truncate">
                          Sign In to view live dispatch timeline
                        </span>
                      </div>
                      <span className="text-xs text-[#904d00] font-bold shrink-0">Sign In →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 2. STATS & IMPACT BAR */}
        <section id="impact" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="p-4 sm:p-6 rounded-2xl bg-white shadow-sm border border-[#e5eeff] flex flex-col justify-between hover:shadow-md transition-shadow group min-h-[140px]">
              <div className="flex items-center justify-between pb-2 gap-1">
                <span className="font-headline text-xs text-[#45464d] font-bold uppercase tracking-wider truncate">
                  Avg. Repair Time
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#904d00] group-hover:bg-[#fe932c] group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined text-lg">speed</span>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-headline text-[#0b1c30] font-bold">
                    72h
                  </span>
                  <span className="font-headline text-xs text-[#009668] font-bold bg-[#6ffbbe]/30 px-2 py-0.5 rounded-full">
                    -38%
                  </span>
                </div>
                <p className="text-xs text-[#45464d] mt-1">vs traditional phone dispatch systems</p>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-white shadow-sm border border-[#e5eeff] flex flex-col justify-between hover:shadow-md transition-shadow group min-h-[140px]">
              <div className="flex items-center justify-between pb-2 gap-1">
                <span className="font-headline text-xs text-[#45464d] font-bold uppercase tracking-wider truncate">
                  Citizen Reports
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#904d00] group-hover:bg-[#fe932c] group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined text-lg">dynamic_feed</span>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-headline text-[#0b1c30] font-bold">
                    45.2k+
                  </span>
                  <span className="font-headline text-xs text-[#fe932c] font-bold bg-[#ffdcc3]/60 px-2 py-0.5 rounded-full">
                    +18% MoM
                  </span>
                </div>
                <p className="text-xs text-[#45464d] mt-1">Active community mobile submissions</p>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-white shadow-sm border border-[#e5eeff] flex flex-col justify-between hover:shadow-md transition-shadow group min-h-[140px]">
              <div className="flex items-center justify-between pb-2 gap-1">
                <span className="font-headline text-xs text-[#45464d] font-bold uppercase tracking-wider truncate">
                  Active Wards
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#904d00] group-hover:bg-[#fe932c] group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined text-lg">domain</span>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-headline text-[#0b1c30] font-bold">
                    24 Wards
                  </span>
                  <span className="font-headline text-xs text-[#45464d] font-semibold">18 Metro</span>
                </div>
                <p className="text-xs text-[#45464d] mt-1">Direct dispatch integrations live</p>
              </div>
            </div>

            <div className="p-4 sm:p-6 rounded-2xl bg-white shadow-sm border border-[#e5eeff] flex flex-col justify-between hover:shadow-md transition-shadow group min-h-[140px]">
              <div className="flex items-center justify-between pb-2 gap-1">
                <span className="font-headline text-xs text-[#45464d] font-bold uppercase tracking-wider truncate">
                  Accidents Prevented
                </span>
                <div className="w-8 h-8 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#904d00] group-hover:bg-[#fe932c] group-hover:text-white transition-colors shrink-0">
                  <span className="material-symbols-outlined text-lg">shield</span>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-headline text-[#0b1c30] font-bold">
                    1,200+
                  </span>
                  <span className="font-headline text-xs text-[#009668] font-bold bg-[#6ffbbe]/30 px-2 py-0.5 rounded-full">
                    Safety
                  </span>
                </div>
                <p className="text-xs text-[#45464d] mt-1">Safety council verified actuarial model</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS SECTION */}
        <section id="protocol" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5eeff] text-[#0b1c30] font-headline text-xs uppercase tracking-wider mb-2 font-bold">
              System Protocol
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-headline text-[#0b1c30] font-extrabold tracking-tight">
              From Rough Asphalt to Smooth Tarmac in 3 Steps
            </h2>
            <p className="text-base sm:text-lg text-[#45464d] max-w-2xl mt-2">
              Empowering everyday drivers, pedestrians, and cyclists to notify city hall with verifiable telemetry.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col p-6 rounded-2xl bg-white shadow-sm border border-[#e5eeff] hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-13 h-13 rounded-2xl bg-[#fe932c] text-[#2f1500] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl font-bold">center_focus_strong</span>
                </div>
                <span className="font-headline text-4xl text-[#d3e4fe] font-extrabold">01</span>
              </div>
              <h3 className="font-headline text-xl text-[#0b1c30] font-bold mb-2">Snap &amp; Tag</h3>
              <p className="text-sm text-[#45464d] leading-relaxed mb-6">
                Point your smartphone camera at any pothole, frost heave, or sinkhole. Automatic GPS geo-tagging pins
                exact coordinates instantly.
              </p>
              <div className="mt-auto p-3 rounded-xl bg-[#eff4ff] flex items-center gap-2 border border-[#dce9ff]">
                <span className="material-symbols-outlined text-[#fe932c] text-base shrink-0">
                  photo_size_select_actual
                </span>
                <span className="font-headline text-xs text-[#0b1c30] font-medium truncate">
                  Optical Depth AI • Instant Coordinates
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col p-6 rounded-2xl bg-white shadow-sm border border-[#e5eeff] hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-13 h-13 rounded-2xl bg-[#131b2e] text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl">hub</span>
                </div>
                <span className="font-headline text-4xl text-[#d3e4fe] font-extrabold">02</span>
              </div>
              <h3 className="font-headline text-xl text-[#0b1c30] font-bold mb-2">AI Verification &amp; Cluster</h3>
              <p className="text-sm text-[#45464d] leading-relaxed mb-6">
                Our vision model validates severity, measures hazard perimeter, and groups duplicate community reports
                so city maintenance crews aren't spammed.
              </p>
              <div className="mt-auto p-3 rounded-xl bg-[#eff4ff] flex items-center gap-2 border border-[#dce9ff]">
                <span className="material-symbols-outlined text-[#fe932c] text-base shrink-0">verified_user</span>
                <span className="font-headline text-xs text-[#0b1c30] font-medium truncate">
                  Automated De-duplication Engine
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col p-6 rounded-2xl bg-white shadow-sm border border-[#e5eeff] hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="w-13 h-13 rounded-2xl bg-[#6ffbbe] text-[#002113] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl font-bold">task_alt</span>
                </div>
                <span className="font-headline text-4xl text-[#d3e4fe] font-extrabold">03</span>
              </div>
              <h3 className="font-headline text-xl text-[#0b1c30] font-bold mb-2">Track &amp; Celebrate</h3>
              <p className="text-sm text-[#45464d] leading-relaxed mb-6">
                Follow repair progress on the public map or via optional SMS. Once public works asphalt compaction is
                complete, you receive photographic confirmation.
              </p>
              <div className="mt-auto p-3 rounded-xl bg-[#eff4ff] flex items-center gap-2 border border-[#dce9ff]">
                <span className="material-symbols-outlined text-[#fe932c] text-base shrink-0">
                  notification_important
                </span>
                <span className="font-headline text-xs text-[#0b1c30] font-medium truncate">
                  Real-Time SMS • Civic Impact Badge
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. DUAL AUDIENCE CARDS */}
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Card A: For Commuters & Cyclists */}
            <div className="relative p-6 sm:p-10 rounded-3xl bg-white shadow-md border border-[#e5eeff] flex flex-col justify-between overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-[#fe932c]/10 rounded-full blur-2xl pointer-events-none"></div>
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#ffdcc3] text-[#663500] font-headline text-xs uppercase font-bold mb-4">
                  Citizen First
                </div>
                <h3 className="text-2xl sm:text-3xl font-headline text-[#0b1c30] font-extrabold mb-3">
                  For Commuters &amp; Cyclists
                </h3>
                <p className="text-base text-[#45464d] mb-6 leading-relaxed">
                  Keep your daily route safe, prevent vehicular wheel damage, and earn community badges as a verified
                  street steward.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-start sm:items-center gap-3">
                    <span
                      className="material-symbols-outlined text-[#fe932c] text-xl shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span className="text-sm text-[#0b1c30] font-medium">
                      One-click photo submission with AI depth measurement
                    </span>
                  </div>
                  <div className="flex items-start sm:items-center gap-3">
                    <span
                      className="material-symbols-outlined text-[#fe932c] text-xl shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span className="text-sm text-[#0b1c30] font-medium">
                      Live route hazard alerts for bikes, e-scooters &amp; cars
                    </span>
                  </div>
                  <div className="flex items-start sm:items-center gap-3">
                    <span
                      className="material-symbols-outlined text-[#fe932c] text-xl shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span className="text-sm text-[#0b1c30] font-medium">
                      Neighborhood leaderboard &amp; civic impact tracking
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleProtectedAction('report')}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#fe932c] text-[#2f1500] font-headline text-sm font-bold shadow-md hover:bg-[#e8801b] active:scale-[0.98] transition-all text-center w-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg shrink-0">login</span>
                <span>{isLoggedIn ? 'Submit a Road Hazard Now' : 'Sign In to Submit Road Hazards'}</span>
              </button>
            </div>

            {/* Card B: For Municipalities & Public Works */}
            <div className="relative p-6 sm:p-10 rounded-3xl bg-[#131b2e] text-white shadow-xl flex flex-col justify-between overflow-hidden group">
              <div className="absolute -right-12 -top-12 w-52 h-52 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
              <div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-[#d3e4fe] font-headline text-xs uppercase font-bold mb-4 backdrop-blur-md">
                  Department of Transportation
                </div>
                <h3 className="text-2xl sm:text-3xl font-headline text-white font-extrabold mb-3">
                  For City Councils &amp; Road Crews
                </h3>
                <p className="text-base text-slate-300 mb-6 leading-relaxed">
                  Replace legacy 311 backlogs with automated, AI-clustered work orders, smart field crew routing, and
                  open GIS feeds.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-start sm:items-center gap-3">
                    <span
                      className="material-symbols-outlined text-[#fe932c] text-xl shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span className="text-sm text-slate-100 font-medium">
                      Native Open311 &amp; ArcGIS / QGIS sync pipelines
                    </span>
                  </div>
                  <div className="flex items-start sm:items-center gap-3">
                    <span
                      className="material-symbols-outlined text-[#fe932c] text-xl shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span className="text-sm text-slate-100 font-medium">
                      Automated severity scoring &amp; preventative asphalt decay modeling
                    </span>
                  </div>
                  <div className="flex items-start sm:items-center gap-3">
                    <span
                      className="material-symbols-outlined text-[#fe932c] text-xl shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span className="text-sm text-slate-100 font-medium">
                      Optimized field routing reducing municipal fuel expenditures
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleProtectedAction('ops')}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#0b1c30] font-headline text-sm font-bold shadow-md hover:bg-[#eff4ff] active:scale-[0.98] transition-all text-center w-full cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg text-[#fe932c] shrink-0">
                  domain_verification
                </span>
                <span>{isLoggedIn ? 'Access Municipal Console' : 'Sign In to Municipal Console (SSO)'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* 5. TRUSTED PARTNERS & BANNER */}
        <section id="partners" className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
          <div className="p-6 sm:p-10 rounded-3xl bg-[#eff4ff] border border-[#dce9ff] flex flex-col items-center text-center">
            <p className="font-headline text-xs text-[#45464d] font-bold uppercase tracking-widest mb-6 sm:mb-8">
              Trusted By Metropolitan Transportation Authorities • Regional Councils • Active Mobility Alliances
            </p>

            <div className="w-full flex flex-wrap items-center justify-center gap-3 sm:gap-6 opacity-90">
              <div className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/80 shadow-sm border border-[#e5eeff] min-w-[140px]">
                <span className="material-symbols-outlined text-xl text-[#0b1c30]">location_city</span>
                <span className="font-headline text-sm text-[#0b1c30] font-bold">Metro Transit</span>
              </div>
              <div className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/80 shadow-sm border border-[#e5eeff] min-w-[140px]">
                <span className="material-symbols-outlined text-xl text-[#0b1c30]">traffic</span>
                <span className="font-headline text-sm text-[#0b1c30] font-bold">Public Works</span>
              </div>
              <div className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/80 shadow-sm border border-[#e5eeff] min-w-[140px]">
                <span className="material-symbols-outlined text-xl text-[#0b1c30]">pedal_bike</span>
                <span className="font-headline text-sm text-[#0b1c30] font-bold">Urban Mobility</span>
              </div>
              <div className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/80 shadow-sm border border-[#e5eeff] min-w-[140px]">
                <span className="material-symbols-outlined text-xl text-[#0b1c30]">security</span>
                <span className="font-headline text-sm text-[#0b1c30] font-bold">Civic Vision Zero</span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-[#dce9ff] w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-2xl bg-[#fe932c]/20 flex items-center justify-center text-[#fe932c] shrink-0">
                  <span className="material-symbols-outlined text-2xl font-bold">campaign</span>
                </div>
                <div className="min-w-0">
                  <h4 className="font-headline text-base text-[#0b1c30] font-bold">
                    Have a Dangerous Road Trench in Your Neighborhood?
                  </h4>
                  <p className="text-xs text-[#45464d]">
                    Sign in to dispatch reports. Public safety dispatchers respond 24/7.
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleProtectedAction('report')}
                className="shrink-0 w-full sm:w-auto min-h-[44px] flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#131b2e] text-white font-headline text-xs font-semibold hover:bg-black transition-all cursor-pointer"
              >
                {isLoggedIn ? 'Report In Your Ward →' : 'Sign In to Report →'}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* 6. FOOTER */}
      <footer className="w-full bg-[#eff4ff] border-t border-[#dce9ff] mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-12">
            <div className="sm:col-span-2 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#fe932c] flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[#2f1500] text-xl font-bold">minor_crash</span>
                </div>
                <span className="font-headline text-xl text-[#0b1c30] font-bold">RoadWatch</span>
              </div>
              <p className="text-xs text-[#45464d] max-w-sm leading-relaxed">
                Open municipal infrastructure dispatch and citizen-powered road telemetry network. Accelerating street
                repairs, hazard remediation, and public transit safety across 48 metro wards.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#e5eeff] text-[#0b1c30] font-headline text-[10px] font-semibold">
                  SOC2 TYPE II CERTIFIED
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#e5eeff] text-[#0b1c30] font-headline text-[10px] font-semibold">
                  OPEN311 STANDARD V2
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#e5eeff] text-[#0b1c30] font-headline text-[10px] font-semibold">
                  ISO 27001 COMPLIANT
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-headline text-xs text-[#0b1c30] font-bold uppercase tracking-wider">
                Metro Ward Directory
              </h4>
              <ul className="flex flex-col gap-2 text-xs text-[#45464d]">
                <li>
                  <button onClick={() => handleProtectedAction('map')} className="hover:text-[#0b1c30] transition-colors text-left cursor-pointer">
                    Ward 1: Central Commercial
                  </button>
                </li>
                <li>
                  <button onClick={() => handleProtectedAction('map')} className="hover:text-[#0b1c30] transition-colors text-left cursor-pointer">
                    Ward 2: North Freight Corridors
                  </button>
                </li>
                <li>
                  <button onClick={() => handleProtectedAction('map')} className="hover:text-[#0b1c30] transition-colors text-left cursor-pointer">
                    Ward 3: East Harbor Industrial
                  </button>
                </li>
                <li>
                  <button onClick={() => handleProtectedAction('map')} className="hover:text-[#0b1c30] transition-colors text-left font-medium text-[#904d00] cursor-pointer">
                    Ward 4: West Residential Ridge
                  </button>
                </li>
                <li>
                  <button onClick={() => handleProtectedAction('map')} className="hover:text-[#0b1c30] transition-colors text-left cursor-pointer">
                    Ward 5: South Riverway Metro
                  </button>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-headline text-xs text-[#0b1c30] font-bold uppercase tracking-wider">
                Civic Open Data &amp; API
              </h4>
              <ul className="flex flex-col gap-2 text-xs text-[#45464d]">
                <li>
                  <button onClick={() => handleProtectedAction('map')} className="hover:text-[#0b1c30] transition-colors text-left cursor-pointer">
                    Live Telemetry Map
                  </button>
                </li>
                <li>
                  <button onClick={() => handleProtectedAction('ops')} className="hover:text-[#0b1c30] transition-colors text-left cursor-pointer">
                    REST &amp; GeoJSON APIs
                  </button>
                </li>
                <li>
                  <button onClick={() => handleProtectedAction('tracking')} className="hover:text-[#0b1c30] transition-colors text-left cursor-pointer">
                    Quarterly Audit Reports
                  </button>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-headline text-xs text-[#0b1c30] font-bold uppercase tracking-wider">
                City Council Partners
              </h4>
              <div className="flex flex-col gap-2 text-xs text-[#45464d]">
                <div className="p-3 rounded-xl bg-white border border-[#e5eeff]">
                  <p className="font-headline text-xs text-[#0b1c30] font-semibold">
                    Municipal Public Works Consortium
                  </p>
                  <span className="text-[11px] text-[#45464d]">Official Dispatch Protocol</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-[#e5eeff]">
                  <p className="font-headline text-xs text-[#0b1c30] font-semibold">
                    Regional DOT Innovation Lab
                  </p>
                  <span className="text-[11px] text-[#45464d]">Civic Mobility Grantee</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#dce9ff] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#45464d]">
            <p>© 2026 RoadWatch Civic Technologies Initiative. Built in partnership with Regional Transit Authorities.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-[#0b1c30]">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-[#0b1c30]">Terms of Service</a>
              <span>•</span>
              <a href="#" className="hover:text-[#0b1c30]">Open Data License</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
