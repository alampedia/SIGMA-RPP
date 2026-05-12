import React, { createContext, useContext, useState } from 'react';
import { RPPData } from './types';

interface RPPContextProps {
  rppData: RPPData;
  updateRPPData: (data: Partial<RPPData>) => void;
  resetRPPData: () => void;
}

const defaultRPPData: RPPData = {
  namaSekolah: '',
  jenjang: 'SD',
  mapel: '',
  tahunPelajaran: '',
  kelasSemester: '',
  fase: '',
  alokasiWaktu: '',
  lingkungan: '',
  namaGuru: '',
  namaKepsek: '',
  kota: '',
  kktpTercapaiMin: 80,
  karakteristik: 'Sebagian siswa cenderung pasif, 2 siswa berkebutuhan khusus, ada yang belum lancar membaca/berhitung.',
  minat: 'Sebagian siswa minat belajar rendah, lebih suka praktik di laboratorium dan kerja kelompok.',
  motivasi: 'Sebagian siswa motivasi belajar rendah.',
  prestasi: 'Rata-rata prestasi belajar menurun.',
  profilLulusan: [],
  tujuhKAIH: [],
  learningModes: [],
  modelPembelajaranList: [],
  saranaPrasarana: 'LCD Projector, Papan Tulis, Spidol',
  sumberBelajar: [],
  kemitraan: 'Guru Mapel Geografi, Pemerhati lingkungan hidup',
  lingkunganPembelajaran: 'Budaya tertib, bersih, disiplin (5K), Adi Wiyata',
  digitalPerencanaan: 'Pemanfaatan AI, Canva.',
  digitalPelaksanaan: 'Pemanfaatan AI, Canva.',
  digitalAsesmen: 'Pemanfaatan Quizziz, Canva.',
  cp_full_text: '',
  jumlahPertemuan: 1,
  tujuanPembelajaran: [],
};

const RPPContext = createContext<RPPContextProps | undefined>(undefined);

export const RPPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rppData, setRPPData] = useState<RPPData>(() => {
    const saved = localStorage.getItem('rpp_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved RPP data:", e);
      }
    }
    return defaultRPPData;
  });

  React.useEffect(() => {
    localStorage.setItem('rpp_data', JSON.stringify(rppData));
  }, [rppData]);

  const updateRPPData = (data: Partial<RPPData>) => {
    setRPPData((prev) => ({ ...prev, ...data }));
  };

  const resetRPPData = () => {
    setRPPData(defaultRPPData);
  };

  return (
    <RPPContext.Provider value={{ rppData, updateRPPData, resetRPPData }}>
      {children}
    </RPPContext.Provider>
  );
};

export const useRPP = () => {
  const context = useContext(RPPContext);
  if (!context) {
    throw new Error('useRPP must be used within an RPPProvider');
  }
  return context;
};
