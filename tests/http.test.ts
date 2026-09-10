import {afterEach,describe,expect,it,vi} from 'vitest';
import {sameOrigin,readJson,sessionOf,acquireRun,errorResponse} from '../src/lib/http';
import {actionRequestSchema} from '../src/lib/contracts';
import {proxy} from '../src/proxy';
import {NextRequest} from 'next/server';
afterEach(()=>vi.unstubAllEnvs());
describe('request and credential boundaries',()=>{
  it('rejects missing or untrusted origin',()=>{vi.stubEnv('APP_ORIGIN','http://localhost:3000');expect(()=>sameOrigin(new Request('http://localhost:3000/api/actions',{method:'POST'}))).toThrow('Cross-origin');expect(()=>sameOrigin(new Request('http://localhost:3000/api/actions',{headers:{Origin:'https://attacker.example'}}))).toThrow('Cross-origin');expect(()=>sameOrigin(new Request('http://localhost:3000/api/actions',{headers:{Origin:'http://localhost:3000'}}))).not.toThrow();});
  it('bounds JSON bodies even without Content-Length',async()=>{await expect(readJson(new Request('http://localhost/api',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:'x'.repeat(9000)})}))).rejects.toThrow('too large');});
  it('rejects malformed JSON and non-JSON input',async()=>{await expect(readJson(new Request('http://localhost/api',{method:'POST',headers:{'Content-Type':'application/json'},body:'{bad'}))).rejects.toThrow('not valid JSON');await expect(readJson(new Request('http://localhost/api',{method:'POST',body:'hello'}))).rejects.toThrow('application/json');});
  it('accepts only proposal IDs at the execution endpoint',()=>{expect(actionRequestSchema.safeParse({intent:'approve',proposalId:'d03c7422-a3fb-422c-a1cb-591ea2c9f380',draft:{title:'tampered'}}).success).toBe(false);});
  it('requires an internal session identity',()=>{expect(()=>sessionOf(new Request('http://localhost'))).toThrow('Reload');});
  it('does not expose raw provider or database secrets in errors',async()=>{const response=errorResponse(new Error('Database password: secret-token'));expect(JSON.stringify(await response.json())).not.toContain('secret-token');});
  it('requires authentication when a password is configured',()=>{vi.stubEnv('APP_PASSWORD','test-only-password');const response=proxy(new NextRequest('http://localhost:3000'));expect(response.status).toBe(401);expect(response.headers.get('WWW-Authenticate')).toContain('Basic');});
  it('fails closed for production live mode without an access password',()=>{vi.stubEnv('NODE_ENV','production');vi.stubEnv('AGENT_MODE','live');vi.stubEnv('APP_PASSWORD','');expect(proxy(new NextRequest('http://localhost:3000')).status).toBe(503);});
  it('overwrites a spoofed internal session header',()=>{vi.stubEnv('APP_PASSWORD','');vi.stubEnv('AGENT_MODE','mock');vi.stubEnv('DB_MODE','demo');const response=proxy(new NextRequest('http://localhost:3000',{headers:{'x-crm-session':'forged'}}));expect(response.headers.get('x-middleware-request-x-crm-session')).toMatch(/^[a-f0-9]{64}$/);expect(response.cookies.get('crm-session')?.httpOnly).toBe(true);});
  it('does not admit concurrent runs for the same session',()=>{const release=acquireRun('rate-limit-test');expect(()=>acquireRun('rate-limit-test')).toThrow('Too many');release();const next=acquireRun('rate-limit-test');next();});
});
