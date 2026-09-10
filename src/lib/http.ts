import {AppError,safeError} from './domain';
export function sessionOf(request:Request):string {const id=request.headers.get('x-crm-session');if(!id||!/^[a-f0-9]{64}$/.test(id))throw new AppError('SESSION','Reload the application to establish a session.',401);return id;}
export function sameOrigin(request:Request){const origin=request.headers.get('origin');const expected=process.env.APP_ORIGIN||new URL(request.url).origin;if(origin!==expected)throw new AppError('ORIGIN','Cross-origin actions are not allowed.',403);}
export async function readJson(request:Request):Promise<unknown>{
  if(!request.headers.get('content-type')?.includes('application/json'))throw new AppError('CONTENT_TYPE','Send application/json.',415);
  const reader=request.body?.getReader();if(!reader)throw new AppError('BODY','A request body is required.');
  let length=0;const chunks:Uint8Array[]=[];
  try{while(true){const {done,value}=await reader.read();if(done)break;length+=value.byteLength;if(length>8192){await reader.cancel();throw new AppError('BODY_LIMIT','This request is too large.',413);}chunks.push(value);}}
  finally{reader.releaseLock();}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new AppError('JSON','The request is not valid JSON.');}
}
export function errorResponse(error:unknown){const safe=safeError(error);return Response.json({error:safe.message},{status:safe.status,headers:{'Cache-Control':'no-store'}});}
const active=new Set<string>();const recent=new Map<string,number[]>();
export function acquireRun(sessionId:string){const now=Date.now();const hits=(recent.get(sessionId)??[]).filter(t=>now-t<60000);if(active.has(sessionId)||active.size>=4||hits.length>=8)throw new AppError('RATE_LIMIT','Too many active requests. Finish the current run before trying again.',429);if(recent.size>1000){for(const [id,times] of recent)if(times.every(t=>now-t>=60000))recent.delete(id);}
  active.add(sessionId);recent.set(sessionId,[...hits,now]);return ()=>active.delete(sessionId);
}
