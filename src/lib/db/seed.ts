import type { Snapshot } from './schema';
export function seedData(now = new Date().toISOString()): Snapshot {
  const day = (offset: number) => new Date(new Date(now).getTime() + offset * 86400000).toISOString();
  const entries = [
    ['acme','ACME','Infrastructure','Security platform',82000,'Proposal',14],
    ['nova','Nova','Retail','Customer analytics',65000,'Negotiation',7],
    ['lumen','Lumen','Healthcare','Service workspace',48000,'Discovery',30],
    ['orbit','Orbit','Logistics','Operations rollout',36000,'Proposal',20],
    ['atlas','Atlas','Manufacturing','Regional expansion',92000,'Proposal',5],
    ['forma','Forma','Design','Team workspace',28000,'Discovery',35],
    ['cobalt','Cobalt','Finance','Workflow automation',54000,'Negotiation',12],
    ['solstice','Solstice','Education','Learning platform',31000,'Won',-3],
  ] as const;
  const signals = [
    ['acme','email','Security team asked for three clarifications. No answer is recorded.',-8],
    ['acme','signal','Proposal opened again; security questionnaire remains unresolved.',-1],
    ['acme','meeting','Buyer confirmed project budget and requested a security review.',-12],
    ['nova','meeting','Buyer accepted pricing and introduced the procurement contact.',-1],
    ['nova','email','Procurement requested next steps for the agreement.',0],
    ['lumen','meeting','Discovery completed. Requirements workshop is scheduled.',-2],
    ['orbit','email','Proposal received. Buyer will discuss internally next week.',-3],
    ['atlas','note','No response to the revised proposal; close date is approaching.',-13],
    ['forma','meeting','Initial conversation. Budget has not been confirmed.',-4],
    ['cobalt','email','Legal review is in progress; no further questions at present.',-2],
    ['solstice','note','Agreement signed. Handover is complete.',-3],
  ] as const;
  return {
    customers: entries.map(([id,name,industry]) => ({id: `customer-${id}`, name, industry, owner:'Alex Morgan', email:`team@${id}.example`})),
    deals: entries.map(([id,, ,name,value,stage,close]) => ({id,customerId:`customer-${id}`,name,value,stage,closeDate:day(close).slice(0,10),updatedAt:day(-1)})),
    activities: signals.map(([dealId,kind,summary,offset],i) => ({id:`activity-${i+1}`,dealId,kind,summary,occurredAt:day(offset)})),
    tasks:[{id:'task-seed-1',dealId:'lumen',title:'Prepare requirements workshop',dueDate:day(2).slice(0,10),status:'open',createdAt:now,actionId:null}],
    asOf:now,retrievedAt:now,
  };
}
