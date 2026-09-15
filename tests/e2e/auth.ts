import {expect,type Page} from '@playwright/test';

export async function authenticate(page:Page,path='/'){
  await page.goto(path);
  const password=page.getByLabel('Workspace password');
  if(!await password.isVisible())return;
  const value=process.env.APP_PASSWORD;
  if(!value)throw new Error('APP_PASSWORD is required when password protection is enabled.');
  await password.fill(value);
  await page.getByRole('button',{name:'Sign in'}).click();
  await expect(page).not.toHaveURL(/\/login/);
}
