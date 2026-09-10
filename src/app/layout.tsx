import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
export const metadata: Metadata = {title:'Agent-native CRM Prototype',description:'Intent-driven work, source-backed decisions. A technical prototype.'};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><header className="app-header"><Link href="/" className="brand"><span className="brand-mark" aria-hidden="true">a</span><span>Agent CRM<small>PROTOTYPE</small></span></Link><nav aria-label="Primary"><Link href="/">Today</Link><Link href="/workspace">Workspace</Link><Link href="/explore">Explore</Link></nav><span className="mode-label">Synthetic CRM data</span></header><main id="main" className="app-main">{children}</main><footer className="app-footer"><span>Facts from records. Interpretation from the agent.</span><Link href="/explore">Your data is always one step away ↗</Link></footer></body></html>;
}
