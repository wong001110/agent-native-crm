export const money=(value:number)=>new Intl.NumberFormat('en-MY',{style:'currency',currency:'MYR',maximumFractionDigits:0}).format(value);
export const dateLabel=(value:string)=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(value));
export const tomorrow=()=>new Date(Date.now()+86_400_000).toISOString().slice(0,10);
