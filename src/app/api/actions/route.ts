import {getStore} from '@/lib/server-store';
import {actionRequestSchema,publicProposal} from '@/lib/contracts';
import {draftProposal,AppError} from '@/lib/domain';
import {sessionOf,sameOrigin,readJson,errorResponse} from '@/lib/http';
export async function POST(request:Request){try{
  sameOrigin(request);const session=sessionOf(request);const parsed=actionRequestSchema.safeParse(await readJson(request));if(!parsed.success)throw new AppError('INPUT','Check the action fields and try again.');
  const input=parsed.data,store=getStore();
  if(input.intent==='prepare'){const proposal=draftProposal(session,input.draft,null);await store.saveProposal(proposal);return Response.json({proposal:publicProposal(proposal)},{headers:{'Cache-Control':'no-store'}});}
  if(input.intent==='reject')return Response.json({proposal:publicProposal(await store.reject(input.proposalId,session))},{headers:{'Cache-Control':'no-store'}});
  const task=await store.approve(input.proposalId,session);return Response.json({task:{...task,sessionId:''},proposal:publicProposal((await store.getProposal(input.proposalId,session))!)},{headers:{'Cache-Control':'no-store'}});
}catch(error){return errorResponse(error);}}
