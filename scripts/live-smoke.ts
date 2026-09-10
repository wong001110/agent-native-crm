import {randomUUID} from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {DemoStore} from '../src/lib/demo-store';
import {PostgresStore} from '../src/lib/db/postgres-store';
import {runAgent,liveModel} from '../src/lib/agent/run';

// Explicit opt-in: this script makes paid network calls. Never substitutes a mock.
if(process.env.AGENT_MODE!=='live')throw new Error('Set AGENT_MODE=live explicitly before running the live smoke test.');
liveModel(); // Fail on missing provider configuration before creating test artifacts.
if(process.env.DB_MODE==='postgres'&&!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required for PostgreSQL mode.');
const db=process.env.DB_MODE==='postgres'?new PostgresStore(process.env.DATABASE_URL!):new DemoStore(process.env.DEMO_DATA_FILE||'.data/live-smoke-crm.json');
const session=randomUUID();
let commit='unknown';try{commit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
const checks=[{prompt:'What should I focus on today?',expected:'focus'},{prompt:'What happened with ACME?',expected:'investigation'},{prompt:'Compare ACME and Nova.',expected:'comparison'}];
const results=[];
try{
  for(const check of checks){
    const run=await runAgent(db,session,{prompt:check.prompt},{mode:'live'});
    const passed=run.status==='succeeded'&&run.workspace?.type===check.expected&&run.events.some(e=>e.status==='succeeded'&&e.tool!=='get_crm_summary');
    results.push({prompt:check.prompt,expected:check.expected,actual:run.workspace?.type??null,passed,runId:run.id,model:run.model,status:run.status,usage:run.usage,error:run.error});
    console.log(`${passed?'PASS':'FAIL'} ${check.expected}: ${run.id}`);
  }
  await mkdir('.data',{recursive:true});
  const path=`.data/live-smoke-${Date.now()}.json`;
  await writeFile(path,JSON.stringify({commit,testedAt:new Date().toISOString(),mode:'live',dataset:'fictional CRM seed',checks:results,limitations:'Schema/tool compatibility smoke test only; does not certify business judgment, resistance to injection, or production readiness.'},null,2),{mode:0o600});
  console.log(`Evidence saved to ${path}. Review interpretations and evidence manually as well.`);
  if(results.some(r=>!r.passed))process.exitCode=1;
}finally{if(db instanceof PostgresStore)await db.close();}
