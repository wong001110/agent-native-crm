import { proposeTask } from '@/lib/actions';
import { actionInput } from '@/lib/workspace';
import { requireSession,sameOrigin,jsonBody,respond,errorResponse } from '@/lib/security';
export const runtime='nodejs';
export async function POST(request:Request){
  try{sameOrigin(request);const id=await requireSession(request);const input=await jsonBody(request,actionInput);return respond({proposal:await proposeTask(id,input)},201);}catch(error){return errorResponse(error);}
}
