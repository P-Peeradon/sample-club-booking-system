import type { Metadata } from 'next';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Elmore High School - Club Portal',
  description: 'Connect with your friends at Elmore High and enroll in the coolest clubs!',
};

export default async function RootLayout(props: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const params = await props.params;
  const children = props.children;
  return (
    <html lang={params.locale} className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col font-sans antialiased text-elmore-dark bg-[#f0f7ff]">
        {children}
      </body>
    </html>
  );
}
