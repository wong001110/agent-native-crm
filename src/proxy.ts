import {NextResponse,type NextRequest} from 'next/server';
import {createHash,randomUUID,timingSafeEqual} from 'node:crypto';
function equal(a:string,b:string){const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y);}
export function proxy(request:NextRequest){
  const password=process.env.APP_PASSWORD;
  const protectedMode=process.env.AGENT_MODE==='live'||process.env.DB_MODE==='postgres';
  if(process.env.NODE_ENV==='production'&&protectedMode&&!password)return new NextResponse('Configure APP_PASSWORD before exposing live or PostgreSQL mode.',{status:503});
  if(password){
    const value=request.headers.get('authorization')??'';let credentials='';
    if(value.startsWith('Basic ')&&value.length<2048){try{credentials=Buffer.from(value.slice(6),'base64').toString('utf8');}catch{}}
    if(!equal(credentials,`demo:${password}`))return new NextResponse('Demo access requires authentication.',{status:401,headers:{'WWW-Authenticate':'Basic realm="CRM Prototype", charset="UTF-8"','Cache-Control':'no-store'}});
  }
  const supplied=request.cookies.get('crm-session')?.value;
  const token=supplied&&/^[0-9a-f-]{36}$/i.test(supplied)?supplied:randomUUID();
  const headers=new Headers(request.headers);headers.set('x-crm-session',createHash('sha256').update(token).digest('hex'));
  const response=NextResponse.next({request:{headers}});
  if(token!==supplied)response.cookies.set('crm-session',token,{httpOnly:true,sameSite:'lax',secure:request.nextUrl.protocol==='https:',path:'/',maxAge:60*60*24*7});
  return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
