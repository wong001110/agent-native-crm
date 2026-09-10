import { test,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('source records remain inspectable without a model',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/');await expect(page.getByRole('heading',{name:'Your next move, in context.'})).toBeVisible();
  await page.getByRole('navigation',{name:'Primary'}).getByRole('link',{name:'Explore'}).click();
  await expect(page.getByRole('heading',{name:'The full picture.'})).toBeVisible();
  await page.getByRole('link',{name:'Open ACME record'}).click();
  await expect(page.getByRole('heading',{name:'ACME · Security platform'})).toBeVisible();
  await expect(page.getByText('Security team asked for three clarifications. No answer is recorded.')).toBeVisible();
  expect(errors).toEqual([]);
});
test('core navigation, keyboard and narrow screen',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/explore?tab=tasks');
  await expect(page.getByRole('link',{name:'Workspace',exact:true})).toBeVisible();
  await expect(page.getByText('Prepare requirements workshop')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  const report=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(report.violations).toEqual([]);
});
