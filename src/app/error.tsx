'use client';
import Link from 'next/link';
export default function ErrorPage({reset}:{error:Error;reset:()=>void}){return <section className="empty-panel" role="alert"><div className="eyebrow">WORKSPACE UNAVAILABLE</div><h1>We could not load this view.</h1><p>No success is assumed. Check database configuration and retry.</p><button className="primary-link" onClick={reset}>Try again</button> <Link href="/explore">Open Explore</Link></section>;}
