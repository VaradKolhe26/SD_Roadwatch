import React, { useState } from 'react';
import { ScreenType, UserRole } from '../types';

interface AuthScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onLogin: (role: UserRole) => void;
}

// Preset verified credentials for evaluation & real testing
export const DEMO_ACCOUNTS = {
  citizen: {
    email: 'citizen@roadwatch.org',
    password: 'Citizen2026!',
    name: 'Ananya Karmakar',
    roleLabel: 'Citizen / Commuter',
    ward: 'ward-4',
    badge: 'Civic Steward #408',
  },
  admin: {
    email: 'admin@roadwatch.gov',
    password: 'AdminSecure2026!',
    name: 'Chief Officer Rajesh Shinde',
    roleLabel: 'Municipal Dispatcher & Admin',
    ward: 'ward-4',
    badge: 'MUNI-DISPATCH-904',
  },
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ onNavigate, onLogin }) => {
  const [role, setRole] = useState<'commuter' | 'contractor'>('commuter');
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [ward, setWard] = useState('ward-4');

  // Distinct credential state for each role
  const [citizenEmail, setCitizenEmail] = useState(DEMO_ACCOUNTS.citizen.email);
  const [citizenPassword, setCitizenPassword] = useState(DEMO_ACCOUNTS.citizen.password);

  const [adminEmail, setAdminEmail] = useState(DEMO_ACCOUNTS.admin.email);
  const [adminPassword, setAdminPassword] = useState(DEMO_ACCOUNTS.admin.password);
  const [adminBadgeId, setAdminBadgeId] = useState(DEMO_ACCOUNTS.admin.badge);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active credentials based on selected role
  const currentEmail = role === 'commuter' ? citizenEmail : adminEmail;
  const currentPassword = role === 'commuter' ? citizenPassword : adminPassword;

  const handleRoleChange = (newRole: 'commuter' | 'contractor') => {
    setRole(newRole);
    setErrorMessage(null);
  };

  const handleQuickFill = (target: 'citizen' | 'admin') => {
    if (target === 'citizen') {
      setRole('commuter');
      setCitizenEmail(DEMO_ACCOUNTS.citizen.email);
      setCitizenPassword(DEMO_ACCOUNTS.citizen.password);
    } else {
      setRole('contractor');
      setAdminEmail(DEMO_ACCOUNTS.admin.email);
      setAdminPassword(DEMO_ACCOUNTS.admin.password);
      setAdminBadgeId(DEMO_ACCOUNTS.admin.badge);
    }
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (role === 'contractor') {
      // Admin / Municipal Validation
      const trimmedEmail = adminEmail.trim().toLowerCase();
      const trimmedPwd = adminPassword.trim();

      const isAdminEmail =
        trimmedEmail.includes('admin') ||
        trimmedEmail.includes('.gov') ||
        trimmedEmail.includes('pwd') ||
        trimmedEmail.includes('dispatcher') ||
        trimmedEmail === 'rajesh.shinde@pwd.gov.in';

      const isValidAdminPwd =
        trimmedPwd === DEMO_ACCOUNTS.admin.password ||
        trimmedPwd === 'admin123' ||
        trimmedPwd === 'RoadWatch2026!';

      if (trimmedEmail === DEMO_ACCOUNTS.citizen.email) {
        setErrorMessage(
          'Citizen credentials cannot be used for Municipal Admin. Use admin@roadwatch.gov / AdminSecure2026!'
        );
        return;
      }

      if (!isAdminEmail || !isValidAdminPwd) {
        setErrorMessage(
          'Access Denied: Invalid Admin credentials. Please use admin@roadwatch.gov and password AdminSecure2026!'
        );
        return;
      }

      // Successful Admin Authentication
      onLogin('dispatcher');
      onNavigate('ops');
    } else {
      // Citizen Validation
      const trimmedEmail = citizenEmail.trim().toLowerCase();
      const trimmedPwd = citizenPassword.trim();

      if (trimmedEmail === DEMO_ACCOUNTS.admin.email) {
        setErrorMessage(
          'This is a Municipal Admin account. Please switch to the "Municipal Admin / Crew" tab above.'
        );
        return;
      }

      if (!trimmedEmail || !trimmedPwd) {
        setErrorMessage('Please enter both your email and password.');
        return;
      }

      // Successful Citizen Authentication
      onLogin('commuter');
      onNavigate('map');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8f9ff] text-[#0b1c30] selection:bg-[#fe932c] selection:text-[#663500]">
      {/* ========================================================= */}
      {/* LEFT PANEL: Responsive Dynamic Civic Brand Section         */}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-1/2 bg-[#0B132B] text-white flex flex-col justify-between p-6 sm:p-10 lg:p-16 overflow-hidden min-h-[240px] sm:min-h-[400px] lg:min-h-screen">
        {/* Background Graphic Textures */}
        <div className="absolute inset-0 road-grid opacity-60 pointer-events-none"></div>

        {/* Dynamic Glow: Orange for Citizen, Deep Blue/Emerald for Admin */}
        <div
          className={`absolute -top-32 -left-32 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full blur-[100px] sm:blur-[120px] pointer-events-none transition-colors duration-500 ${
            role === 'contractor' ? 'bg-sky-500/20' : 'bg-[#fe932c]/20'
          }`}
        ></div>
        <div className="absolute top-1/2 right-0 w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] bg-emerald-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none"></div>

        {/* Vector SVG Curves */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none hidden sm:block"
          preserveAspectRatio="none"
          viewBox="0 0 800 1000"
          fill="none"
        >
          <path d="M-50,200 C200,150 350,380 850,280" stroke="#FE932C" strokeWidth="2.5" strokeDasharray="8 6" />
          <path d="M-50,450 C300,520 450,250 850,560" stroke="#38BDF8" strokeWidth="2" />
          <path d="M-100,750 C180,680 400,900 900,720" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="5 5" />
          <circle cx="320" cy="460" r="6" fill="#FE932C" />
          <circle cx="320" cy="460" r="14" stroke="#FE932C" strokeWidth="1.5" opacity="0.6" />
          <circle cx="580" cy="310" r="5" fill="#38BDF8" />
        </svg>

        {/* Top: Logo & Back Button */}
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2.5 sm:gap-3 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#fe932c] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[#2f1500] text-xl sm:text-2xl font-bold">minor_crash</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline font-bold text-xl sm:text-2xl tracking-tight text-white">RoadWatch</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
                  {role === 'contractor' ? 'ADMIN CONSOLE' : 'CITIZEN PORTAL'}
                </span>
              </div>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium hidden sm:inline">
                Community-driven civic infrastructure.
              </span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            <span>Back to Home</span>
          </button>
        </div>

        {/* Center: Dynamic Context (Citizen Story vs Municipal Command) */}
        <div className="relative z-10 my-4 lg:my-auto py-2 sm:py-6 lg:py-10 max-w-xl">
          {role === 'commuter' ? (
            /* Citizen / Commuter Telemetry Card */
            <>
              <div className="inline-flex items-center gap-2.5 sm:gap-3 px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-xl mb-4 lg:mb-8">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-semibold text-white tracking-wide">Pothole #4208 Patched</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300 truncate max-w-[140px] sm:max-w-none">Kalyan-Shilphata Corridor</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-medium">
                  4m ago
                </span>
              </div>

              <div className="relative p-5 sm:p-7 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-md shadow-2xl hidden sm:block">
                <div className="flex items-center gap-1 text-[#fe932c] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  ))}
                  <span className="text-xs font-bold text-slate-300 ml-2">Verified Citizen Report</span>
                </div>

                <blockquote className="text-base sm:text-lg text-slate-100 font-headline font-medium leading-relaxed mb-4">
                  “Reporting took 15 seconds at the red light. The ward public works office dispatched a road team and patched
                  it within 48 hours.”
                </blockquote>

                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#fe932c] to-amber-200 text-[#663500] font-headline font-bold flex items-center justify-center text-xs shadow">
                      AK
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white leading-tight">Ananya Karmakar</p>
                      <p className="text-[11px] text-slate-400">Daily Commuter &amp; Ward 4 Steward</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    <span>Fixed in 46h</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Municipal Admin & Dispatch Telemetry Card */
            <>
              <div className="inline-flex items-center gap-2.5 sm:gap-3 px-3.5 py-2 rounded-2xl bg-sky-950/80 backdrop-blur-xl border border-sky-400/30 shadow-xl mb-4 lg:mb-8">
                <span className="material-symbols-outlined text-sky-400 text-sm">shield</span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-semibold text-white tracking-wide">Public Works Operations Center</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-sky-200">Official Municipal Access</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold">
                  SLA LEVEL 2
                </span>
              </div>

              <div className="relative p-5 sm:p-7 rounded-3xl bg-slate-900/80 border border-sky-500/30 backdrop-blur-md shadow-2xl hidden sm:block">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-300 font-mono">
                    <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                    DISPATCH CONSOLE TELEMETRY
                  </span>
                  <span className="text-xs font-mono text-slate-400">ID: {adminBadgeId}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 my-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[11px] text-slate-400">Active Work Orders</div>
                    <div className="text-xl font-bold font-headline text-white mt-0.5">24 Live Repairs</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[11px] text-slate-400">SLA Compliance</div>
                    <div className="text-xl font-bold font-headline text-emerald-400 mt-0.5">96.4% On-Time</div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-sky-700 text-white font-headline font-bold flex items-center justify-center text-xs shadow">
                      RS
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white leading-tight">Inspector Rajesh Shinde</p>
                      <p className="text-[11px] text-slate-400">Chief Public Works Dispatcher • Ward 4</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-sky-500/20 text-sky-200 px-2 py-1 rounded">AUTH GRANTED</span>
                </div>
              </div>
            </>
          )}

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-4 lg:mt-8 pt-1">
            <div className="flex flex-col">
              <span className="font-headline font-bold text-lg sm:text-2xl text-white">45.2k+</span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Hazard Logs</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-lg sm:text-2xl text-[#fe932c]">72h Avg</span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Repair Time</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-lg sm:text-2xl text-sky-400">18 Wards</span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">DOT Sync</span>
            </div>
          </div>
        </div>

        {/* Bottom Civic Authority Trust Bar (Laptop lg+) */}
        <div className="relative z-10 pt-4 border-t border-white/10 hidden lg:flex items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-[#fe932c]">handshake</span>
            <span>Partnered with municipal corporations &amp; civic road boards.</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
            <span>OPEN311</span>
            <span>•</span>
            <span>SOC2</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANEL: Auth Container & Interactive Form            */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-5 sm:p-10 lg:p-16 bg-[#f8f9ff] min-h-[calc(100vh-240px)] sm:min-h-screen">
        <div className="w-full max-w-[480px] flex flex-col py-4">
          {/* Top Role Switcher */}
          <div className="p-1.5 bg-[#e5eeff] rounded-2xl flex items-center mb-5 border border-[#c6c6cd]/30 shadow-inner">
            <button
              type="button"
              onClick={() => handleRoleChange('commuter')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-headline font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                role === 'commuter'
                  ? 'bg-white text-[#0b1c30] shadow-md border border-slate-200'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              <span className="material-symbols-outlined text-base text-[#fe932c] shrink-0">directions_car</span>
              <span>Citizen / Commuter</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('contractor')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-headline font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                role === 'contractor'
                  ? 'bg-[#131b2e] text-white shadow-md'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              <span className="material-symbols-outlined text-base text-sky-400 shrink-0">admin_panel_settings</span>
              <span>Municipal Admin</span>
            </button>
          </div>

          {/* Quick Demo Credentials Cheat Sheet / 1-Click Fillers */}
          <div className="mb-5 p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs text-[#fe932c]">key</span>
                Separate Demo Credentials
              </span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                Click to Auto-Fill
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('citizen')}
                className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                  role === 'commuter'
                    ? 'border-[#fe932c] bg-amber-50/60 ring-2 ring-[#fe932c]/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-[#0b1c30]">Citizen Login</span>
                  <span className="material-symbols-outlined text-xs text-[#fe932c]">person</span>
                </div>
                <div className="text-[10px] text-slate-600 font-mono truncate">{DEMO_ACCOUNTS.citizen.email}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Key: {DEMO_ACCOUNTS.citizen.password}</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className={`p-2 rounded-lg text-left border transition-all cursor-pointer ${
                  role === 'contractor'
                    ? 'border-sky-600 bg-sky-50/60 ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-[#0b1c30]">Admin Login</span>
                  <span className="material-symbols-outlined text-xs text-sky-600">verified_user</span>
                </div>
                <div className="text-[10px] text-slate-600 font-mono truncate">{DEMO_ACCOUNTS.admin.email}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">Key: {DEMO_ACCOUNTS.admin.password}</div>
              </button>
            </div>
          </div>

          {/* Auth Mode Toggle & Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex p-1 bg-[#eff4ff] rounded-xl border border-[#c6c6cd]/30">
              <button
                type="button"
                onClick={() => setTab('signin')}
                className={`px-3.5 py-1.5 rounded-lg font-headline text-xs transition-all cursor-pointer ${
                  tab === 'signin'
                    ? 'bg-white text-[#0b1c30] font-bold shadow-sm'
                    : 'text-[#45464d] hover:text-[#0b1c30] font-medium'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`px-3.5 py-1.5 rounded-lg font-headline text-xs transition-all cursor-pointer ${
                  tab === 'signup'
                    ? 'bg-white text-[#0b1c30] font-bold shadow-sm'
                    : 'text-[#45464d] hover:text-[#0b1c30] font-medium'
                }`}
              >
                Create Account
              </button>
            </div>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                role === 'contractor'
                  ? 'text-sky-800 bg-sky-50 border-sky-200'
                  : 'text-emerald-700 bg-emerald-50 border-emerald-200'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${role === 'contractor' ? 'bg-sky-500' : 'bg-emerald-500'}`}
              ></span>
              {role === 'contractor' ? 'MUNI-ID Required' : 'Citizen Portal'}
            </span>
          </div>

          <div className="mb-4">
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-[#0b1c30] tracking-tight">
              {role === 'contractor'
                ? 'Municipal Admin & Dispatch Console'
                : tab === 'signin'
                ? 'Welcome back, Citizen'
                : "Join your city's road patrol"}
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#45464d] mt-1 leading-relaxed">
              {role === 'contractor'
                ? 'Official public works credentials are required to dispatch repair work orders and view telemetry.'
                : tab === 'signin'
                ? 'Log in to report potholes, track ongoing repairs, and corroborate hazard logs in your neighborhood.'
                : 'Help map road defects and accelerate civic repairs in your ward in seconds.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-fadeIn">
              <span className="material-symbols-outlined text-base text-red-600 shrink-0 mt-0.5">error</span>
              <div className="flex-1 font-body">{errorMessage}</div>
            </div>
          )}

          {/* Social or SSO Buttons */}
          {role === 'commuter' ? (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#c6c6cd]/60 bg-white hover:bg-[#eff4ff] text-[#0b1c30] font-headline text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-[#c6c6cd]/60 bg-white hover:bg-[#eff4ff] text-[#0b1c30] font-headline text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[#fe932c] text-base">smartphone</span>
                <span>Mobile OTP</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-sky-300 bg-sky-50/70 hover:bg-sky-100/70 text-[#0b1c30] font-headline text-xs font-semibold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sky-700 text-base">domain</span>
                <span>Regional DOT SSO</span>
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-sky-300 bg-sky-50/70 hover:bg-sky-100/70 text-[#0b1c30] font-headline text-xs font-semibold transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-sky-700 text-base">smart_card</span>
                <span>GovID SmartCard</span>
              </button>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-4">
            <div className="border-t border-[#c6c6cd]/40 w-full"></div>
            <span className="bg-[#f8f9ff] px-3 text-[10px] font-bold text-[#45464d] uppercase tracking-wider whitespace-nowrap">
              {role === 'contractor' ? 'Or municipal credentials' : 'Or continue with email'}
            </span>
            <div className="border-t border-[#c6c6cd]/40 w-full"></div>
          </div>

          {/* Form */}
          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {/* Primary City / Ward */}
            <div className="space-y-1">
              <label className="block font-headline font-semibold text-xs text-[#0b1c30]" htmlFor="ward-select">
                {role === 'contractor' ? 'Assigned Jurisdiction / Ward' : 'Primary City / Ward'}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45464d] text-lg pointer-events-none">
                  location_city
                </span>
                <select
                  id="ward-select"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#c6c6cd]/70 bg-white text-[#0b1c30] font-body text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#fe932c]/40 focus:border-[#fe932c] transition-all appearance-none cursor-pointer"
                >
                  <option value="ward-1">Ward 1: Central Commercial &amp; Boulevard</option>
                  <option value="ward-2">Ward 2: North Freight &amp; Highway Corridors</option>
                  <option value="ward-3">Ward 3: East Harbor Industrial Belt</option>
                  <option value="ward-4">Ward 4: West Residential Ridge &amp; Suburbs</option>
                  <option value="ward-5">Ward 5: South Riverway Metro Zone</option>
                  <option value="other">Outside Listed Wards (GPS Auto-detect)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-[#45464d] text-lg pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Admin Badge ID (Only in Admin mode) */}
            {role === 'contractor' && (
              <div className="space-y-1 animate-fadeIn">
                <label className="block font-headline font-semibold text-xs text-[#0b1c30]" htmlFor="admin-badge">
                  Official Municipal Officer Badge #
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45464d] text-lg">
                    badge
                  </span>
                  <input
                    id="admin-badge"
                    type="text"
                    value={adminBadgeId}
                    onChange={(e) => setAdminBadgeId(e.target.value)}
                    placeholder="e.g. MUNI-DISPATCH-904"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sky-300 bg-sky-50/30 text-[#0b1c30] font-mono text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1">
              <label className="block font-headline font-semibold text-xs text-[#0b1c30]" htmlFor="auth-id">
                {role === 'contractor' ? 'Official Municipal Email' : 'Email Address'}
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45464d] text-lg">
                  mail
                </span>
                <input
                  id="auth-id"
                  type="text"
                  value={currentEmail}
                  onChange={(e) =>
                    role === 'commuter' ? setCitizenEmail(e.target.value) : setAdminEmail(e.target.value)
                  }
                  placeholder={
                    role === 'contractor' ? 'e.g. admin@roadwatch.gov' : 'e.g. citizen@roadwatch.org'
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c6c6cd]/70 bg-white text-[#0b1c30] placeholder:text-[#45464d]/50 font-body text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#fe932c]/40 focus:border-[#fe932c] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block font-headline font-semibold text-xs text-[#0b1c30]" htmlFor="auth-pwd">
                  {role === 'contractor' ? 'Admin Security Key' : 'Password'}
                </label>
                <a href="#" className="font-headline font-semibold text-xs text-[#904d00] hover:text-[#0b1c30] transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45464d] text-lg">
                  lock
                </span>
                <input
                  id="auth-pwd"
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) =>
                    role === 'commuter' ? setCitizenPassword(e.target.value) : setAdminPassword(e.target.value)
                  }
                  placeholder={role === 'contractor' ? 'Enter admin security key' : 'Enter citizen password'}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[#c6c6cd]/70 bg-white text-[#0b1c30] placeholder:text-[#45464d]/50 font-body text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#fe932c]/40 focus:border-[#fe932c] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#45464d] hover:text-[#0b1c30] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#c6c6cd] text-[#fe932c] focus:ring-[#fe932c]/30 accent-[#fe932c] cursor-pointer"
                />
                <span className="font-body text-xs text-[#45464d]">Keep me signed in</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">256-bit SSL</span>
            </div>

            {/* Submit Button */}
            <div className="pt-1.5">
              <button
                type="submit"
                className={`w-full py-3.5 px-6 rounded-xl font-headline font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer ${
                  role === 'contractor'
                    ? 'bg-[#131b2e] text-white hover:bg-black'
                    : 'bg-[#fe932c] text-[#2f1500] hover:bg-[#e8801b]'
                }`}
              >
                <span>
                  {role === 'contractor'
                    ? 'Authenticate & Enter Admin Console'
                    : tab === 'signup'
                    ? 'Create Verified Citizen Account'
                    : 'Sign In to Citizen Portal'}
                </span>
                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>
            </div>
          </form>

          {/* Quick Guest Report */}
          <div className="text-center mt-4">
            <p className="text-xs text-[#45464d] font-body">
              Need to report an immediate hazard without an account?
              <button
                type="button"
                onClick={() => onNavigate('report')}
                className="font-headline font-bold text-[#904d00] hover:underline ml-1 cursor-pointer"
              >
                File a Quick Guest Report →
              </button>
            </p>
          </div>

          {/* Municipal SSO notice */}
          <div
            className={`mt-5 p-3 rounded-xl border flex items-start gap-2.5 ${
              role === 'contractor'
                ? 'bg-sky-50/70 border-sky-200'
                : 'bg-[#eff4ff] border-[#c6c6cd]/40'
            }`}
          >
            <div
              className={`p-1 rounded-lg shrink-0 mt-0.5 ${
                role === 'contractor' ? 'bg-sky-700 text-white' : 'bg-[#131b2e] text-white'
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {role === 'contractor' ? 'security' : 'verified_user'}
              </span>
            </div>
            <div className="text-[11px] text-[#45464d] leading-relaxed">
              {role === 'contractor' ? (
                <span>
                  <strong className="text-[#0b1c30]">Security Policy:</strong> Municipal Admin accounts possess dispatch
                  and work-order authorization. All login activity is logged in accordance with Open311 &amp; municipal
                  audit standards.
                </span>
              ) : (
                <span>
                  <strong className="text-[#0b1c30]">Citizen Guarantee:</strong> Your reports directly alert certified
                  road inspectors and public works crews. Privacy is protected by default.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
