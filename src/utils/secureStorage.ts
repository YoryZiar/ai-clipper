const ENCRYPTION_PREFIX = 'enc:';

function getEncryptionKey(): Uint8Array | null {
  try {
    const raw = btoa(
      `${navigator.userAgent.slice(0, 16)}__${window.location.origin.slice(0, 24)}`
    );
    const hashInput = new TextEncoder().encode(raw);
    return hashInput.slice(0, 32);
  } catch {
    return null;
  }
}

function xorEncode(plaintext: string): string {
  const key = getEncryptionKey();
  if (!key) return plaintext;

  const input = new TextEncoder().encode(plaintext);
  const result = new Uint8Array(input.length + 1);
  result[0] = 0xab; // magic byte
  for (let i = 0; i < input.length; i++) {
    result[i + 1] = input[i] ^ key[i % key.length];
  }
  return ENCRYPTION_PREFIX + btoa(String.fromCharCode(...result));
}

function xorDecode(encoded: string): string {
  if (!encoded.startsWith(ENCRYPTION_PREFIX)) return encoded;

  const key = getEncryptionKey();
  if (!key) return encoded.slice(ENCRYPTION_PREFIX.length);

  try {
    const raw = atob(encoded.slice(ENCRYPTION_PREFIX.length));
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) {
      bytes[i] = raw.charCodeAt(i);
    }
    if (bytes[0] !== 0xab) return encoded;
    const decoded = new Uint8Array(bytes.length - 1);
    for (let i = 0; i < decoded.length; i++) {
      decoded[i] = bytes[i + 1] ^ key[i % key.length];
    }
    return new TextDecoder().decode(decoded);
  } catch {
    return encoded.slice(ENCRYPTION_PREFIX.length);
  }
}

export const secureStorage = {
  setItem(key: string, value: string): void {
    if (!value) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, xorEncode(value));
  },

  getItem(key: string): string {
    const raw = localStorage.getItem(key);
    if (!raw) return '';
    return xorDecode(raw);
  },

  removeItem(key: string): void {
    localStorage.removeItem(key);
  },
};
