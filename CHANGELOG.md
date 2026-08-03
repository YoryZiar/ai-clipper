# Changelog

## v2.6.0 (2026-08-04)

### 🐛 Bug Fixes
- **Fix #1:** Crash saat klik "Uji Coba dengan Sample Video" karena `loadSampleVideo` tidak terdefinisi di context
- **Fix #7:** Unsafe `as any` casting pada ReactPlayer ref — diganti dengan helper `seekTo()` typed
- **Fix #11:** `alert()` mentah untuk error handling — diganti dengan Toast notification system + ErrorBoundary

### 🔐 Security
- **Fix #2:** API key Gemini/OpenAI disimpan mentah di localStorage — sekarang dienkripsi dengan `secureStorage` utility (XOR cipher)
- **Fix #3:** Server tanpa proteksi — ditambahkan Helm, CORS, rate limiting (30 req/mnt untuk generate, 60 req/mnt untuk youtube-info), dan input validation whitelist

### 🏗 Architecture
- **Fix #4:** 13 state dalam 1 context provider tanpa memoization — di-split dengan `useReducer` + `useCallback` + `useMemo`
- **Fix #5:** Tidak ada deep linking atau browser history — migrasi ke React Router v6 (routes: `/`, `/dashboard`, `/workspace`, `/settings`)
- **Fix #6:** Tidak ada code splitting — semua halaman di-wrap dengan `React.lazy()` + `Suspense`

### ✨ New Features
- **Fix #8:** Export modal hanya simulasi progress bar — integrasi FFmpeg.wasm untuk real H.264 rendering (trim video, crop 9:16, encode)
- **Fix #9:** YouTube URL hanya string label — endpoint `/api/youtube-info` server-side via `yt-dlp --dump-json`
- **Fix #10:** Multi-track timeline hanya UI dekoratif — subtitle blocks kini interaktif (drag horizontal untuk geser timing, playhead cursor, keyboard shortcuts)
- **Fix #12:** Tidak ada undo/redo — history stack di reducer dengan `UNDO`/`REDO` actions, Ctrl+Z / Ctrl+Shift+Z support

### 🧹 Cleanup
- Menghapus semua sample video (SAMPLE_VIDEOS, loadSampleVideo, isSample field, tombol "Uji Coba")
- Rename `sampleVideos.ts` → `captionPresets.ts` (hanya berisi preset caption)

### 📦 New Dependencies
- `react-router-dom` — client-side routing
- `@ffmpeg/ffmpeg`, `@ffmpeg/util` — video rendering
- `express-rate-limit`, `helmet`, `cors` — server security

### 📄 New Files
- `src/context/ToastContext.tsx`
- `src/components/ErrorBoundary.tsx`
- `src/utils/secureStorage.ts`
- `README.md`
- `CHANGELOG.md`

---

## v2.5.0 (Initial)

- Two-phase AI pipeline (Gemini/OpenAI thinking + Render)
- 9:16 Smart Crop speaker tracking overlay
- Subtitle karaoke multi-bahasa editor (EN/ID/JP/ES)
- 4 caption style presets (MrBeast Bold, Neon Cyber, Podcast Clean, Minimalist White)
- 4 layout modes (smart-crop, split-screen, center-fit, blurred-bg)
- Export modal dengan FFmpeg.wasm / Remotion AWS pilihan
- Settings page untuk konfigurasi AI provider (Google / Custom Gemini / OpenAI)
- Web Speech API TTS voiceover
- React Player video playback
- Express + Vite dev server
