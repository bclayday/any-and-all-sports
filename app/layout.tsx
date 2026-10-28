import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SessionProvider from '@/components/SessionProvider';
import { WebSiteSchema } from '@/components/StructuredData';

export const metadata: Metadata = {
  title: {
    default: 'What Sports Are On Tonight? | Any & All Sports TV Schedule',
    template: '%s | Any & All Sports',
  },
  description:
    "Today's complete sports TV and streaming schedule. Find every NBA, NFL, MLB, NHL, Soccer, Golf and MMA game on tonight - with channel and streaming info.",
  keywords: [
    'what sports are on tonight',
    'sports on tv tonight',
    'sports schedule today',
    'what games are on tonight',
    'NBA games tonight',
    'NHL games tonight',
    'MLB games tonight',
    'NFL games tonight',
    'sports streaming tonight',
    'what channel is the game on tonight',
    'sports TV schedule',
    'sports streaming',
  ],
  openGraph: {
    title: 'What Sports Are On Tonight? | Any & All Sports TV Schedule',
    description:
      "Today's complete sports TV and streaming schedule. Find every NBA, NFL, MLB, NHL, Soccer, Golf and MMA game on tonight - with channel and streaming info.",
    type: 'website',
    siteName: 'Any & All Sports',
    url: 'https://anyandallsports.com',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What Sports Are On Tonight? | Any & All Sports TV Schedule',
    description:
      "Today's complete sports TV and streaming schedule. Find every NBA, NFL, MLB, NHL, Soccer, Golf and MMA game on tonight.",
    site: '@anyandallsports',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://anyandallsports.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta {...(({ name: 'impact-site-verification', value: '6cd398ac-e48a-4fc0-8fa0-eccd2ee462ba' }) as any)} />
        <meta name="fo-verify" content="a6ebbbe1-bfed-4688-97e8-2d55d27df9da" />
        <WebSiteSchema />
      </head>
      <body className="bg-[#0a0a0a] text-white min-h-screen flex flex-col">
        <SessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
