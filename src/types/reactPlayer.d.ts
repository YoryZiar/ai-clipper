interface ReactPlayerInstance {
  seekTo: (amount: number, type?: 'seconds' | 'fraction') => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getInternalPlayer: (key?: string) => Record<string, unknown> | null;
  showPreview: () => void;
}

export type ReactPlayerRef = ReactPlayerInstance | null;
