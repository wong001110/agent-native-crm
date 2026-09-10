import 'server-only';
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { AppError, getConfig, publicError } from './config';
import { getDb } from './db/client';
import { workspaces } from './db/schema';
const cookieName='native-crm-session';
function sign(payload:string,secret:string) { return createHmac('sha256',secret).update(payload).digest('base64url'); }
export function sameSecret(a:string,b:string) { return timingSafeEqual(createHash('sha256').update(a).digest(),createHash('sha256').update(b).digest()); }
export function encodeSession(id:string,secret:string) {
  const payload=`${id}.${Date.now()+7*86400000}`; return `${payload}.${sign(payload,secret)}`;
}
export function decodeSession(value:string,secret:string) {
  const [id,expiry,signature,...extra]=value.split('.');
  if(extra.length || !id || !expiry || !signature || !z.uuid().safeParse(id).success) return null;
  if(!/^\d+$/.test(expiry) || Number(expiry)<Date.now() || !sameSecret(signature,sign(`${id}.${expiry}`,secret))) return null;
  return id;
}
function signingKey() { const config=getConfig();return config.secret+'|'+config.mode+'|'+createHash('sha256').update(config.accessToken).digest('hex'); }
export function sessionCookie(request:Request,id:string) {
  const secure=new URL(request.url).protocol==='https:' ? '; Secure' : '';
  return `${cookieName}=${encodeSession(id,signingKey())}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${secure}`;
}
export async function requireSession(request:Request) {
  const raw=request.headers.get('cookie')?.split(';').map(c=>c.trim()).find(c=>c.startsWith(`${cookieName}=`))?.slice(cookieName.length+1)??'';
  const id=decodeSession(raw,signingKey());
  if(!id) throw new AppError('SESSION','Open a demo session to continue.',401);
  const [found]=await getDb().select({id:workspaces.id}).from(workspaces).where(eq(workspaces.id,id));
  if(!found) throw new AppError('SESSION','The demo session no longer exists. Open a new session.',401);
  return id;
}
export function sameOrigin(request:Request) {
  const incoming = new URL(request.url);
  // Next can use the internal bind address in request.url. Host identifies the
  // browser-facing authority; APP_ORIGIN pins it explicitly behind a proxy.
  const expected = process.env.APP_ORIGIN || `${incoming.protocol}//${request.headers.get('host') || incoming.host}`;
  const origin = request.headers.get('origin');
  try {
    if (!origin || new URL(origin).origin !== new URL(expected).origin) throw new Error('Origin mismatch');
  } catch {
    throw new AppError('ORIGIN','Cross-origin actions are not allowed.',403);
  }
}
export async function jsonBody<T>(request:Request,schema:z.ZodType<T>):Promise<T> {
  if(!request.headers.get('content-type')?.startsWith('application/json')) throw new AppError('CONTENT_TYPE','Expected an application/json request.',415);
  const reader=request.body?.getReader(); if(!reader) throw new AppError('BODY','A request body is required.');
  const chunks:Uint8Array[]=[]; let bytes=0;
  while(true) { const {done,value}=await reader.read(); if(done) break; bytes+=value.length; if(bytes>8192) {await reader.cancel();throw new AppError('BODY','Request is too large.',413);} chunks.push(value); }
  try { const text=Buffer.concat(chunks).toString('utf8'); return schema.parse(JSON.parse(text)); }
  catch { throw new AppError('VALIDATION','The request has invalid or unsupported fields.',400); }
}
export const respond = (body:unknown,status=200,headers:HeadersInit={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store',...headers}});
export function errorResponse(error:unknown) { const {message,status}=publicError(error); return respond({error:message},status); }
