'use client';
import {MessageResponse} from '@/components/ai-elements/message';
/** Non-interactive, intrinsic-height rendering for untrusted model prose. */
export function Prose({children}:{children:string}){
  return <MessageResponse mode="static" plugins={{}} controls={false} skipHtml allowedElements={['p','strong','em','ul','ol','li','blockquote','code','br']} unwrapDisallowed components={{a:({children})=><span>{children}</span>,img:()=>null}} className="agent-prose h-auto min-h-0">{children}</MessageResponse>;
}
