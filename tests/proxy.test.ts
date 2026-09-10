import { afterEach, describe, expect, test, vi } from 'vitest';
import { sameOrigin } from '@/lib/security';
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
