import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClipper } from '../context/ClipperContext';
import { Scissors, Sparkles, LayoutDashboard, Film, Zap, ShieldCheck, Settings } from 'lucide-react';

export const HeaderNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useClipper();

  const currentPath = location.pathname === '/' ? 'landing' : location.pathname.slice(1) || 'landing';

  const routes: Record<string, string> = {
    landing: '/',
    dashboard: '/dashboard',
    workspace: '/workspace',
    settings: '/settings',
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c0c0e] border-b border-zinc-800 px-4 lg:px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
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

        <nav className="flex bg-zinc-900/90 rounded-full p-1 border border-zinc-800">
          {[
            { path: '/', key: 'landing', label: 'Fitur & Beranda', icon: Sparkles },
            { path: '/dashboard', key: 'dashboard', label: 'Dashboard AI', icon: LayoutDashboard },
            { path: '/workspace', key: 'workspace', label: 'Video Editor', icon: Film },
            { path: '/settings', key: 'settings', label: 'Pengaturan', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                currentPath === tab.key
                  ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.key === 'workspace' && state.generatedClips.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-purple-500/20 text-purple-300 font-bold rounded-full">
                  {state.generatedClips.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-900/60 px-3 py-1 rounded-full border border-zinc-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tanpa Watermark</span>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
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
