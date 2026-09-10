import type { Snapshot, Deal, Customer, Activity } from './contracts';
export const DATASET_AS_OF='2026-09-11T01:00:00.000Z';
export function seedSnapshot():Snapshot {
  const entries:[string,string,string,number,Deal['stage'],string][]=[
    ['acme','ACME','Enterprise software',82000,'Proposal','Platform rollout'],
    ['nova','Nova','Retail technology',65000,'Negotiation','Regional expansion'],
    ['atlas','Atlas','Logistics',41000,'Proposal','Operations workspace'],
    ['lumen','Lumen','Energy',28000,'Discovery','Customer portal'],
    ['orbit','Orbit','Professional services',56000,'Qualified','Team collaboration'],
    ['evergreen','Evergreen','Manufacturing',37000,'Proposal','Partner enablement'],
    ['mosaic','Mosaic','Creative services',19000,'Discovery','Studio operations'],
    ['harbor','Harbor','Financial technology',73000,'Qualified','Account intelligence'],
    ['cedar','Cedar','Education',31000,'Negotiation','Campus engagement'],
    ['vertex','Vertex','Engineering',22000,'Discovery','Project handover'],
    ['bloom','Bloom','Consumer products',47000,'Proposal','Distributor network'],
    ['summit','Summit','Travel technology',34000,'Qualified','Customer success'],
  ];
  const customers:Customer[]=entries.map(([id,name,industry],i)=>({id,name,industry,contact:['Sarah Chen','Daniel Tan','Amira Lee'][i%3],email:`contact@${id}.example`}));
  const deals:Deal[]=entries.map(([id,, ,value,stage,name],i)=>({id:`deal-${id}`,customerId:id,name,value,stage,owner:i%2?'Alex Tan':'Jamie Wong',closeDate:`2026-09-${String(18+i).padStart(2,'0')}`}));
  const activities:Activity[]=entries.flatMap(([id,name],i)=>[
    {id:`act-${id}-01`,dealId:`deal-${id}`,at:`2026-09-${String(1+i%5).padStart(2,'0')}T02:00:00.000Z`,kind:'meeting' as const,text:`${name} completed a discovery meeting. Scope and stakeholders were recorded.`,sessionId:null},
    {id:`act-${id}-02`,dealId:`deal-${id}`,at:`2026-09-${String(6+i%4).padStart(2,'0')}T03:00:00.000Z`,kind:'note' as const,text:`Account owner is collecting requirements for the next discussion.`,sessionId:null},
  ]);
  const special:Record<string,Partial<Activity>>={
    'act-acme-01':{at:'2026-09-02T02:00:00.000Z',kind:'email',text:'Sarah asked three security questions about encryption, access control, and data residency. No answers are recorded.'},
    'act-acme-02':{at:'2026-09-10T03:00:00.000Z',kind:'note',text:'Proposal was viewed again. The account owner has not recorded a customer reply since September 2.'},
    'act-nova-01':{at:'2026-09-09T02:00:00.000Z',kind:'meeting',text:'Daniel confirmed the budget and requested procurement next steps.'},
    'act-nova-02':{at:'2026-09-10T03:00:00.000Z',kind:'email',text:'Procurement contact joined the discussion and asked to review the implementation timeline.'},
    'act-atlas-02':{text:'The planned decision date is approaching. The customer has not yet confirmed the budget owner.'},
  };
  return {customers,deals,activities:activities.map(a=>({...a,...special[a.id]})),tasks:[]};
}
