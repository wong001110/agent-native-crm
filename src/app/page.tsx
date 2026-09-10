import { Suspense } from 'react';
import { CrmApp } from '@/components/crm-app';
export default function Page(){return <Suspense fallback={<main className="welcome"><p role="status">Opening workspace…</p></main>}><CrmApp/></Suspense>;}
