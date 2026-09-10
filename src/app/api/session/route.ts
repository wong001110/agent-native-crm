import { z } from 'zod';
import { getConfig, AppError } from '@/lib/config';
import { createWorkspace } from '@/lib/db/repository';
import { requireSession, sameOrigin, jsonBody, respond, errorResponse, sessionCookie, sameSecret } from '@/lib/security';
export const runtime='nodejs';
export async function POST(request:Request){
  try{
    sameOrigin(request);const input=await jsonBody(request,z.object({accessToken:z.string().max(200).optional()}).strict());const config=getConfig();
    try{await requireSession(request);return respond({ok:true,mode:config.mode});}catch(error){if(!(error instanceof AppError)||error.status!==401)throw error;}
    if(config.accessToken&&!sameSecret(input.accessToken??'',config.accessToken))throw new AppError('AUTH','Enter the demo access token to continue.',401);
    const id=await createWorkspace();
    return respond({ok:true,mode:config.mode},200,{'Set-Cookie':sessionCookie(request,id)});
  }catch(error){return errorResponse(error);}
}
