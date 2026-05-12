export interface AppSettings {
  supabaseUrl: string;
  supabaseAnonKey: string;
  geminiApiKey: string;
  guruList: string;
  kepsekName: string;
  kepsekNip: string;
  namaSekolahDefault: string;
  logoUrl: string;
}

export interface TP {
  level: string;
  text: string;
}

export interface TPGroup {
  topic: string;
  tps: TP[];
}

export interface RPPData {
  namaSekolah: string;
  jenjang: string;
  mapel: string;
  tahunPelajaran: string;
  kelasSemester: string;
  fase: string;
  alokasiWaktu: string;
  lingkungan: string;
  namaGuru: string;
  namaKepsek: string;
  kota: string;
  kktpTercapaiMin: number;
  karakteristik: string;
  minat: string;
  motivasi: string;
  prestasi: string;
  profilLulusan: string[];
  tujuhKAIH: string[];
  learningModes: string[];
  modelPembelajaranList: string[];
  saranaPrasarana: string;
  sumberBelajar: string;
  kemitraan: string;
  lingkunganPembelajaran: string;
  digitalPerencanaan: string;
  digitalPelaksanaan: string;
  digitalAsesmen: string;
  cp_full_text: string;
  jumlahPertemuan: number;
  tujuanPembelajaran: TPGroup[];
}
