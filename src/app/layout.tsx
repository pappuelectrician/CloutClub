import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import SideScroll from '@/components/layout/SideScroll';

import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'CLOUT CLUB | Premium Streetwear',
  description: 'The ultimate destination for Gen Z streetwear. Hoodies, Shirts, and Pants with a futuristic tech vibe.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/icon.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <SideScroll />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
