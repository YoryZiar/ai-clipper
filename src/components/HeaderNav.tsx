import React from 'react';
import { useClipper } from '../context/ClipperContext';
import { Scissors, Sparkles, LayoutDashboard, Film, Zap, ShieldCheck, Settings } from 'lucide-react';

export const HeaderNav: React.FC = () => {
  const { currentPage, setCurrentPage, generatedClips } = useClipper();

  return (
    <header className="sticky top-0 z-40 bg-[#0c0c0e] border-b border-zinc-800 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('landing')}>
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/20">
            <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              AutoClip Pro
            </span>
            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
              AI Auto Clipper
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Pill Style) */}
        <nav className="flex bg-zinc-900/90 rounded-full p-1 border border-zinc-800">
          <button
            onClick={() => setCurrentPage('landing')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentPage === 'landing'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fitur & Beranda</span>
          </button>

          <button
            onClick={() => setCurrentPage('dashboard')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentPage === 'dashboard'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard AI</span>
          </button>

          <button
            onClick={() => setCurrentPage('workspace')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentPage === 'workspace'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Video Editor</span>
            {generatedClips.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-purple-500/20 text-purple-300 font-bold rounded-full">
                {generatedClips.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentPage('settings')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentPage === 'settings'
                ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Pengaturan</span>
          </button>
        </nav>

        {/* Action Button & Badges */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-900/60 px-3 py-1 rounded-full border border-zinc-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tanpa Watermark</span>
          </div>

          <button
            onClick={() => setCurrentPage('dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-purple-900/20 transition-all hover:scale-105 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Buat Klip Sekarang</span>
          </button>
        </div>

      </div>
    </header>
  );
};

