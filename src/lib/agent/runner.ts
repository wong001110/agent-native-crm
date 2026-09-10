import 'server-only';
import { and, eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { runs } from '@/lib/db/schema';
import { getRun, loadData } from '@/lib/db/repository';
import { getConfig } from '@/lib/config';
import { proposeTask } from '@/lib/actions';
import { runFixture } from './mock';
import { runLiveAgent } from './live';
import type { Run, ToolEvent } from '@/lib/domain';

export async function executeRun(args:{run:Run;workspaceId:string;previousRunId?:string;signal:AbortSignal;emit:(event:ToolEvent)=>void}):Promise<Run>{
  const {run,workspaceId}=args;const config=getConfig();
  const events:ToolEvent[]=[];const emit=(event:ToolEvent)=>{events.push(event);args.emit(event);};
  const signal=AbortSignal.any([args.signal,AbortSignal.timeout(config.timeoutMs)]);
  try{
    const previous=args.previousRunId?await getRun(workspaceId,args.previousRunId):undefined;
    const data=await loadData(workspaceId);
    const options={workspaceId,prompt:run.prompt,totalDeals:data.deals.length,previous,signal,emit};
    const workspace=run.mode==='live'?await runLiveAgent(options):await runFixture(options);
    signal.throwIfAborted();
    if(workspace.spec.action){
      const {dealId,title,dueDate}=workspace.spec.action;
      workspace.proposal=await proposeTask(workspaceId,{dealId,title,dueDate},run.id);
    }
    signal.throwIfAborted();
    const [result]=await getDb().update(runs).set({status:'completed',toolEvents:events,workspace}).where(and(eq(runs.id,run.id),eq(runs.workspaceId,workspaceId))).returning();
    return result;
  }catch(error){
    await getDb().update(runs).set({status:signal.aborted?'cancelled':'failed',toolEvents:events}).where(and(eq(runs.id,run.id),eq(runs.workspaceId,workspaceId)));
    throw error;
  }
}
