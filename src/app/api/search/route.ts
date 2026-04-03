// BYYU AI v2 — Web Search API (Wikipedia)
// © Abiyyu Rafa Ramadhan
import { NextRequest, NextResponse } from 'next/server';

interface WikiSearchHit {
  title:   string;
  snippet: string;
}

interface WikiSummary {
  title:        string;
  extract:      string;
  content_urls?: {
    desktop?: { page?: string };
  };
}

export async function POST(req: NextRequest) {
  try {
    const { query }: { query: string } = await req.json();

    if (!query?.trim()) {
      return NextResponse.json({ error: 'Query wajib diisi', results: [] }, { status: 400 });
    }

    const encoded = encodeURIComponent(query.trim());
    const results: { title: string; snippet: string; url: string; source: string }[] = [];

    // 1. Coba Wikipedia Bahasa Indonesia dulu
    const idSearchRes = await fetch(
      `https://id.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&format=json&srlimit=4&origin=*`,
      { signal: AbortSignal.timeout(6000) }
    ).catch(() => null);

    if (idSearchRes?.ok) {
      const idData = await idSearchRes.json();
      const idHits: WikiSearchHit[] = idData.query?.search ?? [];

      for (const hit of idHits.slice(0, 2)) {
        try {
          const summaryRes = await fetch(
            `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`,
            { signal: AbortSignal.timeout(4000) }
          );
          if (summaryRes.ok) {
            const s: WikiSummary = await summaryRes.json();
            results.push({
              title:   s.title,
              snippet: (s.extract ?? hit.snippet.replace(/<[^>]+>/g, '')).slice(0, 600),
              url:     s.content_urls?.desktop?.page ?? `https://id.wikipedia.org/wiki/${encodeURIComponent(hit.title)}`,
              source:  'Wikipedia (ID)',
            });
          }
        } catch {
          results.push({
            title:   hit.title,
            snippet: hit.snippet.replace(/<[^>]+>/g, '').slice(0, 400),
            url:     `https://id.wikipedia.org/wiki/${encodeURIComponent(hit.title)}`,
            source:  'Wikipedia (ID)',
          });
        }
      }
    }

    // 2. Tambah dari Wikipedia English
    const enSearchRes = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&format=json&srlimit=3&origin=*`,
      { signal: AbortSignal.timeout(6000) }
    ).catch(() => null);

    if (enSearchRes?.ok) {
      const enData = await enSearchRes.json();
      const enHits: WikiSearchHit[] = enData.query?.search ?? [];

      for (const hit of enHits.slice(0, 2)) {
        try {
          const summaryRes = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`,
            { signal: AbortSignal.timeout(4000) }
          );
          if (summaryRes.ok) {
            const s: WikiSummary = await summaryRes.json();
            if (s.extract) {
              results.push({
                title:   s.title,
                snippet: s.extract.slice(0, 500),
                url:     s.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title)}`,
                source:  'Wikipedia (EN)',
              });
            }
          }
        } catch {
          // skip
        }
        if (results.length >= 4) break;
      }
    }

    return NextResponse.json({ results: results.slice(0, 4), query });

  } catch (error) {
    console.error('[BYYU AI] Search error:', error);
    return NextResponse.json({ error: 'Pencarian gagal', results: [] }, { status: 500 });
  }
}
