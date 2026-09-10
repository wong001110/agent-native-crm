import {getStore} from '@/lib/server-store';
import {summaryOf} from '@/lib/domain';
import {publicRun} from '@/lib/contracts';
import {sessionOf,errorResponse} from '@/lib/http';
import {agentMode} from '@/lib/agent/run';
import {DATASET_AS_OF} from '@/lib/seed';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const session=sessionOf(request);const store=getStore();const [snapshot,runs]=await Promise.all([store.snapshot(session),store.listRuns(session)]);return Response.json({snapshot:{...snapshot,tasks:snapshot.tasks.map(t=>({...t,sessionId:''})),activities:snapshot.activities.map(a=>({...a,sessionId:null}))},summary:summaryOf(snapshot),runs:runs.map(publicRun),mode:agentMode(),database:process.env.DB_MODE??'demo',datasetAsOf:DATASET_AS_OF},{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
