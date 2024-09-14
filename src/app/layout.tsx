import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import "./globals.css";

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata = {
  metadataBase: new URL('https://mongodbmethods.com/'),
  title: 'MongoDB Search',
  description: 'Just update the config for a given database and collection, and deploy a powerful',
  openGraph: {
    title: 'MongoDB Search',
    description: 'Just update the config for a given database and collection, and deploy a powerful',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MongoDB Search',
      },
    ],
    url: 'https://mongodbmethods.com/',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <UserProvider>
        <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <main style={{ flex: 1 }}>{children}</main>
          <Footer />
        </body>
      </UserProvider>
    </html>
  );
}