import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BrainCircuit,
  Cpu,
  Layers,
  Crop,
  Languages,
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  Video,
  FileVideo,
  Flame,
  Volume2,
  Sliders,
  CloudLightning,
  ShieldAlert,
  SlidersHorizontal,
  Wand2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeDemoTab, setActiveDemoTab] = useState<'smartcrop' | 'subtitles' | 'twophase'>('twophase');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-purple-500 selection:text-white">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-6 shadow-lg shadow-purple-950/50">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>AI Auto Clipper v2.5 — Generasi Klip Viral Otomatis</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Ubah Video Panjang Jadi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
              Klip Short 9:16 Viral
            </span>{" "}
            Dalam Hitungan Detik
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
            Platform otomatis bertenaga AI yang menyeleksi bagian paling menarik dari podcast dan video panjang.
            Dilengkapi <strong className="text-purple-300">Dua Fase Proses (Berpikir AI vs Render Fleksibel)</strong>,
            pelacak pembicara <strong>Smart Crop 9:16</strong>, dan subtitle gaya MrBeast tanpa watermark.
          </p>

          {/* Call To Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-base rounded-2xl shadow-xl shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>Coba Generator AI Sekarang</span>
            </button>
          </div>

          {/* Trust Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-sm">
            <div className="text-center p-2">
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">
                100% Lokal
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Dukungan FFmpeg.wasm</p>
            </div>

            <div className="text-center p-2 border-l border-slate-800">
              <div className="text-2xl font-black text-cyan-400">9:16 Auto</div>
              <p className="text-xs text-slate-400 mt-0.5">Smart Face Tracking</p>
            </div>

            <div className="text-center p-2 border-l border-slate-800">
              <div className="text-2xl font-black text-pink-400">98% Acc</div>
              <p className="text-xs text-slate-400 mt-0.5">Deteksi Hook Viral AI</p>
            </div>

            <div className="text-center p-2 border-l border-slate-800">
              <div className="text-2xl font-black text-emerald-400">0 Watermark</div>
              <p className="text-xs text-slate-400 mt-0.5">Siap Unggah HD 1080p</p>
            </div>
          </div>

        </div>
      </section>

      {/* TWO-PHASE PROCESS EXPLANATION SECTION */}
      <section className="py-16 px-4 bg-slate-900/40 border-y border-slate-800/60 relative">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-950/60 px-3 py-1 rounded-full border border-purple-800/50">
              Arsitektur Fungsional Utama
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
              Inovasi Dua Fase Proses: Berpikir vs Render
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base mt-2">
              Sistem memisahkan tugas berat kecerdasan buatan dari proses pengolahan video untuk kecepatan & efisiensi maksimal.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            
            {/* Phase 1 Card */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-purple-950/50 to-slate-900 border border-purple-500/30 shadow-2xl flex flex-col justify-between group hover:border-purple-500/60 transition-all">
              <div className="absolute top-4 right-4 px-3 py-1 bg-purple-500/20 text-purple-300 font-mono text-xs font-bold rounded-lg border border-purple-500/40">
                FASE 1: CLOUD AI
              </div>

              <div>
                <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="w-7 h-7" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  1. Fase Berpikir AI (AI Thinking)
                </h3>

                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Gemini AI menganalisis transkrip dan konteks pembicaraan secara mendalam untuk menentukan momen paling emosional dan berpotensi viral.
                </p>

                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <span>Mengekstrak ucapan & menentukan skor viralitas (85 - 99/100).</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <span>Deteksi jenis hook: Pertanyaan Kontroversial, Fakta Mengejutkan, Storytelling.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <span>Menghasilkan transkrip subtitle tersinkron presisi detik ke detik.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 border-t border-purple-900/40 flex items-center justify-between text-xs text-purple-300 font-medium">
                <span>Output: Struktur Klip & Waktu Precision</span>
                <span className="font-mono text-purple-400">~2.5 Detik</span>
              </div>
            </div>

            {/* Phase 2 Card */}
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-cyan-950/30 to-slate-900 border border-cyan-500/30 shadow-2xl flex flex-col justify-between group hover:border-cyan-500/60 transition-all">
              <div className="absolute top-4 right-4 px-3 py-1 bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold rounded-lg border border-cyan-500/40">
                FASE 2: RENDERING
              </div>

              <div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
                  <Cpu className="w-7 h-7" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  2. Fase Render Fleksibel (Lokal & Cloud)
                </h3>

                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Proses pemotongan video fisik, pelacakan wajah 9:16, dan penempelan subtitle animasi dilakukan secara mulus melalui 2 pilihan mesin.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-cyan-300 mb-1">
                      <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> Client-Side FFmpeg.wasm</span>
                      <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded border border-cyan-800">100% Gratis</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Render langsung di browser tanpa mengunggah berkas ke server eksternal.</p>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-300 mb-1">
                      <span className="flex items-center gap-1.5"><CloudLightning className="w-3.5 h-3.5 text-indigo-400" /> Remotion AWS Lambda</span>
                      <span className="text-[10px] bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-800">Super Cepat</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Render ribuan frame secara paralel di cloud untuk resolusi 4K 60fps.</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-cyan-900/40 flex items-center justify-between text-xs text-cyan-300 font-medium">
                <span>Ekspor MP4 Hasil Akhir</span>
                <span className="font-mono text-cyan-400">Tanpa Watermark</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FEATURE SHOWCASE GRID */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Fitur Unggulan Kelas Profesional
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Semua yang Anda butuhkan untuk memangkas waktu produksi konten 90% lebih cepat.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4 border border-purple-500/20">
              <Crop className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Crop 9:16 Speaker Tracking</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Secara otomatis mengunci wajah pembicara aktif dan menggeser bingkai 9:16 dengan mulus tanpa bagian kepala terpotong.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4 border border-cyan-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Multi-Track Timeline Editor</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Workspace interaktif dengan Track Video, Track Subtitle, dan Track Audio BGM untuk kontrol penyuntingan presisi.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4 border border-pink-500/20">
              <Languages className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Subtitle Multi-Bahasa Karaoke</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mendukung Bahasa Indonesia, Inggris, Jepang, dan Spanyol dengan animasi sorot per kata (Karaoke Style) peningkat retensi.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 border border-indigo-500/20">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Skor Viralitas & Hook AI</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              AI memberikan peringkat potensi viral (misal: 98/100) beserta saran caption dan hashtag yang sedang tren.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Preset Caption Populer</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pilihan gaya subtitle siap pakai: MrBeast Bold, Neon Cyber, Podcast Clean, dan Minimalist White.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-slate-900/70 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20">
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Ekspor MP4 Tanpa Watermark</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Hasil bersih resolusi Full HD / 4K tanpa watermark yang dapat langsung diunggah ke TikTok, YouTube Shorts, dan IG Reels.
            </p>
          </div>

        </div>
      </section>

      {/* INTERACTIVE COMPARISON SECTION */}
      <section className="py-16 px-4 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">
              Mengapa Beralih ke AI Auto Clipper?
            </h2>
            <p className="text-slate-400 text-sm mt-1">Perbandingan proses manual tradisional vs otomatisasi AI</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Traditional */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-red-900/30">
              <div className="flex items-center gap-2 text-red-400 font-bold text-base mb-4">
                <ShieldAlert className="w-5 h-5" />
                <span>Cara Edit Manual Tradisional</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-center gap-2">❌ Membutuhkan 3-4 jam menonton seluruh video panjang</li>
                <li className="flex items-center gap-2">❌ Memotong klip satu per satu secara manual di Premiere/CapCut</li>
                <li className="flex items-center gap-2">❌ Mengetik ulang transkrip & menyinkronkan subtitle secara lambat</li>
                <li className="flex items-center gap-2">❌ Kesulitan menggeser kamera 9:16 secara pas mengikuti gerakan</li>
              </ul>
            </div>

            {/* AI Auto Clipper */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/40 shadow-xl">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-base mb-4">
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400" />
                <span>AI Auto Clipper (LokaClip Pro)</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-200 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Selesai otomatis dalam kurang dari 30 detik</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI menemukan 3-7 klip dengan skor viral paling tinggi</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Subtitle karaoke multi-bahasa terbuat otomatis</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Smart Crop 9:16 siap ekspor tanpa watermark</li>
              </ul>
            </div>
          </div>

          {/* Bottom Banner CTA */}
          <div className="mt-14 p-8 rounded-3xl bg-gradient-to-r from-purple-900/60 via-indigo-900/60 to-cyan-900/60 border border-purple-500/40 text-center relative overflow-hidden">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Siap Membuat Klip Viral Pertama Anda?
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto mb-6">
              Unggah berkas MP4 lokal Anda atau tempelkan tautan YouTube untuk memulainya secara otomatis.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-400/20 transition-all hover:scale-105"
            >
              <span>Buka Dashboard Generator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
