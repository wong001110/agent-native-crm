import type { Metadata } from 'next';
import './globals.css';
import './product.css';
export const metadata: Metadata = { title: 'Native CRM — an agent-native prototype', description: 'Intent-driven CRM workspaces, grounded in your data.' };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
