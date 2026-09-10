import type {Snapshot,AgentRun,Proposal,Task} from './contracts';
export interface Store {
  snapshot(sessionId:string):Promise<Snapshot>;
  saveRun(run:AgentRun):Promise<void>;
  getRun(id:string,sessionId:string):Promise<AgentRun|null>;
  listRuns(sessionId:string):Promise<AgentRun[]>;
  saveProposal(proposal:Proposal):Promise<void>;
  getProposal(id:string,sessionId:string):Promise<Proposal|null>;
  approve(id:string,sessionId:string):Promise<Task>;
  reject(id:string,sessionId:string):Promise<Proposal>;
}
