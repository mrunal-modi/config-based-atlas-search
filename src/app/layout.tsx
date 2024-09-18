'use client';

import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import theme from '@/styles/theme';
import GlobalStyles from '@/styles/GlobalStyles';

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <GlobalStyles />
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              <main style={{ flex: 1 }}>{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </UserProvider>
      </body>
    </html>
  );
}