import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Elmore High School - Club Portal',
  description: 'Connect with your friends at Elmore High and enroll in the coolest clubs!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col font-sans antialiased text-elmore-dark bg-[#f0f7ff]">
        {children}
      </body>
    </html>
  );
}
