import type { Metadata, Viewport } from 'next';
import { Montserrat } from 'next/font/google';
import { Providers } from './providers';
import '../styles/globals.scss';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Busg',
  description: 'Real-time bus arrival timings for every bus stop in Singapore.',
  // app/icon.tsx and app/apple-icon.tsx are auto-linked by Next; public/favicon.ico
  // is kept as a passive fallback for user agents that fetch it directly by convention.
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#141414' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
