import {NextResponse} from 'next/server';
import {authCookieName,authenticationToken,passwordsMatch} from '@/lib/auth';
import {errorResponse,readJson} from '@/lib/http';

function response(body:Record<string,unknown>,status:number){
  return NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
}

export async function POST(request:Request){
  try{
    const body=await readJson(request);
    const password=body&&typeof body==='object'&&typeof (body as {password?:unknown}).password==='string'?(body as {password:string}).password:'';
    const configuredPassword=process.env.APP_PASSWORD;
    if(!configuredPassword)return response({error:'Sign-in is not configured for this workspace.'},409);
    if(!password||password.length>512)return response({error:'Enter the workspace password.'},400);
    if(!passwordsMatch(password,configuredPassword))return response({error:'The workspace password is incorrect.'},401);
    const result=response({ok:true},200);
    result.cookies.set(authCookieName,authenticationToken(configuredPassword),{httpOnly:true,sameSite:'lax',secure:new URL(request.url).protocol==='https:',path:'/',maxAge:60*60*24*7});
    return result;
  }catch(error){return errorResponse(error);}
}
