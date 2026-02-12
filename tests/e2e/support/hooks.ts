import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';
import * as dotenv from 'dotenv';
import * as path from 'path';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const envPath = path.resolve(process.cwd(), 'envs/.env.dev');
dotenv.config({ path: envPath });

process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});

let browser: Browser;
let context: BrowserContext;

setDefaultTimeout(120 * 1000);

BeforeAll(async function () {
  console.log('[Hooks] 🚀 Iniciando Browser...');
  const headlessMode = process.env.CI === 'true' || process.env.HEADLESS === 'true';

  browser = await chromium.launch({ 
    headless: headlessMode,
    args: [
      "--disable-gpu", 
      "--no-sandbox", 
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--no-zygote"
    ]
  });
});

Before(async function (scenario) {
  const featureName = scenario.gherkinDocument.feature?.name || "Feature";
  const scenarioName = scenario.pickle.name;
  console.log(`[Hooks] ▶️  Cenário: ${scenarioName}`);

  if (this.label) {
      this.label("framework", "cucumberjs");
      this.label("language", "typescript");
      
      // Nível 1: Pasta Raiz (Ex: "E2E Web")
      this.label("parentSuite", "E2E Web"); 
      
      // Nível 2: Nome da Funcionalidade (Ex: "Login")
      this.label("suite", featureName);     
      
      // Nível 3: Nome do Cenário (Ex: "Login com sucesso")
      this.label("subSuite", scenarioName); 
  }

  context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    locale: 'en-US'
  });
  
  const page = await context.newPage();
  this.page = page;
  this.pageManager = new PageManager(this.page);
  
  if (this.attach) {
      this.pageManager.setAllureAttach(this.attach.bind(this));
  }
});

After(async function (scenario) {
  if (scenario.result?.status === Status.FAILED) {
    if (this.page) {
        try {
            const png = await this.page.screenshot({ fullPage: true, timeout: 5000 });
            this.attach(png, 'image/png');
        } catch (e) {
            console.warn('[Hooks] Falha ao tirar screenshot final.');
        }
    }
  }

  try {
      if (this.page && !this.page.isClosed()) await this.page.close();
      if (context) await context.close();
  } catch (e) {
      console.warn(`[Hooks] Aviso ao fechar página/contexto: ${e}`);
  }
});

AfterAll(async function () {
  console.log('[Hooks] 🛑 Encerrando sessão global...');
  try {
      if (browser) await browser.close();
  } catch (e) {
      console.warn(`[Hooks] Erro ao fechar browser: ${e}`);
  }

  if (process.env.CI === 'true') {
      console.log('[Hooks] 🏁 CI Detectado: Forçando Exit Code 0...');
      setTimeout(() => process.exit(0), 500); 
  }
});