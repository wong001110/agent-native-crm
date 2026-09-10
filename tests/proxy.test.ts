import { afterEach, describe, expect, test, vi } from 'vitest';
import { getConfig } from '@/lib/config';
import { sameOrigin,sessionCookie } from '@/lib/security';
afterEach(()=>vi.unstubAllEnvs());
describe('P4-R3-C1: browser-facing origin behind an internal bind address',()=>{
  test('accepts matching browser origin and Host without trusting an unrelated origin',()=>{
    const request=(origin:string)=>new Request('http://0.0.0.0:3000/api/session',{headers:{host:'127.0.0.1:3000',origin}});
    expect(()=>sameOrigin(request('http://127.0.0.1:3000'))).not.toThrow();
    expect(()=>sameOrigin(request('https://attacker.example'))).toThrow();
    expect(()=>sameOrigin(request('null'))).toThrow();
  });
  test('an explicitly configured public origin is authoritative',()=>{
    vi.stubEnv('APP_ORIGIN','https://crm.example');
    expect(()=>sameOrigin(new Request('http://internal:3000',{headers:{host:'internal:3000',origin:'https://crm.example'}}))).not.toThrow();
    expect(()=>sameOrigin(new Request('http://internal:3000',{headers:{host:'attacker.example',origin:'https://attacker.example'}}))).toThrow();
  });
});
test('P1-R3-C1: model credential failure does not disable deterministic Explore configuration',()=>{
  const env={AGENT_MODE:'live',DEMO_ACCESS_TOKEN:'private-demo',SESSION_SECRET:'x'.repeat(32)};
  expect(()=>getConfig(env)).toThrow();
  expect(getConfig(env,false).mode).toBe('live');
});
test('P4-R3-C2: production fixture mode also requires private access protection',()=>{
  expect(()=>getConfig({AGENT_MODE:'mock',NODE_ENV:'production',SESSION_SECRET:'x'.repeat(32)})).toThrow('DEMO_ACCESS_TOKEN');
});
test('P4-R3-C1: HTTPS public origin produces a Secure cookie behind an HTTP proxy',()=>{
  vi.stubEnv('APP_ORIGIN','https://crm.example');
  expect(sessionCookie(new Request('http://internal:3000'), '00000000-0000-4000-8000-000000000000')).toContain('; Secure');
});
