import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "VolleyRotations",
  description: "Volleyball rotation visualizer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-neutral-950 text-neutral-100">{children}</body>
    </html>
  );
}