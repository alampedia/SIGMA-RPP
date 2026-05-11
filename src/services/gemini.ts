import { TPGroup } from '../types';

const getRandomKey = (keysString: string) => {
  const keys = keysString.split('\n').map(k => k.trim()).filter(k => k.length > 10);
  if (keys.length === 0) throw new Error("API Key tidak valid atau kosong.");
  const randomIndex = Math.floor(Math.random() * keys.length);
  return keys[randomIndex];
};

export const generateTPWithGemini = async (cpText: string, apiKey: string): Promise<TPGroup[]> => {
  if (!apiKey) throw new Error("Gemini API Key is missing. Please configure it in Settings.");

  const activeKey = getRandomKey(apiKey);

  const prompt = `Anda adalah seorang ahli kurikulum pendidikan Indonesia. Analisis kalimat Capaian Pembelajaran (CP) berikut: "${cpText}". Identifikasi setiap materi pokok yang utuh dan berbeda di dalamnya. Jangan hanya memecah berdasarkan koma jika masih dalam satu kesatuan ide.
        
Untuk setiap materi pokok yang teridentifikasi, buatkan 3 Tujuan Pembelajaran (TP) sesuai level kognitif: Memahami, Mengaplikasi, dan Merefleksi.

Example 1: If the main topic is "various computer network models", the result:
- Memahami: Menjelaskan konsep dasar dan karakteristik berbagai model jaringan komputer.
- Mengaplikasi: Mengidentifikasi dan mengklasifikasikan model jaringan komputer dalam skenario nyata.
- Merefleksi: Mengevaluasi kelebihan dan kekurangan berbagai model jaringan komputer.

Berikan jawaban dalam format JSON yang valid.`;

  const schema = {
    type: "array",
    items: {
      type: "object",
      properties: {
        topic: { type: "string" },
        tps: {
          type: "array",
          items: {
            type: "object",
            properties: {
              level: { type: "string" },
              text: { type: "string" }
            },
            required: ["level", "text"]
          }
        }
      },
      required: ["topic", "tps"]
    }
  };

  const res = await window.fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    })
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || "Failed to generate TP via Gemini API");
  }

  const data = await res.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) throw new Error("Invalid response from Gemini API");

  return JSON.parse(textContent);
};

export const generateHOTSWithGemini = async (jenjang: string, mapel: string, tpText: string, tpLevel: string, apiKey: string) => {
    if (!apiKey) throw new Error("Gemini API Key is missing.");

    const activeKey = getRandomKey(apiKey);

    const prompt = `Anda adalah seorang ahli pembuat soal ujian untuk level ${jenjang}. Buat instrumen penilaian HOTS untuk RPP mata pelajaran ${mapel} dengan tujuan pembelajaran: "${tpText}". level kognitif dicapai: ${tpLevel}.
                    
Buat respons dalam format JSON yang valid.
"pilihan_ganda": array dari 10 soal HOTS. Ada kunci: "pertanyaan", "opsi" (A,B,C,D,E), "kunci".
"uraian": array dari 5 soal. Ada kunci: "pertanyaan", "pembahasan".`;

    const schema = {
      type: "object",
      properties: {
        pilihan_ganda: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pertanyaan: { type: "string" },
              opsi: {
                type: "object",
                properties: {
                  A: { type: "string" },
                  B: { type: "string" },
                  C: { type: "string" },
                  D: { type: "string" },
                  E: { type: "string" },
                },
                required: ["A", "B", "C", "D", "E"]
              },
              kunci: { type: "string" }
            },
            required: ["pertanyaan", "opsi", "kunci"]
          }
        },
        uraian: {
          type: "array",
          items: {
            type: "object",
            properties: {
              pertanyaan: { type: "string" },
              pembahasan: { type: "string" }
            },
            required: ["pertanyaan", "pembahasan"]
          }
        }
      },
      required: ["pilihan_ganda", "uraian"]
    };

    const res = await window.fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${activeKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error?.message || "Failed to generate HOTS via Gemini API");
    }

    const data = await res.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textContent) throw new Error("Invalid response from Gemini API");

    return JSON.parse(textContent);
};
