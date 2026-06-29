import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ARIA — AI Coach for U.S. Insurance Licensing Exams',
  description: 'Personalized quizzes, adaptive study plans, and real coaching — built specifically for U.S. insurance exams.',
  openGraph: {
    title: 'ARIA — AI Coach for U.S. Insurance Licensing Exams',
    description: 'The smartest way to prepare for your insurance licensing exam.',
    type: 'website',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F0A07',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
