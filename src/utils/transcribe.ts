const LANG_MAP: Record<string, string> = {
  Indonesian: 'id-ID',
  English: 'en-US',
  Japanese: 'ja-JP',
  Spanish: 'es-ES',
};

export async function transcribeAudioFromVideo(
  file: File,
  lang: string,
  onProgress: (partial: string) => void
): Promise<string> {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    throw new Error('Browser tidak mendukung auto-transkripsi');
  }

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const videoUrl = URL.createObjectURL(file);
    video.src = videoUrl;
    video.muted = true;
    video.playsInline = true;

    const targetLang = LANG_MAP[lang] || lang || 'id-ID';

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = targetLang;

    let finalTranscript = '';
    let mediaRecorder: MediaRecorder | null = null;
    let stream: MediaStream | null = null;

    const cleanup = () => {
      try {
        recognition.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop();
        } catch (e) {
          // Ignore
        }
      }
      video.pause();
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(videoUrl);
    };

    video.oncanplay = () => {
      try {
        if ((video as any).captureStream) {
          stream = (video as any).captureStream();
        } else if ((video as any).mozCaptureStream) {
          stream = (video as any).mozCaptureStream();
        }

        if (stream && typeof MediaRecorder !== 'undefined') {
          try {
            mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            mediaRecorder.start();
          } catch (e) {
            try {
              mediaRecorder = new MediaRecorder(stream);
              mediaRecorder.start();
            } catch (errRec) {
              console.warn('MediaRecorder init warning:', errRec);
            }
          }
        }

        recognition.start();
        video.play().catch((err) => {
          cleanup();
          reject(new Error(`Gagal memutar video untuk transkripsi: ${err.message}`));
        });
      } catch (err: any) {
        cleanup();
        reject(new Error(`Gagal memulai transkripsi: ${err.message}`));
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Gagal memuat file video'));
    };

    const fullResultMap = new Map<number, string>();

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          fullResultMap.set(i, transcript);
        } else {
          interimTranscript += transcript;
        }
      }

      const currentFinal = Array.from(fullResultMap.values()).join(' ');
      finalTranscript = (currentFinal + ' ' + interimTranscript).trim();
      onProgress(finalTranscript);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        return;
      }
      console.warn('SpeechRecognition warning/error:', event.error);
    };

    recognition.onend = () => {
      if (!video.ended && !video.paused) {
        try {
          recognition.start();
        } catch (e) {
          // Ignore if already started
        }
      }
    };

    video.onended = () => {
      setTimeout(() => {
        const resultText = Array.from(fullResultMap.values()).join(' ').trim() || finalTranscript;
        cleanup();
        resolve(resultText);
      }, 500);
    };
  });
}
