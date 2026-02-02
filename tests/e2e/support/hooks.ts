import { Before, After, BeforeAll, AfterAll, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { chromium, Browser, Page, BrowserContext } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 👇 O PULO DO GATO: Carrega as variáveis do arquivo envs/.env.dev
dotenv.config({ path: path.resolve(process.cwd(), 'envs/.env.dev') });

console.log('BASE_URL carregada:', process.env.BASE_URL);
console.log('USUARIO carregado:', process.env.SAUCE_USERNAME);

let browser: Browser;
let context: BrowserContext;
let page: Page;

BeforeAll(async function () {
  // Se estiver no CI, roda headless. Se local, respeita a variável ou abre o navegador.
  const headlessMode = process.env.CI === 'true' || process.env.HEADLESS === 'true';

  browser = await chromium.launch({ 
    headless: headlessMode,
    args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"]
  });
});

Before(async function () {
  context = await browser.newContext({
    baseURL: process.env.BASE_URL, // Lê do .env.dev
    ignoreHTTPSErrors: true // 🔓 Destrava o acesso na rede corporativa
  });
  
  page = await context.newPage();
  this.page = page;
  
  // 🏗️ Inicializa o Page Objects para os testes usarem
  this.pageManager = new PageManager(this.page);
});

After(async function (scenario) {
  if (scenario.result?.status === Status.FAILED) {
    const scenarioName = scenario.pickle.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const screenshotPath = `test-results/screenshots/${scenarioName}.png`;
    
    if (this.page) {
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        this.attach(await this.page.screenshot(), 'image/png');
        console.log(`📸 Screenshot salvo: ${screenshotPath}`);
    }
  }

  if (this.page) await this.page.close();
  if (this.context) await this.context.close();
});

AfterAll(async function () {
  if (browser) await browser.close();
});