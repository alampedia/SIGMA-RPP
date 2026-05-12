import React, { useState } from 'react';
import { useRPP } from '../RPPContext';
import { useSettings } from '../SettingsContext';
import { generateTPWithGemini } from '../services/gemini';
import { LoaderDots } from './LoaderDots';

const JENJANG_OPTIONS = ['SD'];

const KELAS_OPTIONS: Record<string, string[]> = {
  'SD': ['I / Ganjil', 'I / Genap', 'II / Ganjil', 'II / Genap', 'III / Ganjil', 'III / Genap', 'IV / Ganjil', 'IV / Genap', 'V / Ganjil', 'V / Genap', 'VI / Ganjil', 'VI / Genap']
};

const FASE_OPTIONS: Record<string, string[]> = {
  'SD': ['A', 'B', 'C']
};

const MAPEL_SD_OPTIONS = [
  'Pendidikan Agama', 
  'Pendidikan Pancasila', 
  'Bahasa Indonesia', 
  'Matematika', 
  'IPAS', 
  'Bahasa Inggris', 
  'PJOK', 
  'Seni dan Budaya', 
  'BTQ', 
  'Bahasa Jawa'
];

const PROFIL_ITEMS = [
  "Keimanan dan Ketakwaan terhadap Tuhan YME", "Kewargaan", "Penalaran Kritis", "Kreativitas", 
  "Kolaborasi", "Kemandirian", "Kesehatan", "Komunikasi"
];

const TUJUH_KAIH_ITEMS = [
  "Bangun Pagi", "Beribadah", "Berolahraga", "Makan Sehat", "Gemar Belajar", "Bermasyarakat", "Tidur Cepat"
];

