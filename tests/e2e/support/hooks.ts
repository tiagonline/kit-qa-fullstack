import { Before, After, BeforeAll, AfterAll, Status } from '@cucumber/cucumber';
import { chromium, Browser, Page } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';
import { ICustomWorld } from './world';

let browser: Browser;

BeforeAll(async function () {
  browser = await chromium.launch({ 
    headless: process.env.HEADLESS !== 'false',
    args: ['--no-sandbox']
  });
});

// "this: ICustomWorld" nos parâmetros da função
Before(async function (this: ICustomWorld) {
  this.context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: 'test-results/videos' }
  });
  
  this.page = await this.context.newPage();
  
  // Instancio o Manager e anexo ao "this" tipado
  this.pageManager = new PageManager(this.page);
});

After(async function (this: ICustomWorld, scenario) {
  if (scenario.result?.status === Status.FAILED) {
    const screenshotPath = `./test-results/screenshots/${scenario.pickle.name}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.attach(await this.page.screenshot(), 'image/png'); // Anexa ao relatório Allure/Cucumber
  }

  await this.page.close();
  await this.context.close();
});

AfterAll(async function () {
  await browser.close();
});