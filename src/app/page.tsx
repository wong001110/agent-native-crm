import Link from 'next/link';
import { getStore,snapshot,summarize } from '@/lib/db/store';
import { money } from '@/lib/utils';
export const dynamic='force-dynamic';
export default async function Today() {
  const summary=summarize(await snapshot(await getStore()));
  return <><div className="eyebrow">TODAY / YOUR WORKSPACE</div><section className="page-heading"><h1>Your next move,<br/><span>in context.</span></h1><p>A quieter place to understand your customers and decide what comes next.</p></section><div className="metric-strip"><div><small>Active deals</small><strong>{summary.activeDeals}<span> / {summary.deals}</span></strong></div><div><small>Pipeline value</small><strong>{money(summary.pipeline)}</strong></div><div><small>Customers</small><strong>{summary.customers}</strong></div><div><small>Open tasks</small><strong>{summary.openTasks}</strong></div></div><section className="empty-panel"><span className="eyebrow">SOURCE OF RECORD READY</span><h2>Start with the whole picture.</h2><p>Your sample CRM is persistent and inspectable. Agent workspaces are being connected in the next phase.</p><Link className="primary-link" href="/explore">Explore your CRM <span aria-hidden="true">↗</span></Link></section></>;
}
