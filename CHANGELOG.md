# Changelog

## v2.7.0 (2026-08-04)

### 🔐 Security
- **#1 Keamanan API key:** Manajemen key dipindah ke server-side (`SERVER_*` env). Server kini prioritas pakai `GEMINI_API_KEY`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL` dari environment. Key klien hanya fallback.
- **#1a Endpoint `/api/ai-config`:** Menampilkan status konfigurasi server (apakah key terkonfigurasi, default model) TANPA membocorkan key.
- **#1b Fix crash forced-reasoning:** Parsing respons OpenAI kini fallback ke `reasoning_content` jika `content` kosong (kompatibel model Kenari seperti `deepseek-v4-flash`, `kimi-k3`), dan `JSON.parse` dibungkus `try/catch` agar tak crash saat JSON tidak valid.

### 🎙 New Features — Auto-Transkripsi
- **#3 Transkripsi otomatis:** Tombol "Transkrip Otomatis" di tab upload video. Menggunakan Web Speech API native browser (`SpeechRecognition`/`webkitSpeechRecognition`) untuk menghasilkan transkrip dari file video MP4 tanpa server, dengan mapping bahasa (`Indonesian`→`id-ID`, `English`→`en-US`, `Japanese`→`ja-JP`, `Spanish`→`es-ES`).
- **#3a** Progress transkrip parsial ditampilkan real-time dan disimpan ke `clipperConfig.transcriptText` untuk dikirim ke analisis AI.

### 🎬 New Features — Render
- **#4 Burn-in subtitle:** Toggle "Burn-in Subtitle (Tertanam di Video)" di ExportModal. Subtitle di-render langsung ke video via filter `drawtext` FFmpeg.wasm (per-baris, posisi bawah, font size adaptif resolusi, border hitam + shadow), sehingga klip siap upload tanpa overlay terpisah.

### 🧹 Cleanup & Quality
- **#5 TypeScript strict mode:** `"strict": true` diaktifkan; ±28 error strict (implicit any, null checks) diperbaiki. `@types/react`, `@types/react-dom`, `@types/cors` ditambahkan ke devDependencies.
- **#5a** 7 file scratch test (`test-react-player-*.js/.jsx`, `test-rp-client.html`) di-un-track dan ditambahkan ke `.gitignore`.
- **#5b** Default model OpenAI kini `gpt-5-6-luna` (model Kenari terverifikasi) menggantikan `gpt-4o-mini`.

### 📦 New Dependencies (devDependencies)
- `@types/react`, `@types/react-dom`, `@types/cors` — tipe untuk strict mode

---

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
