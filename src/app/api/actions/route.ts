import { z } from 'zod';
import { decideProposal } from '@/lib/actions';
import { requireSession,sameOrigin,jsonBody,respond,errorResponse } from '@/lib/security';
export const runtime='nodejs';
export async function POST(request:Request){
  try{sameOrigin(request);const id=await requireSession(request);const input=await jsonBody(request,z.object({proposalId:z.string().uuid(),decision:z.enum(['approve','reject'])}).strict());return respond(await decideProposal(id,input.proposalId,input.decision));}catch(error){return errorResponse(error);}
}
