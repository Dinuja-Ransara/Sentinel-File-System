import './globals.css';

export const metadata = {
  title: 'Sentinel - Enterprise Zero-Knowledge Secure Document Vault',
  description: 'Military-grade zero-knowledge encrypted file storage, threat scanning, and secure collaboration.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased selection:bg-blue-600 selection:text-white bg-[#f8fafc] text-slate-900">
        {children}
      </body>
    </html>
  );
}
