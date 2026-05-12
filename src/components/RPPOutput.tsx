import React, { useState } from 'react';
import { useRPP } from '../RPPContext';
import { Printer, Download } from 'lucide-react';
import { generateHOTSWithGemini } from '../services/gemini';
import { useSettings } from '../SettingsContext';
import { LoaderDots } from './LoaderDots';

const RPPOutput: React.FC = () => {
  const { rppData } = useRPP();
  const { settings } = useSettings();
  const [step, setStep] = useState(() => {
    const s = localStorage.getItem('app_step');
    return s ? parseInt(s, 10) : 3;
  }); 
  const [generatingRpp, setGeneratingRpp] = useState(false);
  const [rppContentRefs, setRppContentRefs] = useState<string[]>(() => {
    const s = localStorage.getItem('app_rpp_contents');
    return s ? JSON.parse(s) : [];
  });
  const [rppError, setRppError] = useState('');

  // Save to localStorage when they change
  React.useEffect(() => {
    localStorage.setItem('app_step', step.toString());
  }, [step]);

  React.useEffect(() => {
    localStorage.setItem('app_rpp_contents', JSON.stringify(rppContentRefs));
  }, [rppContentRefs]);

  const prevTPRef = React.useRef(rppData.tujuanPembelajaran);
  React.useEffect(() => {
    if (rppData.tujuanPembelajaran !== prevTPRef.current) {
      setStep(3);
      setRppContentRefs([]);
      prevTPRef.current = rppData.tujuanPembelajaran;
    }
  }, [rppData.tujuanPembelajaran]);

  if (!rppData.tujuanPembelajaran || rppData.tujuanPembelajaran.length === 0) {
    return null;
  }

  const handlePrint = (title: string, htmlContent: string) => {
    let doc: Document | null = null;
    let win: Window | null = null;
    let usingIframe = true;

    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.id = 'print-iframe';
      document.body.appendChild(iframe);
      win = iframe.contentWindow;
      doc = iframe.contentWindow?.document || null;
    } catch (e) {
      usingIframe = false;
    }

    if (!doc) {
      usingIframe = false;
      win = window.open('', '_blank');
      if (!win) {
        alert("Pop-up untuk cetak terblokir. Silakan izinkan pop-up atau buka aplikasi ini di Tab Baru (ikon di kanan atas).");
        return;
      }
      doc = win.document;
    }

    doc.open();
    doc.write(`
      <html>
        <head>
          <title>${title}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { size: A4; margin: 2cm; }
            body { font-family: 'Inter', sans-serif; line-height: 1.5; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; margin-bottom: 1rem; }
            th, td { border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; }
            th { background-color: #f8fafc; font-weight: 600; }
            h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
            h3, h4 { font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem; }
            h3 { font-size: 1.25rem; }
            h4 { font-size: 1.125rem; }
            ul, ol { margin-left: 1.5rem; margin-bottom: 1rem; }
            ul { list-style-type: disc; }
            ol { list-style-type: decimal; }
            .rpp-section { page-break-after: always; }
            .rpp-section:last-child { page-break-after: auto; }
            .lampiran-section { page-break-before: always; }
            hr { display: none; }
            .page-footer {
                margin-top: 2rem;
                font-size: 8pt;
                color: #64748b;
                display: flex;
                justify-content: space-between;
                border-top: 1px solid #cbd5e1;
                padding-top: 5px;
            }
            .lampiran-section { padding-bottom: 2rem; page-break-before: always; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h2 class="text-center font-bold text-xl uppercase mb-8">${title}</h2>
          ${htmlContent}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      win?.focus();
      win?.print();
      if (usingIframe && win?.frameElement) {
        setTimeout(() => win?.frameElement?.remove(), 2000);
      } else {
        win?.close();
      }
    }, 1500);
  };

  const handleExportWord = (title: string, htmlContent: string) => {
    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${title}</title>
    <style>
      body { font-family: "Times New Roman", serif; font-size: 11pt; line-height: 1.5; color: black; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
      th, td { border: 1px solid black; padding: 8px; text-align: left; vertical-align: top; }
      th { font-weight: bold; }
      h2 { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 20px; text-transform: uppercase; }
      h3 { font-size: 12pt; font-weight: bold; margin-top: 15px; margin-bottom: 10px; text-transform: uppercase; }
      ul, ol { margin-left: 20px; margin-bottom: 15px; }
      .text-center { text-align: center; }
      .border-b-2 { border-bottom: 2px solid black; }
      .font-bold { font-weight: bold; }
      .italic { font-style: italic; }
      .uppercase { text-transform: uppercase; }
      .page-footer { text-align: center; font-size: 9pt; margin-top: 30px; border-top: 1px solid black; padding-top: 5px;}
      .pb-16 { padding-bottom: 40px; }
      .flex { display: flex; }
      .justify-between { justify-content: space-between; }
      .rpp-section { page-break-after: always; margin-bottom: 20px; }
      .lampiran-section { page-break-before: always; margin-bottom: 20px; }
    </style>
    </head><body>
      ${htmlContent}
    </body></html>`;

    const blob = new Blob(['\ufeff', preHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const filename = (title ? title : 'Instumen_RPP') + '.doc';
    
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = filename;
    downloadLink.target = "_blank"; // added target blank to bypass strict sandbox

    try {
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch(e) {
      alert("Gagal mengunduh file Word karena pemblokiran browser. Buka aplikasi di Tab Baru.");
    }
    
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const parseNameAndNip = (s: string) => {
    if (s.includes('/')) {
      const parts = s.split('/');
      let nipStr = parts[1].trim();
      nipStr = nipStr.replace(/^NIP[:\.]?\s*/i, '');
      return { name: parts[0].trim(), nip: nipStr };
    }
    return { name: s.trim(), nip: '' };
  };

  const handleGenerateFullRPP = async () => {
    if (!settings.geminiApiKey) {
      setRppError("Gemini API Key tidak ditemukan untuk mengenerate soal. Cek pengaturan.");
      return;
    }
    
    setGeneratingRpp(true);
    setRppError('');
    try {
      const generatedRpps: string[] = [];
      let rppCounter = 0;
      
      const kepsek = parseNameAndNip(rppData.namaKepsek);
      const guru = parseNameAndNip(rppData.namaGuru);
      const today = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

      const allTps: {group: any, tp: any}[] = [];
      for (const group of rppData.tujuanPembelajaran) {
        for (const tp of group.tps) {
          allTps.push({group, tp});
        }
      }

      const targetCount = parseInt(rppData.jumlahPertemuan as any, 10) || 1;
      const tpPairs = allTps.slice(0, targetCount);

      for (let idx = 0; idx < tpPairs.length; idx++) {
        const { group, tp } = tpPairs[idx];
        rppCounter++;
        const isPBL = tp.level === 'Memahami';
        // Select just the first chosen model, or fallback
        const selectedModelList = rppData.modelPembelajaranList || [];
        let rppModelLokal = isPBL ? 'Problem-Based Learning (PBL)' : 'Project-Based Learning (PjBL)';
        if (selectedModelList.length > 0) rppModelLokal = selectedModelList[0];
        
        // Waktu calculation
          const jpMatch = rppData.alokasiWaktu.match(/(\d+)\s*JP\s*x\s*(\d+)\s*Menit/i);
          let totalMenit = 90;
          if (jpMatch) {
              totalMenit = parseInt(jpMatch[1], 10) * parseInt(jpMatch[2], 10);
          }
          const waktuPendahuluan = Math.max(10, Math.round(totalMenit * 0.15 / 5) * 5); 
          const waktuPenutup = Math.max(10, Math.round(totalMenit * 0.15 / 5) * 5);
          const waktuInti = totalMenit - waktuPendahuluan - waktuPenutup;

          let kegiatanInti = '';
          if (isPBL) {
              kegiatanInti = `
                 <tr>
                    <td class="border p-2 font-bold text-center w-[120px]">Orientasi pada masalah</td>
                    <td class="border p-2">Guru menyajikan studi kasus nyata atau video fenomena terkait ${group.topic} dan meminta siswa merumuskan pertanyaan.<br/><em class="text-xs text-indigo-700 font-semibold mt-1 inline-block">(Meaningful Learning)</em></td>
                    <td class="border p-2 text-center w-[80px]">${Math.round(waktuInti * 0.20)} Menit</td>
                 </tr>
                 <tr>
                    <td class="border p-2 font-bold text-center">Organisasi belajar</td>
                    <td class="border p-2">Siswa dibagi dalam kelompok (4-5 orang) untuk mendefinisikan masalah, lalu merencanakan penyelidikan mereka menggunakan LKPD.<br/><em class="text-xs text-indigo-700 font-semibold mt-1 inline-block">(Joyful Learning)</em></td>
                    <td class="border p-2 text-center">${Math.round(waktuInti * 0.15)} Menit</td>
                 </tr>
                 <tr>
                    <td class="border p-2 font-bold text-center">Bimbingan penyelidikan</td>
                    <td class="border p-2">Kelompok melakukan studi literasi dari buku paket, artikel, atau sumber digital yang disediakan untuk mencari data dan informasi relevan. Guru berkeliling.</td>
                    <td class="border p-2 text-center">${Math.round(waktuInti * 0.35)} Menit</td>
                 </tr>
                 <tr>
                    <td class="border p-2 font-bold text-center">Penyajian hasil</td>
                    <td class="border p-2">Kelompok menyusun hasil penyelidikan dalam bentuk peta konsep, infografis sederhana, atau presentasi di kertas plano.</td>
                    <td class="border p-2 text-center">${Math.round(waktuInti * 0.15)} Menit</td>
                 </tr>
                 <tr>
                    <td class="border p-2 font-bold text-center">Analisis & evaluasi</td>
                    <td class="border p-2">Setiap kelompok mempresentasikan solusinya. Guru memberikan penguatan, klarifikasi, dan meluruskan miskonsepsi.<br/><em class="text-xs text-indigo-700 font-semibold mt-1 inline-block">(Mindful Learning)</em></td>
                    <td class="border p-2 text-center">${Math.round(waktuInti * 0.15)} Menit</td>
                 </tr>
              `;
          } else {
              kegiatanInti = `
                 <tr>
                    <td class="border p-2 font-bold text-center w-[120px]">Pertanyaan Mendasar</td>
                    <td class="border p-2">Guru memantik diskusi dengan pertanyaan proyek yang menantang terkait ${group.topic}.<br/><em class="text-xs text-indigo-700 font-semibold mt-1 inline-block">(Meaningful Learning)</em></td>
                    <td class="border p-2 text-center w-[80px]">${Math.round(waktuInti * 0.15)} Menit</td>
                 </tr>
                 <tr>
                    <td class="border p-2 font-bold text-center">Mendesain Proyek</td>
                    <td class="border p-2">Secara berkelompok, siswa menyusun proposal singkat berisi tujuan, target audiens, alat, bahan, dan langkah-langkah kerja proyek.<br/><em class="text-xs text-indigo-700 font-semibold mt-1 inline-block">(Joyful Learning)</em></td>
                    <td class="border p-2 text-center">${Math.round(waktuInti * 0.20)} Menit</td>
                 </tr>
                 <tr>
                    <td class="border p-2 font-bold text-center">Menyusun Jadwal</td>
                    <td class="border p-2">Guru dan siswa menyepakati timeline pengerjaan proyek yang realistis.</td>
                    <td class="border p-2 text-center">${Math.round(waktuInti * 0.10)} Menit</td>
                 </tr>
                 <tr>
                    <td class="border p-2 font-bold text-center">Memonitor Proyek</td>
                    <td class="border p-2">Siswa mulai mengerjakan proyeknya. Guru secara berkala memeriksa kemajuan dan memberikan umpan balik.</td>
                    <td class="border p-2 text-center">${Math.round(waktuInti * 0.30)} Menit</td>
                 </tr>
                 <tr>
                    <td class="border p-2 font-bold text-center">Penilaian & Evaluasi</td>
                    <td class="border p-2">Siswa mempresentasikan produk akhir. Siswa dan guru merefleksikan proses.<br/><em class="text-xs text-indigo-700 font-semibold mt-1 inline-block">(Mindful Learning)</em></td>
                    <td class="border p-2 text-center">${Math.round(waktuInti * 0.25)} Menit</td>
                 </tr>
              `;
          }

          // Generate HOTS questions
          let hotsHtml = '<p class="text-red-500">Soal gagal di-generate.</p>';
          try {
            const soal = await generateHOTSWithGemini(rppData.jenjang, rppData.mapel, tp.text, tp.level, settings.geminiApiKey);
            let pgHtml = '';
            soal.pilihan_ganda.forEach((s: any, index: number) => {
                pgHtml += `<li class="mb-4"><div>${s.pertanyaan}</div><ol type="A" class="ml-6 mt-2 mb-2 space-y-1">`;
                ['A','B','C','D','E'].forEach(opt => {
                   if (s.opsi[opt]) pgHtml += `<li>${opt}. ${s.opsi[opt]}</li>`;
                });
                pgHtml += `</ol></li>`;
            });
            const kunciPg = soal.pilihan_ganda.map((s: any, idx: number) => `${idx+1}. ${s.kunci}`).join(', ');

            let uraianHtml = '';
            soal.uraian.forEach((s: any) => {
               uraianHtml += `<li class="mb-4"><strong>${s.pertanyaan}</strong><div class="mt-1 text-sm text-slate-700 bg-slate-50 p-2 rounded"><strong>Pembahasan:</strong> ${s.pembahasan}</div></li>`;
            });

            hotsHtml = `
              <div class="lampiran-section mt-10 border-t pt-8">
                <h3 class="font-bold text-xl uppercase text-center mb-6">LAMPIRAN: Instrumen Penilaian HOTS</h3>
                
                <h4 class="font-semibold text-lg mb-2">I. Soal Pilihan Ganda</h4>
                <ol class="list-decimal list-outside ml-4">${pgHtml}</ol>
                <div class="bg-gray-100 p-3 rounded mt-4"><strong>Kunci Jawaban PG:</strong> ${kunciPg}</div>
                
                <h4 class="font-semibold text-lg mt-8 mb-2">II. Soal Uraian</h4>
                <ol class="list-decimal list-outside ml-4">${uraianHtml}</ol>

                <div class="mt-8">
                    <h4 class="font-semibold text-lg">III. Pedoman Penskoran</h4>
                    <p class="mt-2"><strong>A. Pilihan Ganda:</strong> Benar = 1, Salah = 0. Maksimal = ${soal.pilihan_ganda.length}.</p>
                    <p class="mt-2"><strong>B. Uraian:</strong> Skala 0-4 per soal. Maksimal = ${soal.uraian.length * 4}.</p>
                    <table class="border w-full mt-2 text-sm">
                        <tr class="bg-slate-100"><th class="border p-2">Skor</th><th class="border p-2">Kriteria</th></tr>
                        <tr><td class="border p-2 text-center">4</td><td class="border p-2">Sangat lengkap, akurat, dan mendalam.</td></tr>
                        <tr><td class="border p-2 text-center">3</td><td class="border p-2">Lengkap dan akurat, pemahaman baik.</td></tr>
                        <tr><td class="border p-2 text-center">2</td><td class="border p-2">Cukup lengkap, ada ketidakakuratan.</td></tr>
                        <tr><td class="border p-2 text-center">1</td><td class="border p-2">Tidak lengkap, banyak salah.</td></tr>
                        <tr><td class="border p-2 text-center">0</td><td class="border p-2">Tidak menjawab/salah total.</td></tr>
                    </table>
                    <p class="text-sm mt-3"><strong>Nilai Akhir</strong> = (Skor PG + (Skor Uraian / ${soal.uraian.length * 4} * 10)) / 2 * 10</p>
                </div>
                <div class="page-footer mt-12">${guru.name} | ${rppData.mapel} | ${rppData.tahunPelajaran} | Pertemuan ${rppCounter} - Lampiran</div>
              </div>
            `;
          } catch(e) {
             console.error(e);
             hotsHtml = `<div class="lampiran-section mt-8 text-red-600">Gagal men-generate instrument penilaian menggunakan AI.</div>`
          }

          const rppHtml = `
            <div class="rpp-section relative px-12 py-12 mb-8 bg-white shadow-2xl font-serif ring-1 ring-slate-300 flex flex-col min-h-[842px] print:shadow-none print:ring-0 print:p-0 print:mb-0">
               <div class="text-center border-b-2 border-slate-900 pb-4 mb-6">
                 <h2 class="text-xl font-bold uppercase tracking-wide">Rencana Pelaksanaan Pembelajaran</h2>
                 <p class="text-sm italic font-semibold mt-1">Pertemuan Ke-${rppCounter}</p>
               </div>

               <table class="w-full text-sm border-2 border-slate-900 mb-6">
                 <tbody>
                   <tr>
                     <td class="font-bold border border-slate-300 p-2 w-[180px] align-top bg-slate-50">Nama Pembuat:</td>
                     <td class="border border-slate-300 p-2">${guru.name}</td>
                   </tr>
                   <tr>
                     <td class="font-bold border border-slate-300 p-2 align-top bg-slate-50">Asal Sekolah:</td>
                     <td class="border border-slate-300 p-2">${rppData.namaSekolah}</td>
                   </tr>
                   <tr>
                     <td class="font-bold border border-slate-300 p-2 align-top bg-slate-50">Mata Pelajaran:</td>
                     <td class="border border-slate-300 p-2">${rppData.mapel}</td>
                   </tr>
                   <tr>
                     <td class="font-bold border border-slate-300 p-2 align-top bg-slate-50">Fase/Kelas/Semester:</td>
                     <td class="border border-slate-300 p-2">Fase ${rppData.fase} / ${rppData.kelasSemester}</td>
                   </tr>
                   <tr>
                     <td class="font-bold border border-slate-300 p-2 align-top bg-slate-50">Alokasi Waktu:</td>
                     <td class="border border-slate-300 p-2">${rppData.alokasiWaktu}</td>
                   </tr>
                   <tr>
                     <td class="font-bold border border-slate-300 p-2 align-top bg-slate-50">Model Pembelajaran:</td>
                     <td class="border border-slate-300 p-2">${rppModelLokal}</td>
                   </tr>
                 </tbody>
               </table>

               <div class="space-y-4 pb-16">
                 <div class="space-y-1">
                   <h3 class="text-sm font-bold border-l-4 border-slate-900 pl-2 uppercase">Identifikasi</h3>
                   <ul class="list-none ml-4 text-[13px] leading-relaxed text-slate-700">
                     <li><strong>Materi Pelajaran:</strong> ${group.topic}</li>
                     <li><strong>Relevansi dengan Kehidupan Nyata Peserta Didik:</strong> ${rppData.lingkungan || '-'}</li>
                     <li><strong>Tingkat Kesulitan:</strong> Disetel berdasarkan karakteristik (${rppData.karakteristik || '-'})</li>
                     <li><strong>Dimensi Profil Lulusan:</strong> ${rppData.profilLulusan.length ? rppData.profilLulusan.join(', ') : '-'}</li>
                     <li><strong>7KAIH:</strong> ${rppData.tujuhKAIH?.length ? rppData.tujuhKAIH.join(', ') : '-'}</li>
                   </ul>
                 </div>

                 <div class="space-y-1 mt-4">
                   <h3 class="text-sm font-bold border-l-4 border-slate-900 pl-2 uppercase">Diferensiasi</h3>
                   <ul class="list-none ml-4 text-[13px] leading-relaxed text-slate-700">
                     <li><strong>Berdasarkan minat:</strong> ${rppData.minat || '-'}</li>
                     <li><strong>Gaya Belajar:</strong> ${rppData.learningModes?.length ? rppData.learningModes.join(', ') : '-'}</li>
                   </ul>
                 </div>

                 <div class="space-y-1 mt-4">
                   <h3 class="text-sm font-bold border-l-4 border-slate-900 pl-2 uppercase">Desain Pembelajaran</h3>
                   <ul class="list-none ml-4 text-[13px] leading-relaxed text-slate-700">
                     <li><strong>Praktik Pedagogis:</strong> Menerapkan konsep ${rppModelLokal} secara interaktif.</li>
                     <li><strong>Kemitraan Pembelajaran:</strong> ${rppData.kemitraan || '-'}</li>
                     <li><strong>Lingkungan Pembelajaran:</strong> ${rppData.lingkunganPembelajaran || '-'}</li>
                     <li><strong>Pemanfaatan Digital:</strong> Perencanaan (${rppData.digitalPerencanaan || '-'}), Pelaksanaan (${rppData.digitalPelaksanaan || '-'}), Asesmen (${rppData.digitalAsesmen || '-'})</li>
                     <li><strong>Sarana & Prasarana:</strong> ${rppData.saranaPrasarana || '-'}</li>
                     <li><strong>Sumber Belajar:</strong> ${Array.isArray(rppData.sumberBelajar) && rppData.sumberBelajar.length > 0 ? rppData.sumberBelajar.map(sb => `<a href="${sb.url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">${sb.title}</a>`).join(', ') : '-'}</li>
                   </ul>
                 </div>

                 <div class="space-y-1 mt-4 block">
                   <h3 class="text-sm font-bold border-l-4 border-slate-900 pl-2 uppercase mb-2">Langkah-langkah Pembelajaran</h3>
                   <p class="text-[13px] leading-relaxed text-slate-700 ml-3 mb-2 font-medium">Tujuan Pembelajaran: ${tp.text}</p>
                   <table class="w-full text-[13px] border border-slate-300 ml-0 lg:ml-2">
                     <thead class="bg-indigo-50">
                       <tr>
                         <th class="border p-2">Tahap</th>
                         <th class="border p-2">Kegiatan</th>
                         <th class="border p-2">Waktu</th>
                       </tr>
                     </thead>
                     <tbody>
                       <tr>
                         <td class="border p-2 font-bold text-center">Pendahuluan</td>
                         <td class="border p-2">
                           <ul class="list-disc ml-4 space-y-1">
                             <li>Guru membuka pelajaran dengan salam, doa bersama, dan mengecek kehadiran.</li>
                             <li>Apersepsi: Mengaitkan materi ${group.topic} dengan pengalaman siswa.</li>
                             <li>Menyampaikan tujuan pembelajaran dan memotivasi siswa.</li>
                           </ul>
                         </td>
                         <td class="border p-2 text-center">${waktuPendahuluan} Menit</td>
                       </tr>
                       ${kegiatanInti}
                       <tr>
                         <td class="border p-2 font-bold text-center">Penutup</td>
                         <td class="border p-2">
                           <ul class="list-disc ml-4 space-y-1">
                             <li>Siswa dan guru menyimpulkan materi ${group.topic}.</li>
                             <li>Refleksi: Guru menanyakan perasaan dan pemahaman siswa.</li>
                             <li>Guru menginformasikan kegiatan pertemuan berikutnya, dan menutup dengan doa.</li>
                           </ul>
                         </td>
                         <td class="border p-2 text-center">${waktuPenutup} Menit</td>
                       </tr>
                     </tbody>
                   </table>
                 </div>

                 <div class="space-y-1 mt-4">
                   <h3 class="text-sm font-bold border-l-4 border-slate-900 pl-2 uppercase">Asesmen</h3>
                   <ul class="list-none ml-4 text-[13px] leading-relaxed text-slate-700">
                     <li class="font-bold border-b border-slate-200 pb-1 mb-1 mt-2">Asesmen Pembelajaran</li>
                     <li><strong>Asesmen pada Awal Pembelajaran:</strong> Tanya jawab untuk pemantik diskusi awal</li>
                     <li><strong>Asesmen pada Proses Pembelajaran:</strong> Lembar observasi sikap dan keaktifan diskusi kelompok</li>
                     <li class="font-bold border-b border-slate-200 pb-1 mb-1 mt-3">Penilaian Kinerja (Assessment as Learning & For Learning)</li>
                     <li>Pembuatan hasil karya atau presentasi laporan / proyek.</li>
                     <li class="font-bold border-b border-slate-200 pb-1 mb-1 mt-3">Peer Assessment (Assessment as Learning)</li>
                     <li>Feedback / Umpan balik antar teman (Peer review) saat memecahkan masalah.</li>
                   </ul>
                 </div>
               </div>

               <div class="mt-auto flex justify-between pt-12 text-sm relative z-10 pb-16">
                  <div class="text-center w-48">
                    <p>Mengetahui,</p>
                    <p class="mb-16">Kepala Sekolah</p>
                    <p class="font-bold underline">${kepsek.name}</p>
                    <p>NIP. ${kepsek.nip || '...'}</p>
                  </div>
                  <div class="text-center w-48">
                    <p>${rppData.kota}, ${today}</p>
                    <p class="mb-16">Guru Mata Pelajaran</p>
                    <p class="font-bold underline">${guru.name}</p>
                    <p>NIP. ${guru.nip || '...'}</p>
                  </div>
               </div>
               
               <div class="page-footer">${guru.name} | ${rppData.mapel} | ${rppData.tahunPelajaran} | Pertemuan ${rppCounter}</div>

               ${hotsHtml}
            </div>
          `;
          generatedRpps.push(rppHtml);
        }
      setRppContentRefs(generatedRpps);
      setStep(6); 
    } catch(err) {
       console.error(err);
       setRppError("Terjadi kesalahan saat membuat RPP menyeluruh.");
    } finally {
      setGeneratingRpp(false);
    }
  };

  const renderTP = () => {
    let tpRows = rppData.tujuanPembelajaran.map((group, idx) => (
      <div key={idx} className="mb-6">
        <h4 className="font-semibold text-slate-800 bg-slate-100 p-2 rounded mb-2">Materi Pokok: {group.topic}</h4>
        <table className="w-full text-sm text-left border">
          <thead className="bg-slate-50 text-slate-600">
            <tr><th className="border p-2">Level Kognitif</th><th className="border p-2">Tujuan Pembelajaran</th></tr>
          </thead>
          <tbody>
            {group.tps.map(tp => (
              <tr key={tp.level}><td className="border p-2 font-medium">{tp.level}</td><td className="border p-2">{tp.text}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    ));

    return (
      <div className="bg-white p-8 shadow-sm ring-1 ring-slate-200 relative mb-6">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-800">3. Tujuan Pembelajaran (TP)</h2>
          <button onClick={() => handlePrint("Tujuan Pembelajaran", rppData.tujuanPembelajaran.map(g => `<h3>${g.topic}</h3><ul>${g.tps.map(t=>`<li><strong>${t.level}:</strong> ${t.text}</li>`).join('')}</ul>`).join(''))} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Cetak TP">
            <Printer className="w-5 h-5"/>
          </button>
        </div>
        {tpRows}
        {step === 3 && (
            <button onClick={() => setStep(4)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg mt-4 shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95">
              Buat Alur Tujuan Pembelajaran
            </button>
        )}
      </div>
    );
  };

  const renderATP = () => {
    let counter = 1;
    let atpRows = rppData.tujuanPembelajaran.map((group, idx) => (
      <div key={idx} className="mb-6">
        <h4 className="font-semibold text-slate-800 mb-2">ATP untuk: {group.topic}</h4>
        <table className="w-full text-sm text-left border">
          <thead className="bg-slate-50 text-slate-600">
            <tr><th className="border p-2 w-16 text-center">Urutan</th><th className="border p-2">Tujuan Pembelajaran</th></tr>
          </thead>
          <tbody>
            {group.tps.map(tp => (
              <tr key={tp.level}><td className="border p-2 text-center">{counter++}</td><td className="border p-2">{tp.text}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    ));

    return (
      <div className="bg-white p-8 shadow-sm ring-1 ring-slate-200 relative mb-6">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-xl font-bold text-slate-800">4. Alur Tujuan Pembelajaran (ATP)</h2>
          <button onClick={() => handlePrint("Alur Tujuan Pembelajaran", `<p>Berikut adalah urutan...</p>`)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
            <Printer className="w-5 h-5"/>
          </button>
        </div>
        {atpRows}
        {step === 4 && (
            <button onClick={() => setStep(5)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg mt-4 shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95">
              Buat KKTP
            </button>
        )}
      </div>
    )
  }

  const renderKKTP = () => {
    const minTercapai = rppData.kktpTercapaiMin;
    const minHampir = Math.max(0, minTercapai - 10);
    const maxBelum = Math.max(0, minHampir - 1);

    const kktpCriteria: Record<string, string> = {
      'Memahami': "Kemampuan menjelaskan konsep dasar, karakteristik, dan fungsi utama.",
      'Mengaplikasi': "Kemampuan mengklasifikasikan contoh nyata atau menggambarkan alur logis.",
      'Merefleksi': "Kemampuan memberikan evaluasi kritis dan menyajikan rekomendasi."
    };

    const allTps = rppData.tujuanPembelajaran.flatMap(g => g.tps);

    return (
      <div className="bg-white p-8 shadow-sm ring-1 ring-slate-200 relative mb-6">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
           <h2 className="text-xl font-bold text-slate-800">5. Kriteria Ketercapaian TP (KKTP)</h2>
           <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Printer className="w-5 h-5"/></button>
        </div>
        <table className="w-full text-sm text-left border">
          <thead className="bg-slate-50 text-slate-600">
            <tr><th className="border p-2">Tujuan Pembelajaran</th><th className="border p-2">Kriteria</th><th className="border p-2 w-48">Nilai</th></tr>
          </thead>
          <tbody>
            {allTps.map((tp, idx) => (
               <React.Fragment key={idx}>
                 <tr>
                    <td rowSpan={3} className="border p-2">{tp.text}</td>
                    <td rowSpan={3} className="border p-2 text-slate-600">{kktpCriteria[tp.level]}</td>
                    <td className="border p-2 bg-emerald-50 text-emerald-800 font-medium">{minTercapai} - 100: Tercapai</td>
                 </tr>
                 <tr><td className="border p-2 bg-yellow-50 text-yellow-800 font-medium">{minHampir} - {minTercapai - 1}: Hampir</td></tr>
                 <tr><td className="border p-2 bg-rose-50 text-rose-800 font-medium">0 - {maxBelum}: Belum</td></tr>
               </React.Fragment>
            ))}
          </tbody>
        </table>

        {step === 5 && (
            <div className="mt-8">
              {rppError && <div className="text-rose-600 mb-4 bg-rose-50 p-3 rounded">{rppError}</div>}
              <button 
                onClick={handleGenerateFullRPP}
                disabled={generatingRpp}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
              >
                {generatingRpp ? <LoaderDots /> : 'Buat RPP Lengkap & Lampiran Soal'}
              </button>
            </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {step >= 3 && renderTP()}
      {step >= 4 && renderATP()}
      {step >= 5 && renderKKTP()}

      {step >= 6 && rppContentRefs.length > 0 && (
         <div className="mt-0 relative">
            <div className="flex justify-between items-center bg-indigo-50 border border-indigo-200 p-4 shadow-sm mb-6 sticky top-0 z-10 w-full rounded-sm">
               <div>
                  <h2 className="text-xl font-bold text-indigo-900">RPP Berhasil Dibuat</h2>
                  <p className="text-sm text-indigo-700">Terdapat {rppContentRefs.length} pertemuan yang berhasil dirancang.</p>
               </div>
               <div className="flex gap-4">
                 <button 
                   onClick={() => handleExportWord("RPP_Lengkap_" + rppData.mapel.replace(/\s+/g, '_'), rppContentRefs.join(''))}
                   className="flex gap-2 items-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-md shadow-blue-100"
                 >
                   <Download className="w-5 h-5" /> Export Word
                 </button>
                 <button 
                   onClick={() => handlePrint("RPP Lengkap", rppContentRefs.join(''))}
                   className="flex gap-2 items-center bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-semibold transition shadow-md shadow-indigo-100"
                 >
                   <Printer className="w-5 h-5" /> Cetak PDF
                 </button>
               </div>
            </div>

            <div className="space-y-8 flex flex-col items-center">
               {rppContentRefs.map((html, idx) => (
                  <div key={idx} className="w-full max-w-[800px]" dangerouslySetInnerHTML={{ __html: html }} />
               ))}
            </div>
         </div>
      )}
    </div>
  );
};

export default RPPOutput;
