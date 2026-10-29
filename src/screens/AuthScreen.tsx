import React, { useState } from 'react';
import { ScreenType, UserRole } from '../types';

interface AuthScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onLogin: (role: UserRole) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onNavigate, onLogin }) => {
  const [role, setRole] = useState<'commuter' | 'contractor'>('commuter');
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [ward, setWard] = useState('ward-4');
  const [identifier, setIdentifier] = useState('ananya.karmakar@civicmail.org');
  const [password, setPassword] = useState('RoadWatch2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'contractor') {
      onLogin('dispatcher');
      onNavigate('ops');
    } else {
      onLogin('commuter');
      onNavigate('map');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8f9ff] text-[#0b1c30] selection:bg-[#fe932c] selection:text-[#663500]">
      {/* ========================================================= */}
      {/* LEFT PANEL: Responsive Brand Section                      */}
      {/* On Laptop: 50% width full height.                         */}
      {/* On Mobile: Compact top civic banner with live ticker.    */}
      {/* ========================================================= */}
      <div className="relative w-full lg:w-1/2 bg-[#0B132B] text-white flex flex-col justify-between p-6 sm:p-10 lg:p-16 overflow-hidden min-h-[220px] sm:min-h-[380px] lg:min-h-screen">
        {/* Background Graphic Textures */}
        <div className="absolute inset-0 road-grid opacity-60 pointer-events-none"></div>

        {/* Stylized Radial Glowing Gradients */}
        <div className="absolute -top-32 -left-32 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#fe932c]/15 rounded-full blur-[100px] sm:blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/2 right-0 w-[300px] sm:w-[420px] h-[300px] sm:h-[420px] bg-sky-500/10 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none"></div>

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
                  Civic Tech
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

        {/* Center: Live Telemetry & Testimonial on Laptop/Tablet */}
        <div className="relative z-10 my-4 lg:my-auto py-2 sm:py-6 lg:py-10 max-w-xl">
          {/* Live Telemetry Pill */}
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

          {/* Featured Commuter Testimonial (full on lg, compact on mobile) */}
          <div className="relative p-5 sm:p-7 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-md shadow-2xl pulse-glow hidden sm:block">
            <div className="flex items-center gap-1 text-[#fe932c] mb-3">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  star
                </span>
              ))}
              <span className="text-xs font-bold text-slate-300 ml-2">Verified Ward Report</span>
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
                  <p className="text-[11px] text-slate-400">Daily Commuter &amp; Ward 7 Steward</p>
                </div>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium">
                <span className="material-symbols-outlined text-xs">verified</span>
                <span>Fixed in 46h</span>
              </div>
            </div>
          </div>

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
      {/* Adapts seamlessly: centered & clean on all screens        */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-5 sm:p-10 lg:p-16 bg-[#f8f9ff] min-h-[calc(100vh-220px)] sm:min-h-screen">
        <div className="w-full max-w-[460px] flex flex-col py-4">
          {/* Top Role Switcher */}
          <div className="p-1.5 bg-[#e5eeff] rounded-2xl flex items-center mb-6 sm:mb-8 border border-[#c6c6cd]/30 shadow-inner">
            <button
              type="button"
              onClick={() => setRole('commuter')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl font-headline font-semibold text-[11px] sm:text-xs transition-all cursor-pointer ${
                role === 'commuter'
                  ? 'bg-white text-[#0b1c30] shadow-sm'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#fe932c] shrink-0">directions_car</span>
              <span className="truncate">Citizen / Commuter</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('contractor')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl font-headline font-semibold text-[11px] sm:text-xs transition-all cursor-pointer ${
                role === 'contractor'
                  ? 'bg-white text-[#0b1c30] shadow-sm'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-[#131b2e] shrink-0">engineering</span>
              <span className="truncate">Municipal / Crew</span>
            </button>
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
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              GovID Enabled
            </span>
          </div>

          <div className="mb-5">
            <h2 className="font-headline font-bold text-2xl sm:text-3xl text-[#0b1c30] tracking-tight">
              {role === 'contractor'
                ? 'Municipal Crew Portal'
                : tab === 'signin'
                ? 'Welcome back, commuter'
                : "Join your city's road patrol"}
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#45464d] mt-1 leading-relaxed">
              {role === 'contractor'
                ? 'Log in with public works credentials to access dispatch work orders & GIS feeds.'
                : tab === 'signin'
                ? 'Log in to track your road reports, view repair timelines, and earn steward badges.'
                : 'Help map potholes and accelerate road repairs in your neighborhood in seconds.'}
            </p>
          </div>

          {/* Quick Social Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#c6c6cd]/60 bg-white hover:bg-[#eff4ff] text-[#0b1c30] font-headline text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
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
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#c6c6cd]/60 bg-white hover:bg-[#eff4ff] text-[#0b1c30] font-headline text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[#fe932c] text-base">smartphone</span>
              <span>Mobile OTP</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-[#c6c6cd]/40 w-full"></div>
            <span className="bg-[#f8f9ff] px-3 text-[10px] font-bold text-[#45464d] uppercase tracking-wider whitespace-nowrap">
              Or continue with email
            </span>
            <div className="border-t border-[#c6c6cd]/40 w-full"></div>
          </div>

          {/* Form */}
          <form className="space-y-3.5" onSubmit={handleSubmit}>
            {/* Primary City / Ward */}
            <div className="space-y-1">
              <label className="block font-headline font-semibold text-xs text-[#0b1c30]" htmlFor="ward-select">
                Primary City / Ward
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

            {/* Email Address */}
            <div className="space-y-1">
              <label className="block font-headline font-semibold text-xs text-[#0b1c30]" htmlFor="auth-id">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#45464d] text-lg">
                  mail
                </span>
                <input
                  id="auth-id"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@domain.com or +1 (555) 000-0000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#c6c6cd]/70 bg-white text-[#0b1c30] placeholder:text-[#45464d]/50 font-body text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#fe932c]/40 focus:border-[#fe932c] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block font-headline font-semibold text-xs text-[#0b1c30]" htmlFor="auth-pwd">
                  Password
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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

            {/* Submit */}
            <div className="pt-1.5">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#fe932c] text-[#2f1500] hover:bg-[#e8801b] font-headline font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>
                  {role === 'contractor'
                    ? 'Access Municipal Console'
                    : tab === 'signup'
                    ? 'Create Verified Account'
                    : 'Sign In to RoadWatch'}
                </span>
                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              </button>
            </div>
          </form>

          {/* Quick Guest Report */}
          <div className="text-center mt-5">
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
          <div className="mt-6 p-3 rounded-xl bg-[#eff4ff] border border-[#c6c6cd]/40 flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-[#131b2e] text-white shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-sm">verified_user</span>
            </div>
            <div className="text-[11px] text-[#45464d] leading-relaxed">
              <span className="font-bold text-[#0b1c30]">Official Ward Dispatchers:</span> Single Sign-On (SSO) through
              Regional DOT credentials is automatically detected via your municipal email handle.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
