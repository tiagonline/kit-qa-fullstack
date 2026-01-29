import { Before, After, BeforeAll, AfterAll, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { chromium, Browser, Page, BrowserContext } from '@playwright/test';
import * as dotenv from 'dotenv';

// Garante que as variáveis foram carregadas
dotenv.config();

// Aumento o timeout padrão para 30s (caso a net esteja lenta)
setDefaultTimeout(30 * 1000);

let browser: Browser;
let context: BrowserContext;
let page: Page;

BeforeAll(async function () {
  // Verifico se está rodando no GitHub Actions
  const isCI = process.env.CI === 'true';

  browser = await chromium.launch({ 
    // 1. Se for CI (isCI), FORÇA headless (true) e ignora o arquivo .env
    // 2. Se for Local, respeita o .env (HEADLESS !== 'false')
    headless: isCI ? true : process.env.HEADLESS !== 'false',
    
    // Argumentos de segurança
    args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"]
  });
});

// Roda 1 vez antes de CADA cenário (Cria a Aba/Página)
Before(async function () {
  context = await browser.newContext({
    baseURL: process.env.BASE_URL
  });
  
  page = await context.newPage();
  this.page = page;
});

// Roda depois de CADA cenário (Fecha a Aba e Tira Print se falhar)
After(async function (scenario) {
  // Se o teste falhou, tira um screenshot
  if (scenario.result?.status === Status.FAILED) {
    const screenshotPath = `test-results/screenshots/${scenario.pickle.name}.png`;
    await this.page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot salvo: ${screenshotPath}`);
  }
  
  await this.page.close();
  await this.context?.close();
});

// Roda 1 vez no final de tudo (Fecha o Browser)
AfterAll(async function () {
  await browser.close();
});