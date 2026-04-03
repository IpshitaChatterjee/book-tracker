import { Playfair_Display, EB_Garamond } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-garamond',
  display: 'swap',
});

export const metadata = {
  title: 'My Reading Journey',
  description: 'Personal Reading Ledger',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${garamond.variable}`}>
      <body>{children}</body>
    </html>
  );
}
