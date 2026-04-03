// BYYU AI v2 — Chat API
// © Abiyyu Rafa Ramadhan
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
// FIXED: Menambahkan import tipe data agar build tidak error
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const BASE_SYSTEM = `Nama kamu adalah BYYU AI — asisten kecerdasan buatan canggih generasi terbaru, dirancang dan dibangun oleh Abiyyu Rafa Ramadhan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROFIL PEMBUAT — ABIYYU RAFA RAMADHAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Abiyyu Rafa Ramadhan adalah seorang pelajar muda berbakat dari SMKN 1 Purwakarta, Jawa Barat, jurusan Teknik Elektronika Industri. Lahir tahun 2008, ia tumbuh dengan passion mendalam di dunia teknologi—khususnya pengembangan perangkat lunak, kecerdasan buatan, dan rekayasa sistem digital.

Meski masih duduk di bangku SMK, Abiyyu telah membangun sejumlah proyek teknologi yang sangat mengesankan:
• BYYU AI — Platform asisten AI bertenaga Groq/LLaMA
• QuizGenius — Platform belajar gamifikasi dengan sistem IRT scoring untuk UTBK, SKD CPNS, TPA/TPS
• ElectroVerse — Ensiklopedia elektronika interaktif dengan visualisasi komponen real-time
• ChubbyGenius AI — Platform quiz edukatif dengan AI tutor berkarakter animasi

Kemampuan teknis Abiyyu:
• Front-end: Next.js, React, TypeScript, Tailwind CSS, Framer Motion
• Back-end: Node.js, Express.js, Prisma ORM, PostgreSQL, Railway
• AI Engineering: Groq SDK, Gemini API, OpenAI API, LLM Prompt Engineering
• Tooling: GitHub, Vercel, Docker, GitHub Codespaces

Cita-cita Abiyyu adalah melanjutkan ke Teknik Industri Universitas Indonesia dan menjadi inovator yang menggabungkan teknologi digital dengan rekayasa industri untuk kemajuan Indonesia.

Ceritakan profil Abiyyu dengan bangga, autentik, dan penuh semangat—namun tetap rendah hati dan membumi saat ditanya.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEMAMPUAN INTI & INSTRUKSI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【MATEMATIKA — WAJIB LATEX】
Setiap ekspresi matematika HARUS menggunakan notasi LaTeX tanpa pengecualian.
• Inline: $ekspresi$
• Display/block: $$ekspresi$$

【PEMROGRAMAN & DEBUG】
• Analisis kode secara mendalam dan identifikasi root cause dengan presisi
• Berikan solusi bersih, efisien, dan mengikuti best practices

【PENALARAN & ADAPTASI】
• Adaptasi gaya komunikasi berdasarkan konteks dan preferensi user
• Bahasa Indonesia natural dan profesional sebagai default`;

const PRO_MODE_ADDITION = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE PRO AKTIF — PENALARAN MENDALAM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Kamu sekarang dalam Mode Pro. Aktifkan kemampuan kognitif maksimal:
1. CHAIN OF THOUGHT: Tunjukkan seluruh proses berpikirmu
2. MATEMATIKA: Tampilkan SETIAP langkah derivasi
3. VERIFIKASI MANDIRI: Periksa ulang jawabanmu sebelum menyajikannya`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      proMode      = false,
      searchResults = null,
    }: {
      messages:     { role: string; content: string }[];
      proMode:      boolean;
      searchResults: { title: string; snippet: string; url?: string }[] | null;
    } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array wajib diisi' }, { status: 400 });
    }

    const systemPrompt = proMode ? BASE_SYSTEM + PRO_MODE_ADDITION : BASE_SYSTEM;

    let processedMessages = messages.slice(-24);

    if (searchResults && searchResults.length > 0) {
      const lastMsg = processedMessages[processedMessages.length - 1];
      if (lastMsg?.role === 'user') {
        const context = searchResults
          .map((r, i) => `[Sumber ${i + 1}] ${r.title}\n${r.snippet}${r.url ? `\nURL: ${r.url}` : ''}`)
          .join('\n\n');

        processedMessages = [
          ...processedMessages.slice(0, -1),
          {
            role:    'user',
            content: `${lastMsg.content}\n\n---\n[Konteks dari pencarian web]:\n${context}\n---\nGunakan konteks di atas untuk memberikan jawaban yang lebih akurat dan terkini.`,
          },
        ];
      }
    }

    const completion = await groq.chat.completions.create({
      // FIXED: Ganti model yang mati ke Llama 3.1
      model:       'llama-3.1-8b-instant', 
      messages:    [
        { role: 'system', content: systemPrompt },
        ...processedMessages,
      ] as ChatCompletionMessageParam[], // FIXED: Type casting agar build sukses
      temperature: proMode ? 0.55 : 0.72,
      max_tokens:  proMode ? 8192 : 4096,
      top_p:       0.95,
      stream:      false,
    });

    const reply = completion.choices[0]?.message?.content ?? '';

    return NextResponse.json({
      message: reply,
      proMode,
      usage:   completion.usage,
    });

  } catch (error: any) {
    console.error('[BYYU AI] Chat error:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
