export const metadata = {
  title: 'Sentinel File System',
  description: 'Secure Document Vault & Sharing Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-sentinel-50 text-slate-900 min-h-screen">{children}</body>
    </html>
  );
}