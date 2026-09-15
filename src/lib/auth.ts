import {createHmac,timingSafeEqual} from 'node:crypto';

export const authCookieName='crm-auth';

function equal(supplied:string,expected:string){
  const left=Buffer.from(supplied);
  const right=Buffer.from(expected);
  return left.length===right.length&&timingSafeEqual(left,right);
}

export function passwordsMatch(supplied:string,expected:string){
  return equal(supplied,expected);
}

export function authenticationToken(password:string){
  return createHmac('sha256',password).update('agent-native-crm:demo-sign-in:v1').digest('hex');
}

export function hasValidAuthenticationToken(value:string|undefined,password:string){
  if(!value)return false;
  return equal(value,authenticationToken(password));
}
