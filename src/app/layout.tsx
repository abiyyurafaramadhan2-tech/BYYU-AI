// BYYU AI v2 — Layout
// © Abiyyu Rafa Ramadhan
import type { Metadata, Viewport } from 'next';
import { Lora, Inter }             from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';

const lora = Lora({
  subsets:  ['latin'],
  weight:   ['400', '500', '600'],
  style:    ['normal', 'italic'],
  variable: '--font-serif',
  display:  'swap',
});

const inter = Inter({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600'],
  variable: '--font-sans',
  display:  'swap',
});

export const metadata: Metadata = {
  title:       'BYYU AI',
  description: 'Asisten AI canggih oleh Abiyyu Rafa Ramadhan — SMKN 1 Purwakarta',
  authors:     [{ name: 'Abiyyu Rafa Ramadhan' }],
  creator:     'Abiyyu Rafa Ramadhan',
  keywords:    ['BYYU AI', 'Abiyyu Rafa Ramadhan', 'AI Assistant', 'SMKN 1 Purwakarta'],
};

export const viewport: Viewport = {
  themeColor:   '#f9f9f8',
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${lora.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevent dark mode flash */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('byyu-theme');
              if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              document.documentElement.setAttribute('data-theme', t);
            } catch(e) {}
          })();
        `}} />
      </head>
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
