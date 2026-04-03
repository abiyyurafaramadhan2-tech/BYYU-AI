// BYYU AI — © Abiyyu Rafa Ramadhan
import type { Metadata, Viewport } from 'next';
import { Lora, Inter } from 'next/font/google';
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
  description: 'Asisten AI cerdas oleh Abiyyu Rafa Ramadhan',
  authors:     [{ name: 'Abiyyu Rafa Ramadhan' }],
  creator:     'Abiyyu Rafa Ramadhan',
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
      <body style={{ margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#f9f9f8' }}>
        {children}
      </body>
    </html>
  );
}
