import {expect,test} from '@playwright/test';

test.describe.configure({mode:'serial'});
test.use({video:'on',screenshot:'on',trace:'on'});

test('records ten live CRM workspaces without approving an action',async({page},info)=>{
  test.skip(process.env.RECORD_LIVE!=='1','Set RECORD_LIVE=1 to send the fictional CRM seed to the configured live model.');
  test.setTimeout(8*60_000);
  const outcomes:{prompt:string;workspace:boolean;error:boolean}[]=[];
  await page.goto('/');
  const passwordInput=page.getByLabel('Workspace password');
  if(await passwordInput.isVisible()){
    if(!process.env.APP_PASSWORD)throw new Error('APP_PASSWORD is required only for this local recording run.');
    await passwordInput.fill(process.env.APP_PASSWORD);
    await page.getByRole('button',{name:'Sign in'}).click();
  }
  await expect(page.getByRole('button',{name:'Ask CRM'})).toBeVisible();
  await page.getByRole('button',{name:'Ask CRM'}).click();
  const prompts=[
    'What should I focus on today?',
    'What happened with ACME?',
    'Compare ACME and Nova.',
    'What changed recently for Nova?',
    'Investigate Atlas and summarize the recorded risks.',
    'Which deals close this week and need attention?',
    'What is the next source-backed step for Harbor?',
    'Compare ACME, Nova, and Atlas.',
    'Prepare a follow-up task for ACME, but do not create it.',
    '请比较 ACME 和 Nova 的成交风险，并只引用 CRM 记录。',
  ];
  for(const [index,prompt] of prompts.entries()){
    const input=page.getByLabel('What would you like to move forward?');
    if(!await input.isVisible()){
      await page.getByRole('button',{name:'Ask CRM'}).click();
      await expect(input).toBeVisible();
    }
    await expect(input).toBeEnabled({timeout:15_000});
    const chat=page.getByRole('complementary',{name:'CRM assistant'});
    const assistantMessages=chat.locator('.floating-agent-message.assistant');
    const previousAssistantMessages=await assistantMessages.count();
    console.log(`[live-recording] case ${index+1}/${prompts.length} started`);
    await input.fill(prompt);
    await page.getByRole('button',{name:'Run request'}).click();
    await expect(chat.locator('.floating-agent-message.user').last()).toContainText(prompt,{timeout:5_000});
    await expect(assistantMessages).toHaveCount(previousAssistantMessages+1,{timeout:90_000});
    const terminal=page.locator('.run-notice, .notice.error');
    await expect(terminal).toBeVisible({timeout:5_000});
    const error=await page.locator('.notice.error').count()>0;
    const workspace=await page.locator('.run-notice').count()>0;
    outcomes.push({prompt,workspace,error});
    await page.screenshot({path:info.outputPath(`${outcomes.length}-${error?'error':'workspace'}.png`),fullPage:true});
    await expect(input).toBeEnabled({timeout:15_000});
    console.log(`[live-recording] case ${index+1}/${prompts.length} ${error?'error':'workspace'}`);
    if(index===7){
      console.log('[live-recording] starting a fresh authenticated session for cases 9-10 to respect the per-session request limit');
      await page.context().clearCookies({name:'crm-session'});
      await page.goto('/');
      await expect(page.getByRole('button',{name:'Ask CRM'})).toBeVisible();
    }
  }
  await info.attach('live-recording-outcomes',{body:JSON.stringify(outcomes,null,2),contentType:'application/json'});
});