const RPPForm: React.FC = () => {
  const { rppData, updateRPPData } = useRPP();
  const { settings } = useSettings();
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'identitas' | 'siswa_konsep'>('identitas');

  // Parse Settings for dropdowns
  const guruOptions = settings.guruList ? settings.guruList.split('\n').filter(Boolean) : [];

  // Add learning modes and model list to constants locally
  const LEARNING_MODES = ["Meaningful Learning", "Mindful Learning", "Joyful Learning"];
  const MODEL_PEMBELAJARAN_OPTIONS = [
    "Project-Based Learning (PjBL)",
    "Problem-Based Learning (PBL)",
    "Inquiry-Based Learning",
    "Discovery Learning",
    "Active Learning"
  ];


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateRPPData({ [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const currentList = rppData.profilLulusan;
    if (checked) {
      updateRPPData({ profilLulusan: [...currentList, value] });
    } else {
      updateRPPData({ profilLulusan: currentList.filter(item => item !== value) });
    }
  };

  const handle7KaihChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const currentList = rppData.tujuhKAIH || [];
    if (checked) {
      updateRPPData({ tujuhKAIH: [...currentList, value] });
    } else {
      updateRPPData({ tujuhKAIH: currentList.filter(item => item !== value) });
    }
  };

  const handleLearningModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const currentList = rppData.learningModes || [];
    if (checked) {
      updateRPPData({ learningModes: [...currentList, value] });
    } else {
      updateRPPData({ learningModes: currentList.filter(item => item !== value) });
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const currentList = rppData.modelPembelajaranList || [];
    if (checked) {
      updateRPPData({ modelPembelajaranList: [...currentList, value] });
    } else {
      updateRPPData({ modelPembelajaranList: currentList.filter(item => item !== value) });
    }
  };

  const setDefaultsFromSettings = () => {
    if (!rppData.namaSekolah && settings.namaSekolahDefault) updateRPPData({ namaSekolah: settings.namaSekolahDefault });
    if (!rppData.namaKepsek && settings.kepsekName && settings.kepsekNip) updateRPPData({ namaKepsek: `${settings.kepsekName} / NIP. ${settings.kepsekNip}` });
  };

  React.useEffect(() => {
    setDefaultsFromSettings();
  }, [settings]);

  const validateForm = () => {
    const required = [
      'namaSekolah', 'jenjang', 'mapel', 'tahunPelajaran', 'kelasSemester',
      'fase', 'alokasiWaktu', 'namaGuru', 'namaKepsek', 'kota', 'cp_full_text'
    ];
    for (const field of required) {
      if (!rppData[field as keyof typeof rppData]) {
        setError('Harap isi semua kolom wajib (ditandai dengan keterangan / placeholder) sebelum melanjutkan.');
        return false;
      }
    }
    setError('');
    return true;
  };

  const onGenerateTP = async () => {
    if (!validateForm()) return;
    
    if (!settings.geminiApiKey) {
      setError('Gemini API Key tidak ditemukan. Silakan double klik logo di kiri atas untuk mengatur API Key.');
      return;
    }

    setIsGenerating(true);
    try {
      const results = await generateTPWithGemini(rppData.cp_full_text, settings.geminiApiKey);
      updateRPPData({ 
        tujuanPembelajaran: results.tujuanPembelajaran,
        sumberBelajar: results.sumberBelajar
      });
      // We will scroll to Output section later via standard DOM if we want, or just let React render it.
    } catch (err: any) {
      setError(err.message || 'Gagal menganalisis CP dengan AI. Pastikan format CP jelas atau coba lagi nanti.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('identitas')}
          className={`flex-1 py-3 text-xs font-bold uppercase ${activeTab === 'identitas' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
        >
          1. Identitas
        </button>
        <button 
          onClick={() => setActiveTab('siswa_konsep')}
          className={`flex-1 py-3 text-xs font-bold uppercase ${activeTab === 'siswa_konsep' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
        >
          2. Konsep & Siswa
        </button>
      </div>

      <div className={activeTab === 'identitas' ? 'block' : 'hidden'}>
        <section className="space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">a. Nama Sekolah</span>
            <input name="namaSekolah" value={rppData.namaSekolah} onChange={handleInputChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Contoh: SDN Baujeng I" />
          </div>
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="space-y-1 flex-1">
              <span className="text-[11px] text-slate-400 font-medium">b. Jenjang Sekolah</span>
              <select name="jenjang" value={rppData.jenjang} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none">
                <option value="">Pilih Jenjang</option>
                {JENJANG_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-[11px] text-slate-400 font-medium">c. Mata Pelajaran</span>
              <select name="mapel" value={rppData.mapel} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                <option value="">Pilih Mata Pelajaran</option>
                {MAPEL_SD_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="space-y-1 flex-1">
              <span className="text-[11px] text-slate-400 font-medium">d. Tahun Pelajaran</span>
              <input name="tahunPelajaran" value={rppData.tahunPelajaran} onChange={handleInputChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Contoh: 2025/2026" />
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-[11px] text-slate-400 font-medium">e. Kelas / Semester</span>
              <select name="kelasSemester" value={rppData.kelasSemester} onChange={handleInputChange} disabled={!rppData.jenjang} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none disabled:bg-slate-100 disabled:text-slate-400">
                <option value="">Pilih Kelas/Semester</option>
                {(KELAS_OPTIONS[rppData.jenjang] || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 flex-col sm:flex-row">
            <div className="space-y-1 flex-1">
              <span className="text-[11px] text-slate-400 font-medium">f. Fase</span>
              <select name="fase" value={rppData.fase} onChange={handleInputChange} disabled={!rppData.jenjang} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none disabled:bg-slate-100 disabled:text-slate-400">
                <option value="">Pilih Fase</option>
                {(FASE_OPTIONS[rppData.jenjang] || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-[11px] text-slate-400 font-medium">g. Alokasi Waktu</span>
               <select name="alokasiWaktu" value={rppData.alokasiWaktu} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none">
                   <option value="">Pilih Waktu</option>
                   <option value="1 JP x 35 Menit">1 JP x 35 Menit</option>
                   <option value="2 JP x 35 Menit">2 JP x 35 Menit</option>
                   <option value="3 JP x 35 Menit">3 JP x 35 Menit</option>
                   <option value="2 JP x 40 Menit">2 JP x 40 Menit</option>
                   <option value="3 JP x 40 Menit">3 JP x 40 Menit</option>
                   <option value="2 JP x 45 Menit">2 JP x 45 Menit</option>
                   <option value="3 JP x 45 Menit">3 JP x 45 Menit</option>
               </select>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">h. Jumlah Pertemuan</span>
            <input name="jumlahPertemuan" value={rppData.jumlahPertemuan} onChange={handleInputChange} type="number" min="1" max="10" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">h. Nama Guru / NIP</span>
            <select name="namaGuru" value={rppData.namaGuru} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700">
              <option value="">-- Pilih Guru (Setup di Config) --</option>
              {guruOptions.map(g => {
                const parts = g.split(',');
                const nip = parts[0]?.trim();
                const name = parts[1]?.trim();
                const display = `${name} / NIP. ${nip}`;
                return <option key={g} value={display}>{display}</option>;
              })}
              {rppData.namaGuru && !guruOptions.find(g => {
                const parts = g.split(',');
                return `${parts[1]?.trim()} / NIP. ${parts[0]?.trim()}` === rppData.namaGuru;
              }) && <option value={rppData.namaGuru}>{rppData.namaGuru}</option>}
            </select>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">i. Nama Kepala Sekolah / NIP</span>
            <input name="namaKepsek" value={rppData.namaKepsek} onChange={handleInputChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Contoh: Akhmad Nasor, S.Pd / NIP: 1987..." />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">j. Kota</span>
            <input name="kota" value={rppData.kota} onChange={handleInputChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Contoh: Beji" />
          </div>

        <label className="block text-xs font-bold text-slate-500 uppercase mt-8 mb-4">Pengaturan KKTP</label>
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Nilai Minimal "Tercapai"</span>
            <input name="kktpTercapaiMin" value={rppData.kktpTercapaiMin} onChange={handleInputChange} type="number" min="0" max="100" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
        </div>

        <button 
           onClick={() => setActiveTab('siswa_konsep')}
           className="mt-6 w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 rounded-lg shadow-sm transition-all active:scale-95"
         >
           Selanjutnya: Konsep & Siswa &rarr;
         </button>
        </section>
      </div>

      <div className={activeTab === 'siswa_konsep' ? 'block space-y-6' : 'hidden'}>
        <section>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Profil Lulusan</label>
        <div className="grid grid-cols-2 gap-2">
          {PROFIL_ITEMS.map((item, i) => (
             <div key={item} className="flex items-center">
               <input 
                 type="checkbox" 
                 id={`profil-${i}`}
                 value={item}
                 checked={rppData.profilLulusan.includes(item)}
                 onChange={handleCheckboxChange}
                 className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
               />
               <label htmlFor={`profil-${i}`} className="ml-2 text-xs text-slate-700">{item}</label>
             </div>
          ))}
        </div>

        <label className="block text-xs font-bold text-slate-500 uppercase mt-8 mb-4">7KAIH</label>
        <div className="grid grid-cols-2 gap-2">
          {TUJUH_KAIH_ITEMS.map((item, i) => (
             <div key={item} className="flex items-center">
               <input 
                 type="checkbox" 
                 id={`kaih-${i}`}
                 value={item}
                 checked={(rppData.tujuhKAIH || []).includes(item)}
                 onChange={handle7KaihChange}
                 className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
               />
               <label htmlFor={`kaih-${i}`} className="ml-2 text-xs text-slate-700">{item}</label>
             </div>
          ))}
        </div>

          <label className="block text-xs font-bold text-slate-500 uppercase mt-8 mb-4">Learning Style</label>
          <div className="flex flex-col gap-2">
            {LEARNING_MODES.map((item, i) => (
               <div key={item} className="flex items-center">
                 <input 
                   type="checkbox" 
                   id={`mode-${i}`}
                   value={item}
                   checked={(rppData.learningModes || []).includes(item)}
                   onChange={handleLearningModeChange}
                   className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                 />
                 <label htmlFor={`mode-${i}`} className="ml-2 text-xs text-slate-700">{item}</label>
               </div>
            ))}
          </div>

          <label className="block text-xs font-bold text-slate-500 uppercase mt-8 mb-4">Model Pembelajaran</label>
          <div className="flex flex-col gap-2">
            {MODEL_PEMBELAJARAN_OPTIONS.map((item, i) => (
               <div key={item} className="flex items-center">
                 <input 
                   type="checkbox" 
                   id={`model-${i}`}
                   value={item}
                   checked={(rppData.modelPembelajaranList || []).includes(item)}
                   onChange={handleModelChange}
                   className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                 />
                 <label htmlFor={`model-${i}`} className="ml-2 text-xs text-slate-700">{item}</label>
               </div>
            ))}
          </div>

          <div className="mt-8 space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Sarana & Prasarana</span>
          <input name="saranaPrasarana" value={rppData.saranaPrasarana} onChange={handleInputChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
        </div>

        <label className="block text-xs font-bold text-slate-500 uppercase mt-8 mb-4">Identifikasi Awal Siswa</label>
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">1. Karakteristik Siswa</span>
            <input name="karakteristik" value={rppData.karakteristik} onChange={handleInputChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">2. Minat Belajar</span>
            <input name="minat" value={rppData.minat} onChange={handleInputChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">3. Motivasi Belajar</span>
             <input name="motivasi" value={rppData.motivasi} onChange={handleInputChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">4. Prestasi Belajar</span>
             <input name="prestasi" value={rppData.prestasi} onChange={handleInputChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">5. Lingkungan Sekolah</span>
             <input name="lingkungan" value={rppData.lingkungan} onChange={handleInputChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Contoh: Perkotaan, mayoritas siswa dari keluarga ekonomi menengah" />
          </div>
        </div>

        <label className="block text-xs font-bold text-slate-500 uppercase mt-8 mb-4">Kerangka Pembelajaran</label>
        <div className="space-y-3">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Kemitraan Pembelajaran</span>
            <input name="kemitraan" value={rppData.kemitraan} onChange={handleInputChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          <div className="space-y-1">
             <span className="text-[11px] text-slate-400 font-medium">Lingkungan Pembelajaran</span>
             <input name="lingkunganPembelajaran" value={rppData.lingkunganPembelajaran} onChange={handleInputChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          <div className="space-y-1">
             <span className="text-[11px] text-slate-400 font-medium">Pemanfaatan Digital (Perencanaan)</span>
             <input name="digitalPerencanaan" value={rppData.digitalPerencanaan} onChange={handleInputChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          <div className="space-y-1">
             <span className="text-[11px] text-slate-400 font-medium">Pemanfaatan Digital (Pelaksanaan)</span>
             <input name="digitalPelaksanaan" value={rppData.digitalPelaksanaan} onChange={handleInputChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          <div className="space-y-1">
             <span className="text-[11px] text-slate-400 font-medium">Pemanfaatan Digital (Asesmen)</span>
             <input name="digitalAsesmen" value={rppData.digitalAsesmen} onChange={handleInputChange} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
        </div>
        </section>

        <section>
          <label className="block text-xs font-bold text-slate-500 uppercase mt-8 mb-4">Materi Pembelajaran</label>
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Masukkan kalimat CP atau materi (pisahkan koma)</span>
            <textarea 
              name="cp_full_text"
              value={rppData.cp_full_text}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm resize-y min-h-[100px] outline-none transition-all focus:ring-2 focus:ring-indigo-500"
              placeholder="Contoh: Mengenali berbagai model jaringan komputer, dan melakukan pengiriman data antarperangkat."
            />
          </div>

          {error && (
            <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg mt-4 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button 
              onClick={() => setActiveTab('identitas')}
              className="px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 rounded-lg shadow-sm transition-all"
            >
              &larr;
            </button>
            <button 
              onClick={onGenerateTP}
              disabled={isGenerating}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGenerating ? <LoaderDots /> : 'Generate RPP Awal'}
            </button>
          </div>
        </section>
      </div>

    </div>
  );
};

export default RPPForm;
