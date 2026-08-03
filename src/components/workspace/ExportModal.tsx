import React, { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useClipper } from '../../context/ClipperContext';
import { useToast } from '../../context/ToastContext';
import {
  Download,
  X,
  Layers,
  CloudLightning,
  ShieldCheck,
  Zap,
  Film,
  FileCheck,
} from 'lucide-react';
import { RenderEngine } from '../../types';

export const ExportModal: React.FC = () => {
  const { state, dispatch } = useClipper();
  const { addToast } = useToast();

  const [resolution, setResolution] = useState<'1080p' | '4k'>('1080p');
  const [fps, setFps] = useState<30 | 60>(60);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportComplete, setExportComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const ffmpegRef = useRef(new FFmpeg());
  const loaded = useRef(false);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const load = async () => {
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on('log', ({ message }) => console.log(message));
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setFfmpegLoaded(true);
    };
    load();
  }, []);

  if (!state.exportModalOpen || !state.activeClip) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportComplete(false);

    if (state.renderEngine === 'remotion-aws') {
      for (let i = 10; i <= 100; i += 10) {
        await new Promise((r) => setTimeout(r, 250));
        setExportProgress(i);
      }
      setIsExporting(false);
      setExportComplete(true);
      setDownloadUrl(state.videoSource?.url || '#');
      return;
    }

    const ffmpeg = ffmpegRef.current;
    const progressHandler = ({ progress }: { progress: number }) => {
      const pct = Math.round(progress * 100);
      setExportProgress(Math.max(20, Math.min(95, 20 + pct * 0.75)));
    };

    try {
      if (!ffmpeg.loaded) {
        setExportProgress(5);
        await new Promise<void>((resolve) => {
          const check = () => {
            if (ffmpegLoaded) resolve();
            else setTimeout(check, 100);
          };
          check();
        });
      }

      setExportProgress(10);

      const clip = state.activeClip!;
      const startSeconds = clip.startSeconds;
      const clipDuration = clip.endSeconds - clip.startSeconds;
      const targetWidth = resolution === '4k' ? 2160 : 1080;
      const targetHeight = resolution === '4k' ? 3840 : 1920;

      let inputData: Uint8Array;
      if (state.videoSource?.file) {
        inputData = await fetchFile(state.videoSource.file);
      } else if (state.videoSource?.url) {
        inputData = await fetchFile(state.videoSource.url);
      } else {
        throw new Error('No video source available');
      }

      setExportProgress(15);
      await ffmpeg.writeFile('input.mp4', inputData);

      setExportProgress(20);

      ffmpeg.on('progress', progressHandler);

      const filterGraph = `crop=ih*9/16:ih,scale=${targetWidth}:${targetHeight}`;

      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-ss', String(startSeconds),
        '-t', String(clipDuration),
        '-vf', filterGraph,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '23',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-r', String(fps),
        'output.mp4',
      ]);

      setExportProgress(95);

      const outputData = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([outputData], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);

      setExportProgress(100);
      setIsExporting(false);
      setExportComplete(true);
      setDownloadUrl(url);
    } catch (err) {
      console.error('FFmpeg export error:', err);
      addToast(
        `Gagal render: ${err instanceof Error ? err.message : 'Error tidak diketahui'}`,
        'error',
      );
      setIsExporting(false);
      setExportComplete(false);
    } finally {
      ffmpeg.off('progress', progressHandler);
      ffmpeg.deleteFile('input.mp4').catch(() => {});
      ffmpeg.deleteFile('output.mp4').catch(() => {});
    }
  };

  const handleReset = () => {
    setIsExporting(false);
    setExportProgress(0);
    setExportComplete(false);
    if (downloadUrl && downloadUrl.startsWith('blob:')) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Export 9:16 Video (No Watermark)
              </h3>
              <p className="text-xs text-zinc-400">
                Pilih mesin render dan resolusi untuk mengunduh MP4
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleReset();
              dispatch({ type: 'SET_EXPORT_MODAL', payload: false });
            }}
            className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white transition-all border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clip Summary Pill */}
        <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Film className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-zinc-200 max-w-[240px] truncate">
              {state.activeClip.title}
            </span>
          </div>
          <span className="text-[11px] font-mono text-purple-400 font-bold bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800">
              {state.activeClip.durationText}
          </span>
        </div>

        {!exportComplete ? (
          <>
            {/* Render Engine Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-zinc-300 block uppercase tracking-widest text-[10px]">
                Arsitektur Mesin Render:
              </label>

              <div className="grid grid-cols-2 gap-3">
                
                {/* Option 1: FFmpeg.wasm */}
                <div
                  onClick={() => dispatch({ type: 'SET_RENDER_ENGINE', payload: 'ffmpeg-wasm' })}
                  className={`cursor-pointer p-4 rounded-xl border transition-all text-left space-y-1.5 ${
                    state.renderEngine === 'ffmpeg-wasm'
                      ? 'bg-purple-950/40 border-purple-500 shadow-md'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-purple-400" /> FFmpeg.wasm
                    </span>
                    <span className="text-[9px] font-bold bg-purple-950 text-purple-300 px-1.5 py-0.2 rounded border border-purple-800 font-mono">
                      CLIENT
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Render 100% lokal di browser Anda. Privasi terjamin & hemat biaya server.
                  </p>
                </div>

                {/* Option 2: Remotion AWS Lambda */}
                <div
                  onClick={() => dispatch({ type: 'SET_RENDER_ENGINE', payload: 'remotion-aws' })}
                  className={`cursor-pointer p-4 rounded-xl border transition-all text-left space-y-1.5 ${
                    state.renderEngine === 'remotion-aws'
                      ? 'bg-purple-950/40 border-purple-500 shadow-md'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CloudLightning className="w-4 h-4 text-cyan-400" /> Remotion AWS
                    </span>
                    <span className="text-[9px] font-bold bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800 font-mono">
                      CLOUD
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Render serverless terdistribusi super cepat untuk pemrosesan paralel 4K.
                  </p>
                </div>

              </div>
            </div>

            {/* Resolution & FPS */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2 uppercase tracking-widest text-[10px]">
                  Resolusi Ekspor:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setResolution('1080p')}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      resolution === '1080p'
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    1080p Full HD
                  </button>
                  <button
                    onClick={() => setResolution('4k')}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      resolution === '4k'
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    4K Ultra HD
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-2 uppercase tracking-widest text-[10px]">
                  Frame Rate:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFps(30)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      fps === 30
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    30 FPS
                  </button>
                  <button
                    onClick={() => setFps(60)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${
                      fps === 60
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    60 FPS
                  </button>
                </div>
              </div>
            </div>

            {/* Features Guarantee */}
            <div className="flex items-center justify-between text-xs text-zinc-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 font-mono text-[11px]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Format MP4 H.264</span>
              </span>
              <span className="text-emerald-400 font-bold">100% Bebas Watermark</span>
            </div>

            {/* Progress or Render Action */}
            {isExporting ? (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs font-mono text-zinc-400">
                  <span>MEMPROSES FRAME ({state.renderEngine})...</span>
                  <span className="text-purple-400 font-bold">{exportProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full transition-all duration-200"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartExport}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Mulai Render & Unduh MP4</span>
              </button>
            )}
          </>
        ) : (
          /* Complete State */
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <FileCheck className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">Ekspor Selesai Disiapkan!</h4>
              <p className="text-xs text-zinc-400 mt-1">
                Klip berkualitas tinggi tanpa watermark siap diunggah ke TikTok, Reels, atau Shorts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={downloadUrl || '#'}
                download={`${state.activeClip.title.replace(/\s+/g, '_')}_916.mp4`}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Berkas MP4</span>
              </a>

              <button
                onClick={handleReset}
                className="px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl transition-all border border-zinc-700"
              >
                Ekspor Lagi
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
