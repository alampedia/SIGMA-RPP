-- Buat tabel untuk menyimpan RPP
CREATE TABLE IF NOT EXISTS rpp_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_sekolah VARCHAR(255) NOT NULL,
  jenjang VARCHAR(50) NOT NULL,
  mapel VARCHAR(100) NOT NULL,
  tahun_pelajaran VARCHAR(50) NOT NULL,
  kelas_semester VARCHAR(50) NOT NULL,
  fase VARCHAR(10) NOT NULL,
  alokasi_waktu VARCHAR(50) NOT NULL,
  lingkungan VARCHAR(255),
  nama_guru VARCHAR(255),
  nama_kepsek VARCHAR(255),
  kota VARCHAR(100),
  kktp_tercapai_min INTEGER,
  karakteristik TEXT,
  minat TEXT,
  motivasi TEXT,
  prestasi TEXT,
  profil_lulusan JSONB, -- Array of string
  tujuh_kaih JSONB, -- Array of string
  learning_modes JSONB, -- Array of string
  model_pembelajaran_list JSONB, -- Array of string
  sarana_prasarana TEXT,
  kemitraan TEXT,
  lingkungan_pembelajaran TEXT,
  digital_perencanaan TEXT,
  digital_pelaksanaan TEXT,
  digital_asesmen TEXT,
  cp_full_text TEXT,
  tujuan_pembelajaran JSONB, -- Array of objects
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Buat tabel untuk menyimpan konfigurasi aplikasi (termasuk API Key Gemini)
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set Row Level Security (RLS) - Diizinkan untuk anon (public) agar Web App bisa akses
ALTER TABLE rpp_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON rpp_documents FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON rpp_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON rpp_documents FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON rpp_documents FOR DELETE USING (true);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON app_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON app_settings FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON app_settings FOR DELETE USING (true);

-- Insert inisialisasi default API key dan Settings jika belum ada
INSERT INTO app_settings (setting_key, setting_value) 
VALUES 
  ('gemini_api_keys', ''),
  ('guru_list', '197010092002122004,Sulfia Irana, S.Pd
198504252020121002,Moh. Arifuddin Habib, S.Pd
198603232025211020,Johan Adi Susanto, S.Pd
199111142024212040,Muflichatus Sofiana, S.Pd
199203232020122022,Arina Nuri Azmi, S.Pd
199704182024211013,Mochammad Feris Aprilianto, S.Pd
199910282024212031,Sitta Risdiana, S.Pd
2025001,Naily Syarifah, S.Pd
2025002,Iyus Yusnita Sholikha, S.Pd'),
  ('kepsek_name', 'Akhmad Nasor, S.Pd'),
  ('kepsek_nip', '198704082019031001'),
  ('nama_sekolah_default', 'SDN Baujeng I')
ON CONFLICT (setting_key) DO NOTHING;
