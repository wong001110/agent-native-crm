import type { Metadata } from 'next';
import './globals.css';
import './refinements.css';
export const metadata: Metadata = { title: 'Agent-native CRM · Prototype', description: 'An intent-driven CRM prototype. Less administration. More informed decisions.' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="en"><body>{children}</body></html>; }
