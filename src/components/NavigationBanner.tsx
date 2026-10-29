import React from 'react';
import { ScreenType, UserRole } from '../types';

interface NavigationBannerProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  isLoggedIn: boolean;
  userRole: UserRole | null;
  onLogout: () => void;
  unassignedCount?: number;
}

export const NavigationBanner: React.FC<NavigationBannerProps> = ({
  currentScreen,
  onNavigate,
  isLoggedIn,
  userRole,
  onLogout,
  unassignedCount = 14,
}) => {
  return (
    <div className="sticky top-0 z-[100] bg-[#131b2e] text-white border-b border-white/10 px-2 sm:px-6 py-2 shadow-md">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
        {/* Brand Lockup */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer text-left"
        >
          <div className="w-6 h-6 rounded-md bg-[#fe932c] flex items-center justify-center text-[#2f1500] shrink-0">
            <span className="material-symbols-outlined text-[15px] font-bold">minor_crash</span>
          </div>
          <span className="font-headline font-bold text-xs sm:text-sm tracking-tight text-white whitespace-nowrap">
            RoadWatch
          </span>
          <span className="hidden md:inline-block px-1.5 py-0.5 rounded bg-white/10 text-slate-300 text-[9px] font-mono uppercase">
            Civic Tech
          </span>
        </button>

        {/* Dynamic Navigation according to authentication status */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!isLoggedIn ? (
            /* When NOT logged in: Absolutely NO Map, Report, Track, Ops buttons! */
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => onNavigate('landing')}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-headline font-semibold transition-all cursor-pointer shrink-0 ${
                  currentScreen === 'landing'
                    ? 'bg-white/15 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">home</span>
                <span>Home</span>
              </button>

              <button
                onClick={() => onNavigate('signin')}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-headline font-bold transition-all shadow-sm cursor-pointer shrink-0 ${
                  currentScreen === 'signin'
                    ? 'bg-[#fe932c] text-[#2f1500]'
                    : 'bg-[#fe932c] text-[#2f1500] hover:bg-[#e8801b]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">login</span>
                <span>Sign In / Join</span>
              </button>
            </div>
          ) : (
            /* When LOGGED IN: Authenticated Navigation with user role & sign out */
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <button
                onClick={() => onNavigate('landing')}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-headline font-medium transition-all shrink-0 ${
                  currentScreen === 'landing' ? 'bg-white/20 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">home</span>
                <span className="hidden xs:inline">Home</span>
              </button>

              {userRole === 'dispatcher' ? (
                <>
                  <button
                    onClick={() => onNavigate('ops')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-headline font-bold transition-all shrink-0 ${
                      currentScreen === 'ops' ? 'bg-[#fe932c] text-[#2f1500]' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">dashboard</span>
                    <span>Ops Console</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-red-500 text-white font-bold">
                      {unassignedCount}
                    </span>
                  </button>
                  <button
                    onClick={() => onNavigate('map')}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-headline font-medium transition-all shrink-0 ${
                      currentScreen === 'map' ? 'bg-white/20 text-white' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">map</span>
                    <span>GIS Map</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('map')}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-headline font-bold transition-all shrink-0 ${
                      currentScreen === 'map' ? 'bg-[#fe932c] text-[#2f1500]' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">map</span>
                    <span>Live Map</span>
                  </button>
                  <button
                    onClick={() => onNavigate('report')}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-headline font-medium transition-all shrink-0 ${
                      currentScreen === 'report' ? 'bg-[#fe932c] text-[#2f1500]' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">add_a_photo</span>
                    <span>Report</span>
                  </button>
                  <button
                    onClick={() => onNavigate('tracking')}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] sm:text-xs font-headline font-medium transition-all shrink-0 ${
                      currentScreen === 'tracking' ? 'bg-[#fe932c] text-[#2f1500]' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">timeline</span>
                    <span>Track</span>
                  </button>
                </>
              )}

              {/* Status Indicator & Logout (clean & compact on mobile) */}
              <div className="flex items-center gap-1.5 pl-1.5 sm:pl-2 border-l border-white/20 shrink-0">
                <span className="hidden lg:inline px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-headline text-[10px] font-bold">
                  {userRole === 'dispatcher' ? 'Dispatcher Mode' : 'Commuter Verified'}
                </span>
                <button
                  onClick={onLogout}
                  className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] sm:text-xs font-headline font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title="Sign Out"
                >
                  <span className="material-symbols-outlined text-[14px]">logout</span>
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
