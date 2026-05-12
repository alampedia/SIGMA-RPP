import { TPGroup } from '../types';

export const getKeys = (keysString: string) => {
  const keys = keysString.split('\n').map(k => k.trim()).filter(k => k.length > 10);
  if (keys.length === 0) throw new Error("API Key tidak valid atau kosong.");
  // Shuffle keys to try randomly but exhaustively
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  return keys;
};

const executeWithKeyRotation = async (keys: string[], fetchFn: (key: string) => Promise<any>) => {
  let lastError: Error | null = null;
  for (const key of keys) {
    try {
      return await fetchFn(key);
    } catch (err: any) {
      console.warn(`API Key failed, trying next... Error: ${err.message}`);
      lastError = err;
      // Continue to try the next key
    }
  }
  throw lastError || new Error("All provided API keys failed to generate content.");
};

export const generateTPWithGemini = async (cpText: string, apiKey: string): Promise<{tujuanPembelajaran: TPGroup[], sumberBelajar: {title: string, url: string}[]}> => {
  if (!apiKey) throw new Error("Gemini API Key is missing. Please configure it in Settings.");

  const keys = getKeys(apiKey);

  const prompt = `Anda adalah seorang ahli kurikulum pendidikan Indonesia. Analisis kalimat Capaian Pembelajaran (CP) berikut: "${cpText}". Identifikasi setiap materi pokok yang utuh dan berbeda di dalamnya. Jangan hanya memecah berdasarkan koma jika masih dalam satu kesatuan ide.
        
Untuk setiap materi pokok yang teridentifikasi, buatkan 3 Tujuan Pembelajaran (TP) sesuai level kognitif: Memahami, Mengaplikasi, dan Merefleksi.

Selain itu, berikan rekomendasi "Sumber Belajar" yang relevan dengan topik ini. Berikan URL nyata/real atau platform yang relevan (misalnya Video YouTube, Quizizz, Wordwall, atau artikel terkait). Buatkan dalam bentuk daftar objek yang memiliki title (judul materi/referensi) dan url (link URL yang bisa diakses menuju materi yang spesifik tersebut atau URL platform dengan keyword pencarian). Pastikan URL format valid.

Berikan jawaban dalam format JSON yang valid.`;

  const schema = {
    type: "object",
    properties: {
      tujuanPembelajaran: {
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
      },
      sumberBelajar: { 
        type: "array",
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            url: { type: "string" }
          },
          required: ["title", "url"]
        }
      }
    },
    required: ["tujuanPembelajaran", "sumberBelajar"]
  };

  return executeWithKeyRotation(keys, async (activeKey: string) => {
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
  });
};

export const generateHOTSWithGemini = async (jenjang: string, mapel: string, tpText: string, tpLevel: string, apiKey: string) => {
    if (!apiKey) throw new Error("Gemini API Key is missing.");

    const keys = getKeys(apiKey);

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

    return executeWithKeyRotation(keys, async (activeKey: string) => {
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
    });
};
