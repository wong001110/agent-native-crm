import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Relay — Agent-native CRM', description: 'A small, intent-driven CRM prototype. Less administration. More informed decisions.' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
