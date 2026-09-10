import { z } from 'zod';
import { getConfig, publicError } from '@/lib/config';
import { beginRun } from '@/lib/db/repository';
import { executeRun } from '@/lib/agent/runner';
import { requireSession,sameOrigin,jsonBody,errorResponse } from '@/lib/security';
import type { AgentEvent } from '@/lib/domain';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(request:Request){
  try{
    sameOrigin(request);const workspaceId=await requireSession(request);
    const input=await jsonBody(request,z.object({prompt:z.string().trim().min(2).max(1500),previousRunId:z.string().uuid().optional()}).strict());
    const config=getConfig();const run=await beginRun(workspaceId,input.prompt,config.mode);
    const cancellation=new AbortController();const signal=AbortSignal.any([request.signal,cancellation.signal]);
    const encoder=new TextEncoder();let closed=false;
    const stream=new ReadableStream<Uint8Array>({
      async start(controller){
        const send=(event:AgentEvent)=>{if(!closed&&!signal.aborted)controller.enqueue(encoder.encode(JSON.stringify(event)+'\n'));};
        try{
          send({type:'run',runId:run.id,mode:run.mode});
          const result=await executeRun({run,workspaceId,previousRunId:input.previousRunId,signal,emit:event=>send({type:'progress',event})});
          send({type:'result',run:result});
        }catch(error){send({type:'error',message:publicError(error).message});}
        finally{if(!closed){closed=true;try{controller.close();}catch{/* Client already cancelled the stream. */}}}
      },
      cancel(){closed=true;cancellation.abort();},
    });
    return new Response(stream,{headers:{'Content-Type':'application/x-ndjson; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }catch(error){return errorResponse(error);}
}
