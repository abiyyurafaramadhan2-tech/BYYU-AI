// BYYU AI — © Abiyyu Rafa Ramadhan
import type { Metadata, Viewport } from 'next';
import {
  Lora,
  Inter,
} from 'next/font/google';
import './globals.css';

// ── Serif font untuk AI response ──────────────────────────
const lora = Lora({
  subsets:  ['latin'],
  weight:   ['400', '500', '600'],
  style:    ['normal', 'italic'],
  variable: '--font-serif',
  display:  'swap',
});

// ── Sans-serif font untuk UI & input ──────────────────────
const inter = Inter({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  variable: '--font-sans',
  display:  'swap',
});

export const metadata: Metadata = {
  title:       'BYYU AI',
  description: 'Asisten AI cerdas yang dibangun oleh Abiyyu Rafa Ramadhan',
  authors:     [{ name: 'Abiyyu Rafa Ramadhan' }],
  creator:     'Abiyyu Rafa Ramadhan',
  keywords:    ['BYYU AI', 'Abiyyu Rafa Ramadhan', 'AI Assistant', 'Groq', 'Llama'],
  openGraph: {
    title:       'BYYU AI',
    description: 'Asisten AI cerdas oleh Abiyyu Rafa Ramadhan',
    type:        'website',
  },
};

export const viewport: Viewport = {
  themeColor:      '#f9f9f8',
  width:           'device-width',
  initialScale:    1,
  maximumScale:    1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${lora.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans bg-off-white text-charcoal min-h-screen">
        {children}
      </body>
    </html>
  );
}
