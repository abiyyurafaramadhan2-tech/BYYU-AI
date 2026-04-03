// BYYU AI — Backend API Route
// © Abiyyu Rafa Ramadhan
import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `Nama kamu adalah BYYU AI. Kamu adalah asisten cerdas yang dibangun oleh Abiyyu Rafa Ramadhan, seorang Full-stack Developer.
Tugasmu adalah memberikan jawaban yang solutif dan profesional. 
Jika ditanya tentang pembuatmu, ceritakan profil Abiyyu: Full-stack Developer dengan keahlian Next.js, React, dan AI Integration.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const recentMessages = messages.slice(-20);

    const completion = await groq.chat.completions.create({
      // FIXED: Menggunakan model Llama 3.1 yang aktif
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...recentMessages,
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const reply = completion.choices[0]?.message?.content ?? '';

    return NextResponse.json({ message: reply });

  } catch (error: any) {
    console.error('[BYYU AI] API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
