import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function openHome(page:Page){
  await page.goto('/');
  await expect(page.getByRole('button',{name:'Review today’s priorities'})).toBeVisible();
}
async function ask(page:Page,prompt:string){
  await page.getByLabel('What would you like to move forward?').fill(prompt);
  await page.getByRole('button',{name:'Run request'}).click();
  await expect(page.getByRole('status').filter({hasText:'Workspace ready'})).toBeVisible();
}

test('Today shows real totals and a clearly labelled scripted adapter',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await openHome(page);
  await expect(page.getByTestId('mode-badge')).toHaveText('Scripted demo');
  await expect(page.getByLabel('CRM overview')).toContainText('535,000');
  await expect(page.getByLabel('CRM overview')).toContainText('12');
  await page.screenshot({path:info.outputPath('today-desktop.png'),fullPage:true});
  expect(errors).toEqual([]);
});

test('canonical flow: focus -> investigate -> propose -> approve -> persisted task',async({page},info)=>{
  await openHome(page);
  await page.getByRole('button',{name:'Review today’s priorities'}).click();
  await expect(page.getByTestId('scope')).toContainText('12 / 12');
  await expect(page.getByRole('heading',{name:'ACME',exact:true})).toBeVisible();
  await page.screenshot({path:info.outputPath('focus-desktop.png'),fullPage:true});
  await page.getByRole('button',{name:'Investigate ACME',exact:true}).click();
  await expect(page.getByRole('heading',{name:'What the records show'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Supporting evidence'})).toBeVisible();
  await page.getByRole('button',{name:'Prepare follow-up task'}).click();
  await expect(page.getByRole('button',{name:'Approve & create task'})).toBeVisible();
  const before=await (await page.request.get('/api/crm')).json();
  expect(before.snapshot.tasks).toHaveLength(0);
  await page.screenshot({path:info.outputPath('approval-desktop.png'),fullPage:true});
  await page.getByRole('button',{name:'Approve & create task'}).click();
  await expect(page.getByText('Task created and stored.')).toBeVisible();
  await page.getByRole('link',{name:'View in Explore'}).click();
  await expect(page.getByRole('cell',{name:'Follow up on outstanding questions',exact:false})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('cell',{name:'Follow up on outstanding questions',exact:false})).toBeVisible();
  const after=await (await page.request.get('/api/crm')).json();
  expect(after.snapshot.tasks).toHaveLength(1);
});

test('comparison is source-backed and addressable after reload',async({page},info)=>{
  await openHome(page);await page.getByRole('button',{name:'Compare accounts'}).click();
  await expect(page.getByRole('heading',{name:'Account comparison'})).toBeVisible();
  await expect(page.getByRole('table')).toContainText('82,000');
  await expect(page.getByRole('table')).toContainText('65,000');
  await expect(page).toHaveURL(/workspace\?run=/);
  await page.reload();
  await expect(page.getByRole('heading',{name:'Account comparison'})).toBeVisible();
  await page.screenshot({path:info.outputPath('comparison.png'),fullPage:true});
});

test('Explore supports source lookup, pipeline and a manual task without a model',async({page})=>{
  await openHome(page);
  await page.getByRole('link',{name:'Explore',exact:true}).click();
  await page.getByRole('button',{name:'Pipeline',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Proposal'})).toBeVisible();
  await page.getByRole('button',{name:'New task'}).click();
  await page.getByLabel('Task title').fill('Manually clarify next steps');
  await page.getByLabel('Context',{exact:true}).fill('Created through the fallback path.');
  await page.getByRole('button',{name:'Review task proposal'}).click();
  await page.getByRole('button',{name:'Approve & create task'}).click();
  await page.getByRole('link',{name:'View in Explore'}).click();
  await expect(page.getByRole('cell',{name:'Manually clarify next steps',exact:false})).toBeVisible();
});

test('rejection does not create a task',async({page})=>{
  await openHome(page);await ask(page,'Create a follow-up task for ACME.');
  await page.getByRole('button',{name:'Reject',exact:true}).click();
  await expect(page.getByText('Proposal rejected. No task was created.')).toBeVisible();
  const data=await (await page.request.get('/api/crm')).json();expect(data.snapshot.tasks).toHaveLength(0);
});

test('unsupported demo input gives an honest empty state',async({page})=>{
  await openHome(page);await ask(page,'Write a poem');
  await expect(page.getByRole('heading',{name:'No matching analysis to display.'})).toBeVisible();
  await expect(page.getByText('Scripted mode supports',{exact:false})).toBeVisible();
});

test('request failure preserves the manual fallback',async({page})=>{
  await openHome(page);
  await page.route('**/api/agent',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Test provider unavailable. No fallback substituted.'})}));
  await page.getByRole('button',{name:'Investigate ACME',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('provider unavailable');
  await page.getByRole('link',{name:'Continue in Explore'}).click();
  await expect(page.getByRole('cell',{name:'ACME',exact:false}).first()).toBeVisible();
});

test('stop is available during a long-running request',async({page})=>{
  await openHome(page);
  await page.route('**/api/agent',async route=>{
    await new Promise(r=>setTimeout(r,1200));
    await route.fulfill({status:200,contentType:'application/x-ndjson',body:'{"type":"error","message":"Delayed fixture"}\n'}).catch(()=>{});
  });
  await page.getByRole('button',{name:'Investigate ACME',exact:true}).click();
  await page.getByRole('button',{name:'Stop run'}).click();
  await expect(page.getByRole('status').filter({hasText:'Run stopped'})).toBeVisible();
});

test('origin enforcement and session isolation protect approvals',async({page,browser})=>{
  await openHome(page);
  const cross=await page.request.post('/api/actions',{headers:{Origin:'https://not-this-app.example'},data:{intent:'prepare',draft:{dealId:'deal-acme',title:'Blocked cross origin',note:'test',dueDate:'2026-09-12'}}});
  expect(cross.status()).toBe(403);
  const prepared=await page.request.post('/api/actions',{headers:{Origin:'http://127.0.0.1:3000'},data:{intent:'prepare',draft:{dealId:'deal-acme',title:'Private proposed action',note:'test',dueDate:'2026-09-12'}}});
  expect(prepared.ok()).toBeTruthy();const {proposal}=await prepared.json();
  const other=await browser.newContext({baseURL:'http://127.0.0.1:3000',httpCredentials:process.env.APP_PASSWORD?{username:'demo',password:process.env.APP_PASSWORD}:undefined});
  await other.request.get('/api/crm');
  const denied=await other.request.post('/api/actions',{headers:{Origin:'http://127.0.0.1:3000'},data:{intent:'approve',proposalId:proposal.id}});
  expect(denied.status()).toBe(404);await other.close();
});

test('keyboard shortcut and core accessibility scan',async({page})=>{
  await openHome(page);await page.keyboard.press('Control+k');
  await expect(page.getByLabel('What would you like to move forward?')).toBeFocused();
  const home=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(home.violations).toEqual([]);
  await page.getByRole('button',{name:'Investigate ACME',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Supporting evidence'})).toBeVisible();
  const workspace=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(workspace.violations).toEqual([]);
});

test('narrow viewport retains navigation and contains table overflow',async({page},info)=>{
  await page.setViewportSize({width:390,height:844});await openHome(page);
  await expect(page.getByRole('link',{name:'Explore',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('today-mobile.png'),fullPage:true});
  await page.getByRole('button',{name:'Compare accounts'}).click();
  await expect(page.getByRole('heading',{name:'Account comparison'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.screenshot({path:info.outputPath('comparison-mobile.png'),fullPage:true});
});
