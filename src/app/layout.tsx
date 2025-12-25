import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'CLOUT LAB | Premium Streetwear',
  description: 'The ultimate destination for Gen Z streetwear. Hoodies, Shirts, and Pants with a futuristic tech vibe.',
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
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
