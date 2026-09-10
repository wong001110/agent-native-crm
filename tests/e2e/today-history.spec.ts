import {test,expect} from '@playwright/test';
test('Today restores saved situations without calling the model on load',async({page},info)=>{
  await page.goto('/');await page.getByRole('button',{name:'Review today’s priorities'}).click();await expect(page.getByTestId('scope')).toContainText('12 / 12');
  await page.getByRole('link',{name:'Today',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Your latest focus'})).toBeVisible();
  const focus=page.getByRole('region',{name:'Latest saved focus'});
  await expect(focus).toContainText('ACME');await expect(focus).toContainText('Not a live prediction');
  let modelCalls=0;page.on('request',r=>{if(r.url().endsWith('/api/agent'))modelCalls++;});
  await page.reload();await expect(page.getByRole('heading',{name:'Your latest focus'})).toBeVisible();expect(modelCalls).toBe(0);
  await page.screenshot({path:info.outputPath('today-with-saved-focus.png'),fullPage:true});
});
