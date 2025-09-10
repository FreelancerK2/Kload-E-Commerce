import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import ConditionalNavbar from '@/components/ConditionalNavbar';
import ToastContainer from '@/components/Toast';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Kload - Premium E-commerce Store',
  description:
    'Discover amazing products at Kload. Shop the latest trends with secure payments and fast delivery.',
  keywords: 'e-commerce, shopping, online store, fashion, electronics',
  authors: [{ name: 'Kload Team' }],
  openGraph: {
    title: 'Kload - Premium E-commerce Store',
    description:
      'Discover amazing products at Kload. Shop the latest trends with secure payments and fast delivery.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white min-h-screen`}
      >
        <ConditionalNavbar />
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
