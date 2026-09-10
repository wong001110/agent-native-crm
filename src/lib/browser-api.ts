export class HttpError extends Error {constructor(message:string,public status:number){super(message);}}
export async function api<T>(path:string,body?:unknown,signal?:AbortSignal):Promise<T>{
  const response=await fetch(path,{method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',headers:body===undefined?undefined:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal});
  const data=await response.json();
  if(!response.ok)throw new HttpError(data.error??'The request did not complete.',response.status);
  return data as T;
}
