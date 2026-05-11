import React, { useState } from 'react';
import { SettingsProvider, useSettings } from './SettingsContext';
import { RPPProvider } from './RPPContext';
import { HelpCircle, LogOut, Settings as SettingsIcon } from 'lucide-react';
import SettingsModal from './components/SettingsModal';
import RPPForm from './components/RPPForm';
import RPPOutput from './components/RPPOutput';

function MainApp() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="group relative cursor-pointer active:scale-95 transition-transform" title="Double click for Supabase Config" onDoubleClick={() => setIsSettingsOpen(true)}>
            <img 
              src="https://lh3.googleusercontent.com/d/1FV7EmCnGHRbpQvbbdrRv-t0KZCUXbIqk" 
              alt="Logo" 
              className="w-10 h-10 object-contain rounded-lg shadow-sm border border-slate-200"
            />
            <div className="absolute -bottom-10 left-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-50">
              Double-click to configure
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-slate-800">SIGMA</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">SIGMA | SDN BAUJENG 1</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full border border-slate-200 font-medium transition-colors text-xs"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Bantuan</span>
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="p-2 hover:bg-slate-100 text-slate-500 rounded-full transition-colors"
            title="Keluar"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <aside className="w-full md:w-[400px] lg:w-[450px] bg-white border-r border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 print:hidden">
          <RPPForm />
        </aside>
        
        <section className="flex-1 bg-slate-200 p-8 flex justify-center overflow-y-auto print:p-0 print:bg-white">
          <div className="w-full max-w-[800px] h-fit space-y-6">
            <RPPOutput />
          </div>
        </section>
      </main>

      <footer className="h-8 bg-slate-900 text-slate-400 flex items-center justify-between px-4 text-[10px] shrink-0 font-mono print:hidden">
        <div className="uppercase">SIGMA - Sistem Generator Modul Ajar Berbasis AI</div>
        <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
          <div className="inline-block animate-[marquee_20s_linear_infinite] pl-full">
            SDN BAUJENG 1
          </div>
        </div>
      </footer>

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      
      {isHelpOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 print:hidden">
          <div className="bg-white rounded-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Bantuan Penggunaan Aplikasi</h2>
            <div className="space-y-4 text-slate-600">
                <p>Selamat datang di RPP Generator. Ikuti langkah-langkah berikut untuk membuat RPP secara otomatis:</p>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                    <li><strong>Isi Identitas Modul & Siswa:</strong> Lengkapi semua data pada formulir pertama.</li>
                    <li><strong>Masukkan Capaian Pembelajaran:</strong> Tulis kalimat CP atau beberapa materi pokok.</li>
                    <li><strong>Generate TP, ATP, KKTP:</strong> Klik tombol "Lanjutkan". Aplikasi akan otomatis menghasilkan Tujuan Pembelajaran dll.</li>
                    <li><strong>Generate RPP Lengkap:</strong> Setelah KKTP dibuat, klik tombol "Buat RPP Lengkap".</li>
                    <li><strong>Cetak atau Simpan:</strong> Gunakan tombol "Cetak Semua RPP".</li>
                </ol>
                <div className="p-4 bg-blue-50 text-blue-800 rounded-lg mt-4 border border-blue-100">
                  <strong>Penting:</strong> Double klik pada logo aplikasi di sudut kiri atas untuk mengatur konfigurasi API Supabase & Gemini.
                </div>
            </div>
            <div className="text-right mt-8 pt-4 border-t">
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Tutup
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <RPPProvider>
        <MainApp />
      </RPPProvider>
    </SettingsProvider>
  );
}
