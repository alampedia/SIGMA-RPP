import React, { useState } from 'react';
import { useSettings } from '../SettingsContext';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { settings, updateSettings } = useSettings();
  
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey);
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey);
  const [guruList, setGuruList] = useState(settings.guruList || '');
  const [kepsekName, setKepsekName] = useState(settings.kepsekName || '');
  const [kepsekNip, setKepsekNip] = useState(settings.kepsekNip || '');
  const [namaSekolahDefault, setNamaSekolahDefault] = useState(settings.namaSekolahDefault || '');

  const handleSave = () => {
    updateSettings({
      supabaseUrl,
      supabaseAnonKey,
      geminiApiKey,
      guruList,
      kepsekName,
      kepsekNip,
      namaSekolahDefault,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 md:p-8 max-w-lg w-full shadow-2xl">
        <h2 className="text-2xl font-bold mb-4 text-slate-800 border-b pb-2">Konfigurasi API & Supabase</h2>
        
        <div className="space-y-4 my-6 text-slate-700 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <label className="block font-semibold mb-1 text-sm">Nama Sekolah Default</label>
            <input 
              type="text" 
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Contoh: SDN Baujeng I"
              value={namaSekolahDefault}
              onChange={e => setNamaSekolahDefault(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block font-semibold mb-1 text-sm">Nama Kepala Sekolah</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Contoh: Budi, S.Pd"
                value={kepsekName}
                onChange={e => setKepsekName(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1 text-sm">NIP Kepala Sekolah</label>
              <input 
                type="text" 
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="NIP..."
                value={kepsekNip}
                onChange={e => setKepsekNip(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-sm">Daftar Guru (Format: NIP,Nama)</label>
            <textarea 
              className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none h-24 text-xs font-mono"
              placeholder="197010092002122004,Sulfia Irana, S.Pd"
              value={guruList}
              onChange={e => setGuruList(e.target.value)}
            />
          </div>
          
          <div className="pt-4 border-t border-slate-200 mt-2">
            <h3 className="font-bold text-slate-800 mb-3">API & Database</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-1 text-sm">Supabase Project URL</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-sm">Supabase Anon Key</label>
                <input 
                  type="password" 
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="eyJh..."
                  value={supabaseAnonKey}
                  onChange={e => setSupabaseAnonKey(e.target.value)}
                />
              </div>
              <div className="pt-2">
                <label className="block font-semibold mb-1 text-sm text-green-700">Daftar Gemini API Key (Pisahkan dengan baris baru, maks 20)</label>
                <textarea 
                  className="w-full p-2 border border-green-300 rounded focus:ring-2 focus:ring-green-500 outline-none h-32 text-xs font-mono"
                  placeholder={'AIzaSy...\nAIzaSy...'}
                  value={geminiApiKey}
                  onChange={e => setGeminiApiKey(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-1">Dibutuhkan untuk sistem generasi AI. Aplikasi akan memilih satu key secara acak untuk menghindari limitasi.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded font-medium transition"
          >
            Batal
          </button>
          <button 
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
