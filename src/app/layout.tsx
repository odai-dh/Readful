import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Readful — News without the noise',
  description: 'A calm, minimal news reader. Read what matters, dismiss the rest.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
