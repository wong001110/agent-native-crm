import {Suspense} from 'react';
import {CrmProvider} from '@/components/crm-provider';
import {AppShell} from '@/components/app-shell';
export default function CrmLayout({children}:{children:React.ReactNode}){return <Suspense fallback={<main className="initial-loading" role="status">Opening your workspace…</main>}><CrmProvider><AppShell>{children}</AppShell></CrmProvider></Suspense>;}
