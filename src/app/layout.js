import { geist, geistMono } from './fonts';
import './globals.css';
import MotionProvider from '@/components/layout/MotionProvider';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import XoProvider from '@/components/xo/XoProvider';
import { LITE_SCRIPT } from '@/lib/device';

// Wording follows the live xoto.ae so existing search rankings carry over.
const DESCRIPTION = "Xoto is UAE's premier platform for real estate, mortgage services, interior design, landscaping, and AI-powered property tools.";

export const metadata = {
  metadataBase: new URL('https://www.xoto.ae'),
  title: 'XOTO | UAE Real Estate & Mortgage Platform, Powered by AI',
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'XOTO',
    title: 'XOTO | UAE Real Estate & Mortgage Platform',
    description: "UAE's premier platform for real estate, mortgage, interior design and AI-powered tools.",
    url: '/',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport = {
  themeColor: '#FFFFFF',
  colorScheme: 'light',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LITE_SCRIPT }} />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <XoProvider>
          <MotionProvider />
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </XoProvider>
      </body>
    </html>
  );
}
