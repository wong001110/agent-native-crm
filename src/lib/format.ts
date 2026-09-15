export type DisplayLocale='en'|'zh';
export const money=(value:number,locale:DisplayLocale='en')=>new Intl.NumberFormat(locale==='zh'?'zh-CN':'en-MY',{style:'currency',currency:'MYR',maximumFractionDigits:0}).format(value);
export const dateLabel=(value:string,locale:DisplayLocale='en')=>new Intl.DateTimeFormat(locale==='zh'?'zh-CN':'en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value));
export const tomorrow=()=>new Date(Date.now()+86_400_000).toISOString().slice(0,10);
