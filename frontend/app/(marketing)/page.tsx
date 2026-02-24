'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Simplified Logo Component for the Navbar
const Logo = () => (
  <div className="flex items-center gap-2 group cursor-pointer">
    <div className="w-10 h-10 bg-[#164E63] rounded-xl flex items-center justify-center shadow-lg shadow-teal-900/10">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="10" r="3" fill="#2DD4BF"/>
        <circle cx="10" cy="22" r="3" fill="#2DD4BF"/>
        <circle cx="22" cy="22" r="3" fill="#2DD4BF"/>
        <path d="M16 10L10 22M16 10L22 22M10 22L22 22" stroke="#2DD4BF" strokeWidth="2"/>
      </svg>
    </div>
    <span className="text-2xl font-bold tracking-tight text-slate-800">
      Rhizo<span className="text-[#2DD4BF]">Book</span>
    </span>
  </div>
);

const LandingPage: React.FC = () => {
  const [search, setSearch] = useState({ specialty: '', location: '' });
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F0FDF4] font-sans selection:bg-teal-100">
      {/* --- NAVIGATION --- */}
      <nav className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-green-100">
        <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5">
          <Logo />

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition">How it Works</a>
            <a href="#providers" className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition">Browse Providers</a>
            <div className="h-5 w-px bg-slate-200"></div>
            <a
              href="/login"
              className="px-6 py-2.5 rounded-full bg-[#164E63] text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
            >
              Sign In
            </a>
          </div>

          {/* Mobile: Sign In + hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <a
              href="/login"
              className="px-4 py-2 rounded-full bg-[#164E63] text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
            >
              Sign In
            </a>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-green-100 bg-white px-6 py-4 flex flex-col gap-4">
            <a
              href="#how-it-works"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition"
            >
              How it Works
            </a>
            <a
              href="#providers"
              onClick={() => setMenuOpen(false)}
              className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition"
            >
              Browse Providers
            </a>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight mb-6">
            Healthcare, <br />
            <span className="text-teal-600">synchronized.</span>
          </h1>
          <p className="text-xl text-slate-500 mb-12 max-w-xl mx-auto font-medium leading-relaxed">
            The intelligent network connecting patients to providers.
            Find care, book instantly, and grow your roots.
          </p>

          {/*  SEARCH ENGINE UI */}
          <div className="bg-white p-3 rounded-3xl shadow-2xl shadow-emerald-900/10 flex flex-col md:flex-row gap-2 border border-white">
            <div className="flex-1 px-6 py-4 flex flex-col items-start border-r border-slate-50">
              <label className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-1">Service Type</label>
              <input
                type="text"
                placeholder="e.g. Primary Care"
                className="w-full outline-none text-slate-800 placeholder:text-slate-300 font-semibold"
                onChange={(e) => setSearch({ ...search, specialty: e.target.value })}
              />
            </div>
            <div className="flex-1 px-6 py-4 flex flex-col items-start">
              <label className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-1">Near You</label>
              <input
                type="text"
                placeholder="City or Zip"
                className="w-full outline-none text-slate-800 placeholder:text-slate-300 font-semibold"
                onChange={(e) => setSearch({ ...search, location: e.target.value })}
              />
            </div>
            <button className="bg-[#2DD4BF] hover:bg-teal-500 text-[#164E63] px-10 py-5 rounded-2xl font-black transition-all shadow-lg active:scale-95">
              FIND CARE
            </button>
          </div>
        </div>
      </section>

      {/* --- CONTENT BLOCKS --- */}
      <section className="max-w-6xl mx-auto py-20 px-6 grid md:grid-cols-2 gap-12">
        {/* Patient Path */}
        <Link
          href="/register"
          className="block bg-white p-10 rounded-[2.5rem] border border-green-50 shadow-sm hover:shadow-xl transition-all group cursor-pointer"
        >
          <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-teal-500 transition-colors">
            <span className="text-2xl">🌱</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-900 mb-4">For Patients</h3>
          <p className="text-slate-500 mb-8 font-medium">
            Search for local specialists, view real-time availability, and secure your appointment without a single phone call.
          </p>
          <span className="text-teal-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
            Join the network →
          </span>
        </Link>

        {/* Provider Path */}
        <div className="bg-[#164E63] p-10 rounded-[2.5rem] text-white shadow-sm hover:shadow-xl transition-all group">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#2DD4BF] transition-colors">
            <span className="text-2xl">🏢</span>
          </div>
          <h3 className="text-3xl font-bold mb-4">For Providers</h3>
          <p className="text-teal-100/70 mb-8 font-medium">
            Optimize your practice workflow. Manage your digital schedule, reduce no-shows, and focus on what matters: patient care.
          </p>
          <a href="/login?role=provider" className="text-[#2DD4BF] font-bold flex items-center gap-2 hover:gap-3 transition-all">
            Manage your clinic →
          </a>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 text-center text-slate-400 text-sm">
        <p>© 2026 RhizoBook. Hosted on CyberRhizome.ca</p>
      </footer>
    </div>
  );
};

export default LandingPage;