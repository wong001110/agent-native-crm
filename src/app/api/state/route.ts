import { getConfig } from '@/lib/config';
import { getAppData } from '@/lib/db/repository';
import { requireSession,respond,errorResponse } from '@/lib/security';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){
  try{const id=await requireSession(request);const config=getConfig();return respond({...await getAppData(id),mode:config.mode,model:config.mode==='mock'?'Scripted fixture (not an LLM)':config.model,protected:Boolean(config.accessToken)});}catch(error){return errorResponse(error);}
}
