import './globals.css';

export const metadata = {
  title: 'Face Auth System',
  description: 'Authentication system with facial recognition',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}