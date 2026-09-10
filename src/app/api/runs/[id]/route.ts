import {getStore} from '@/lib/server-store';
import {publicRun,publicProposal} from '@/lib/contracts';
import {AppError} from '@/lib/domain';
import {sessionOf,errorResponse} from '@/lib/http';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){try{const session=sessionOf(request);const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))throw new AppError('NOT_FOUND','Run not found.',404);const store=getStore();const run=await store.getRun(id,session);if(!run)throw new AppError('NOT_FOUND','Run not found in this session.',404);if(run.workspace?.proposal){const p=await store.getProposal(run.workspace.proposal.id,session);if(p)run.workspace.proposal=publicProposal(p);}return Response.json({run:publicRun(run)},{headers:{'Cache-Control':'no-store'}});}catch(e){return errorResponse(e);}}
