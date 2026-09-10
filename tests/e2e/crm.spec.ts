import { test,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async({page})=>{await page.goto('/');await expect(page.getByRole('heading',{name:'What deserves your attention?'})).toBeVisible();});
test('P4-R2-C1: focus → investigation → approval → persisted task',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.getByRole('button',{name:'Review my priorities'}).click();
  await expect(page.getByRole('region',{name:'focus workspace'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'ACME Industries',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Investigate',exact:true}).first().click();
  await expect(page.getByRole('region',{name:'investigation workspace'})).toBeVisible();
  await expect(page.getByText('How we got here')).toBeVisible();
  await page.getByRole('button',{name:'Prepare follow-up',exact:true}).click();
  await expect(page.getByRole('region',{name:'Task approval'})).toBeVisible();
  await expect(page.getByText('Nothing changes until you approve.',{exact:false})).toBeVisible();
  await page.getByRole('button',{name:'Approve & create task'}).click();
  await expect(page.getByRole('heading',{name:'Follow-up task created'})).toBeVisible();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.screenshot({path:'test-results/approval-desktop.png',fullPage:true});
  await page.getByRole('button',{name:'Explore',exact:true}).click();
  await page.getByRole('button',{name:'Tasks',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Follow up on ACME Industries: clarify next steps'})).toBeVisible();
  await page.reload();await expect(page.getByRole('heading',{name:'Follow up on ACME Industries: clarify next steps'})).toBeVisible();
  expect(errors).toEqual([]);
});
test('P3-R1-C1 / P1-R3-C2: comparison and source navigation',async({page})=>{
  await page.getByRole('button',{name:'Compare two deals'}).click();await expect(page.getByRole('region',{name:'comparison workspace'})).toBeVisible();
  await expect(page.getByRole('cell',{name:/82,000/})).toBeVisible();
  await page.getByRole('button',{name:'ACME Industries',exact:true}).click();
  await expect(page.getByText('Showing ACME Industries')).toBeVisible();
  await page.getByRole('button',{name:'Activity',exact:true}).click();await expect(page.getByText('acme-security',{exact:true})).toBeVisible();
});
test('P1-R3-C1: all Explore data categories and manual path',async({page})=>{
  await page.getByRole('button',{name:'Explore',exact:true}).click();
  for(const category of ['Customers','Activities','Tasks','Pipeline','Deals']){await page.getByRole('button',{name:category,exact:true}).click();}
  await page.getByText('New follow-up without the agent', {exact:false}).click();
  await page.getByLabel('Task title',{exact:true}).fill('Manual follow-up from Explore');
  await page.getByRole('button',{name:'Review task proposal'}).click();
  await page.getByRole('button',{name:'Approve & create task'}).click();await expect(page.getByText('Follow-up task created',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Tasks',exact:true}).click();await expect(page.getByRole('heading',{name:'Manual follow-up from Explore'})).toBeVisible();
});
test('P4-R1-C1: rejection changes no CRM tasks',async({page})=>{
  await page.getByRole('button',{name:'Investigate ACME',exact:true}).click();await page.getByRole('button',{name:'Prepare follow-up',exact:true}).click();
  await page.getByRole('button',{name:'Reject',exact:true}).click();await expect(page.getByRole('heading',{name:'Proposal rejected'})).toBeVisible();
  await page.getByRole('button',{name:'Explore',exact:true}).click();await page.getByRole('button',{name:'Tasks',exact:true}).click();await expect(page.getByText('1 of 1 tasks')).toBeVisible();
});
test('P3-R2-C2: empty result and recoverable fixture limitation',async({page})=>{
  await page.getByLabel('What would you like to do?').fill('Show deals over RM1,000,000');await page.getByRole('button',{name:'Build workspace'}).click();await expect(page.getByRole('heading',{name:'No matching deals'})).toBeVisible();
  await page.getByLabel('What would you like to do?').fill('Write a poem');await page.getByRole('button',{name:'Build workspace'}).click();await expect(page.getByRole('alert').filter({hasText:'That operation did not complete.'})).toContainText('Fixture mode supports');await expect(page.getByRole('heading',{name:'No matching deals'})).toBeVisible();
  await page.getByRole('button',{name:'Continue in Explore'}).click();await expect(page.getByText('8 of 8 deals')).toBeVisible();
});
test('P4-R4-C1 / P4-R4-C2: keyboard, responsive layout and accessibility',async({page})=>{
  await page.keyboard.press('Control+k');await expect(page.getByLabel('What would you like to do?')).toBeFocused();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.screenshot({path:'test-results/today-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-results/today-mobile.png',fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Investigate ACME',exact:true}).click();await expect(page.getByRole('region',{name:'investigation workspace'})).toBeVisible();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.screenshot({path:'test-results/investigation-mobile.png',fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Explore',exact:true}).click();await page.getByRole('button',{name:'Pipeline',exact:true}).click();
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  await page.screenshot({path:'test-results/explore-mobile.png',fullPage:true});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test('P4-R3-C1: action endpoint denies missing session and cross-origin request',async({page,request})=>{
  const response=await request.post('/api/actions',{headers:{origin:'https://other.example'},data:{proposalId:'00000000-0000-4000-8000-000000000000',decision:'approve'}});expect(response.status()).toBe(403);
  const isolated=await request.get('/api/state');expect(isolated.status()).toBe(401);
  await expect(page.getByText('Interactive fixture demo.',{exact:true})).toBeVisible();
});
