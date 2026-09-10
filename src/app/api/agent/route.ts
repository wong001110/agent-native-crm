import {getStore} from '@/lib/server-store';
import {requestSchema,type AgentEvent} from '@/lib/contracts';
import {runAgent} from '@/lib/agent/run';
import {sessionOf,sameOrigin,readJson,errorResponse,acquireRun} from '@/lib/http';
import {AppError} from '@/lib/domain';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(request:Request){
  let release:(()=>unknown)|undefined;
  try{
    sameOrigin(request);const session=sessionOf(request);const parsed=requestSchema.safeParse(await readJson(request));if(!parsed.success)throw new AppError('INPUT','Use a non-empty prompt up to 1200 characters.');
    const store=getStore();release=acquireRun(session);const cancel=new AbortController();const encoder=new TextEncoder();let closed=false;
    const stream=new ReadableStream<Uint8Array>({
      start(controller){
        const send=(event:AgentEvent)=>{if(!closed){try{controller.enqueue(encoder.encode(JSON.stringify(event)+'\n'));}catch{closed=true;cancel.abort();}}};
        void runAgent(store,session,parsed.data,{signal:AbortSignal.any([request.signal,cancel.signal]),onEvent:send}).catch(()=>send({type:'error',message:'The run could not be saved. Use Explore or retry.'})).finally(()=>{release?.();if(!closed){closed=true;controller.close();}});
      },
      cancel(){closed=true;cancel.abort();},
    });
    return new Response(stream,{headers:{'Content-Type':'application/x-ndjson; charset=utf-8','Cache-Control':'no-store, no-transform','X-Content-Type-Options':'nosniff'}});
  }catch(error){release?.();return errorResponse(error);}
}
