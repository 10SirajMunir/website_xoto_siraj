import localFont from 'next/font/local';

export const geist = localFont({
  src: '../fonts/geist.woff2',
  weight: '100 900',
  variable: '--font-geist',
  display: 'swap',
});

export const geistMono = localFont({
  src: '../fonts/geist-mono.woff2',
  weight: '100 900',
  variable: '--font-geist-mono',
  display: 'swap',
});
