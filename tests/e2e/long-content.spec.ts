import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('maximum-length proposal stays readable and keyboard-operable on mobile',async({page},info)=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/explore');
  await page.getByRole('button',{name:'New task',exact:true}).click();
  const title='CustomerFollowUp'.repeat(10).slice(0,140);
  const note='Context'.repeat(115).slice(0,800);
  await page.getByLabel('Task title').fill(title);
  await page.getByLabel('Context',{exact:true}).fill(note);
  await page.getByRole('button',{name:'Review task proposal'}).click();
  const proposal=page.getByRole('region',{name:'Proposed follow-up task'});
  await expect(proposal.getByRole('heading',{name:title,exact:true})).toBeVisible();
  await expect(proposal).toContainText(note);
  await expect(proposal.getByRole('button',{name:'Approve & create task'})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  const before=await (await page.request.get('/api/crm')).json();
  expect(before.snapshot.tasks).toHaveLength(0);
  const accessibility=await new AxeBuilder({page}).include('.manual-task').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.screenshot({path:info.outputPath('maximum-content-mobile.png'),fullPage:true});
  const reject=proposal.getByRole('button',{name:'Reject',exact:true});
  await reject.focus();await expect(reject).toBeFocused();await page.keyboard.press('Enter');
  await expect(proposal.getByText('Proposal rejected. No task was created.')).toBeVisible();
  const after=await (await page.request.get('/api/crm')).json();
  expect(after.snapshot.tasks).toHaveLength(0);
});
