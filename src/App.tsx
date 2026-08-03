import React from 'react';
import { ClipperProvider, useClipper } from './context/ClipperContext';
import { HeaderNav } from './components/HeaderNav';
import { LandingPage } from './components/landing/LandingPage';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { VideoWorkspace } from './components/workspace/VideoWorkspace';
import { SettingsPage } from './components/settings/SettingsPage';

function MainAppContent() {
  const { currentPage } = useClipper();

  return (
    <div className="min-h-screen bg-[#09090b] font-sans text-zinc-100 antialiased selection:bg-purple-600 selection:text-white flex flex-col justify-between">
      <div className="flex flex-col flex-1">
        <HeaderNav />
        <main className="flex-1 flex flex-col">
          {currentPage === 'landing' && <LandingPage />}
          {currentPage === 'dashboard' && <UserDashboard />}
          {currentPage === 'workspace' && <VideoWorkspace />}
          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Bottom Status Bar Footer */}
      <footer className="h-8 border-t border-zinc-800 bg-[#0c0c0e] px-4 lg:px-8 flex items-center justify-between text-[10px] text-zinc-500 font-mono sticky bottom-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            Phase 2: Local Render Active
          </span>
          <span className="opacity-40">|</span>
          <span>Storage: 450 MB / 5 GB</span>
        </div>
        <div className="flex gap-4">
          <span>V 2.5.0-STABLE</span>
          <span className="text-purple-400 font-semibold">CPU ACCEL: ON</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ClipperProvider>
      <MainAppContent />
    </ClipperProvider>
  );
}

