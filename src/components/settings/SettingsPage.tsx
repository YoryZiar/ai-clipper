import React, { useState, useEffect } from 'react';
import { Save, Key, Server, CheckCircle2, AlertCircle, Link, Cpu } from 'lucide-react';
import { secureStorage } from '../../utils/secureStorage';

export const SettingsPage: React.FC = () => {
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState('');
  const [openaiModel, setOpenaiModel] = useState('');
  const [provider, setProvider] = useState('google');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedGeminiKey = secureStorage.getItem('CUSTOM_GEMINI_API_KEY');
    const savedOpenaiKey = secureStorage.getItem('OPENAI_API_KEY');
    const savedOpenaiBaseUrl = secureStorage.getItem('OPENAI_BASE_URL');
    const savedOpenaiModel = secureStorage.getItem('OPENAI_MODEL');
    const savedProvider = secureStorage.getItem('AI_PROVIDER') || 'google';
    setGeminiKey(savedGeminiKey);
    setOpenaiKey(savedOpenaiKey);
    setOpenaiBaseUrl(savedOpenaiBaseUrl);
    setOpenaiModel(savedOpenaiModel);
    setProvider(savedProvider);
  }, []);

  const handleSave = () => {
    secureStorage.setItem('CUSTOM_GEMINI_API_KEY', geminiKey);
    secureStorage.setItem('OPENAI_API_KEY', openaiKey);
    secureStorage.setItem('OPENAI_BASE_URL', openaiBaseUrl);
    secureStorage.setItem('OPENAI_MODEL', openaiModel);
    secureStorage.setItem('AI_PROVIDER', provider);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#09090b]">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Pengaturan
          </h1>
          <p className="text-zinc-400 mt-2">
            Konfigurasi model AI, API keys, dan preferensi aplikasi lainnya.
          </p>
        </div>

        <div className="bg-[#0c0c0e] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-800">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Server className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">AI Provider</h2>
              <p className="text-sm text-zinc-500">Pilih provider AI yang akan digunakan untuk AutoClip.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300">Provider AI</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="google">Google Gemini (Default)</option>
                <option value="custom">Custom Gemini API Key</option>
                <option value="openai">OpenAI Compatible (OpenAI, DeepSeek, dll)</option>
              </select>
            </div>

            {provider === 'custom' && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Key Gemini Anda
                </label>
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-zinc-600"
                />
                <p className="text-xs text-zinc-500 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  Key ini disimpan secara lokal di browser Anda dan hanya dikirimkan ke server saat request.
                </p>
              </div>
            )}

            {provider === 'openai' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    API Key
                  </label>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-zinc-600"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Base URL (Opsional)
                  </label>
                  <input
                    type="text"
                    value={openaiBaseUrl}
                    onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-zinc-600"
                  />
                  <p className="text-xs text-zinc-500">Kosongkan untuk menggunakan default OpenAI URL.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Cpu className="w-4 h-4" />
                    Nama Model
                  </label>
                  <input
                    type="text"
                    value={openaiModel}
                    onChange={(e) => setOpenaiModel(e.target.value)}
                    placeholder="gpt-4o-mini"
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder:text-zinc-600"
                  />
                  <p className="text-xs text-zinc-500">Contoh: gpt-4o, deepseek-chat, llama-3-70b, dll.</p>
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Tersimpan!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Pengaturan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
