import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AppSettings } from './types';

interface SettingsContextProps {
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => void;
}

const defaultSettings: AppSettings = {
  supabaseUrl: 'https://cmctnyqbparwrobmxvwq.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNtY3RueXFicGFyd3JvYm14dndxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDEwNTIsImV4cCI6MjA5NDA3NzA1Mn0.hnX5hH4PSXopuM39LLSZyf0sX5RPaYSF_j9r-JZaKmM',
  geminiApiKey: '',
  guruList: '197010092002122004,Sulfia Irana, S.Pd\n198504252020121002,Moh. Arifuddin Habib, S.Pd\n198603232025211020,Johan Adi Susanto, S.Pd\n199111142024212040,Muflichatus Sofiana, S.Pd\n199203232020122022,Arina Nuri Azmi, S.Pd\n199704182024211013,Mochammad Feris Aprilianto, S.Pd\n199910282024212031,Sitta Risdiana, S.Pd\n2025001,Naily Syarifah, S.Pd\n2025002,Iyus Yusnita Sholikha, S.Pd',
  kepsekName: 'Akhmad Nasor, S.Pd',
  kepsekNip: '198704082019031001',
  namaSekolahDefault: 'SDN Baujeng I',
  logoUrl: '',
};

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('rpp_app_settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse settings');
      }
    }
    return {
      ...defaultSettings,
      geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || ''
    };
  });

  // Load backend settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        if (!settings.supabaseUrl || !settings.supabaseAnonKey) return;
        const supabase = createClient(settings.supabaseUrl, settings.supabaseAnonKey);
        
        const { data, error } = await supabase.from('app_settings').select('setting_key, setting_value');
        if (error) throw error;
        
        if (data && data.length > 0) {
          const remoteSettings: Record<string, string> = {};
          data.forEach((row: any) => {
            remoteSettings[row.setting_key] = row.setting_value;
          });
          
          setSettings(prev => ({
            ...prev,
            geminiApiKey: remoteSettings.gemini_api_keys || prev.geminiApiKey,
            guruList: remoteSettings.guru_list || prev.guruList,
            kepsekName: remoteSettings.kepsek_name || prev.kepsekName,
            kepsekNip: remoteSettings.kepsek_nip || prev.kepsekNip,
            namaSekolahDefault: remoteSettings.nama_sekolah_default || prev.namaSekolahDefault,
            logoUrl: remoteSettings.logo_url || prev.logoUrl,
          }));
        }
      } catch (err) {
        console.error('Failed to load remote settings', err);
      }
    };
    fetchSettings();
  }, [settings.supabaseUrl, settings.supabaseAnonKey]); // Only re-run if supabase config changes

  useEffect(() => {
    localStorage.setItem('rpp_app_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    
    // Save to remote db
    try {
      if (!newSettings.supabaseUrl || !newSettings.supabaseAnonKey) return;
      const supabase = createClient(newSettings.supabaseUrl, newSettings.supabaseAnonKey);

      const updates = [
        { setting_key: 'gemini_api_keys', setting_value: newSettings.geminiApiKey },
        { setting_key: 'guru_list', setting_value: newSettings.guruList },
        { setting_key: 'kepsek_name', setting_value: newSettings.kepsekName },
        { setting_key: 'kepsek_nip', setting_value: newSettings.kepsekNip },
        { setting_key: 'nama_sekolah_default', setting_value: newSettings.namaSekolahDefault },
        { setting_key: 'logo_url', setting_value: newSettings.logoUrl },
      ].map(u => ({ ...u, updated_at: new Date().toISOString() }));

      const { error } = await supabase.from('app_settings').upsert(updates, { onConflict: 'setting_key' });
      if (error) throw error;
    } catch (err) {
      console.error('Failed to save remote settings', err);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
