import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { ClipperProvider, useClipper } from './context/ClipperContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HeaderNav } from './components/HeaderNav';

const LandingPage = React.lazy(() => import('./components/landing/LandingPage').then(m => ({ default: m.LandingPage })));
const UserDashboard = React.lazy(() => import('./components/dashboard/UserDashboard').then(m => ({ default: m.UserDashboard })));
const VideoWorkspace = React.lazy(() => import('./components/workspace/VideoWorkspace').then(m => ({ default: m.VideoWorkspace })));
const SettingsPage = React.lazy(() => import('./components/settings/SettingsPage').then(m => ({ default: m.SettingsPage })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin" />
    </div>
  );
}

function MainAppContent() {
  return (
    <div className="min-h-screen bg-[#09090b] font-sans text-zinc-100 antialiased selection:bg-purple-600 selection:text-white flex flex-col justify-between">
      <div className="flex flex-col flex-1">
        <HeaderNav />
        <main className="flex-1 flex flex-col">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/workspace" element={<VideoWorkspace />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Suspense>
        </main>
      </div>

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
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <ClipperProvider>
            <MainAppContent />
          </ClipperProvider>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}
