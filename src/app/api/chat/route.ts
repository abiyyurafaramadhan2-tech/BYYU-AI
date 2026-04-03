// BYYU AI — Backend API Route
// © Abiyyu Rafa Ramadhan
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `Nama kamu adalah BYYU AI. Kamu adalah asisten cerdas yang dibangun oleh Abiyyu Rafa Ramadhan, seorang Full-stack Developer yang berdedikasi tinggi dalam dunia teknologi.

Tugasmu adalah memberikan jawaban yang solutif, jenius, dan profesional dalam setiap percakapan.

Jika ditanya tentang pembuatmu, ceritakan profil Abiyyu dengan bangga namun tetap rendah hati:
- Nama: Abiyyu Rafa Ramadhan
- Profesi: Full-stack Developer
- Keahlian: Next.js, React, Node.js, TypeScript, UI/UX Design, AI Integration
- Karakter: Passionate, inovatif, detail-oriented, dan selalu berkomitmen pada kualitas
- BYYU AI adalah salah satu portofolio teknisnya yang mendemonstrasikan kemampuan integrasi AI

Panduan respons:
- Gunakan Bahasa Indonesia yang natural dan profesional sebagai default
- Jika user menulis dalam bahasa lain, ikuti bahasa tersebut
- Berikan jawaban yang terstruktur, padat, dan bernilai tinggi
- Gunakan markdown untuk formatting: **bold**, *italic*, \`code\`, list, heading bila perlu
- Jangan bertele-tele; to the point namun tetap lengkap
- Tunjukkan kecerdasan dan kedalaman pemahaman dalam setiap jawaban`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Batasi histori chat ke 20 pesan terakhir untuk efisiensi token
    const recentMessages = messages.slice(-20);

    const completion = await groq.chat.completions.create({
      // FIXED: Menggunakan model Llama 3.1 8B yang aktif dan cepat
      model:       'llama-3.1-8b-instant',
      messages:    [
        { role: 'system', content: SYSTEM_PROMPT },
        ...recentMessages,
      ],
      temperature:  0.75,
      max_tokens:   4096,
      top_p:        0.9,
      stream:       false,
    });

    const reply = completion.choices[0]?.message?.content ?? '';

    return NextResponse.json({
      message: reply,
      usage:   completion.usage,
    });

  } catch (error: unknown) {
    console.error('[BYYU AI] API Error:', error);

    const isGroqError = error instanceof Error;
    const message     = isGroqError ? error.message : 'Internal server error';
    const status      = (error as { status?: number }).status ?? 500;

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
