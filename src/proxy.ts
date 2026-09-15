import {NextResponse,type NextRequest} from 'next/server';
import {createHash,randomUUID} from 'node:crypto';
import {authCookieName,hasValidAuthenticationToken} from './lib/auth';
export function proxy(request:NextRequest){
  const password=process.env.APP_PASSWORD;
  const protectedMode=process.env.AGENT_MODE==='live'||process.env.DB_MODE==='postgres';
  if(process.env.NODE_ENV==='production'&&protectedMode&&!password)return new NextResponse('Configure APP_PASSWORD before exposing live or PostgreSQL mode.',{status:503});
  const publicRoute=request.nextUrl.pathname==='/login'||request.nextUrl.pathname==='/api/auth/login';
  if(password&&!publicRoute&&!hasValidAuthenticationToken(request.cookies.get(authCookieName)?.value,password)){
    if(request.nextUrl.pathname.startsWith('/api/'))return NextResponse.json({error:'Sign in is required to access this workspace.'},{status:401,headers:{'Cache-Control':'no-store'}});
    const login=request.nextUrl.clone();login.pathname='/login';login.search='';login.searchParams.set('next',`${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(login);
  }
  const supplied=request.cookies.get('crm-session')?.value;
  const token=supplied&&/^[0-9a-f-]{36}$/i.test(supplied)?supplied:randomUUID();
  const headers=new Headers(request.headers);headers.set('x-crm-session',createHash('sha256').update(token).digest('hex'));
  const response=NextResponse.next({request:{headers}});
  if(token!==supplied)response.cookies.set('crm-session',token,{httpOnly:true,sameSite:'lax',secure:request.nextUrl.protocol==='https:',path:'/',maxAge:60*60*24*7});
  return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
