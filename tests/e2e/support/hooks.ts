// Forçamos a aceitação de certificados
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Carrega .env
const envPath = path.resolve(process.cwd(), 'envs/.env.dev');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

let browser: Browser;
let context: BrowserContext;

// Timeout global de 2 minutos
setDefaultTimeout(120 * 1000);

BeforeAll(async function () {
  const headlessMode = process.env.CI === 'true' || process.env.HEADLESS === 'true';

  browser = await chromium.launch({ 
    headless: headlessMode,
    args: [
      "--disable-gpu", 
      "--no-sandbox", 
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--no-zygote",
      "--disable-features=Translate,TranslateUI,OptimizationHints,MediaRouter",
      "--disable-extensions",
      "--lang=en-US"
    ]
  });
});

Before(async function (scenario) {
  const featureName = scenario.gherkinDocument.feature?.name || "Funcionalidade Desconhecida";
  const world = this as any; 
  
  if (world.label) {
      world.label("parentSuite", "e2e"); 
      world.label("suite", featureName);     
      world.label("subSuite", scenario.pickle.name); 
  }

  if (!process.env.BASE_URL) throw new Error("BASE_URL não definida!");

  context = await browser.newContext({
    baseURL: process.env.BASE_URL, 
    ignoreHTTPSErrors: true,
    locale: 'en-US'
  });
  
  const page = await context.newPage();
  this.page = page;
  this.pageManager = new PageManager(this.page);
  this.pageManager.setAllureAttach(this.attach.bind(this));
});

After(async function (scenario) {
  // 1. Tratamento de Falhas (Screenshots + IA)
  if (scenario.result?.status === Status.FAILED) {
    const startTime = Date.now();
    const errorMessage = scenario.result.message || "";
    
    if (this.page) {
        try {
            const screenshot = await this.page.screenshot({ fullPage: true, timeout: 5000 });
            this.attach(screenshot, 'image/png');
        } catch (e) {
            console.warn("[Hook] Não foi possível tirar screenshot.");
        }
    }

    if (process.env.AZURE_AI_TOKEN) {
      if (this.pageManager) {
        try {
            const aiService = this.pageManager.ai; 
            const cleanDom = await this.page.evaluate(() => {
                return document.body ? document.body.innerHTML.substring(0, 20000) : "DOM Vazio";
            }).catch(() => "Erro ao ler DOM");

            const analysis = await aiService.analyzeFailure(errorMessage, cleanDom as string);
            this.attach(`IA Root Cause Analysis (RCA):\n\n${analysis}`, 'text/plain');
        } catch (aiError) {
            console.error(`[IA] Falha ao executar análise: ${aiError}`);
        }
      }
    }
  }

  // 2. Limpeza Blindada (Onde o erro Exit 1 geralmente ocorre)
  try {
      if (this.page) await this.page.close();
      if (context) await context.close();
  } catch (e) {
      // Ignora erro de fechamento se o teste já passou. 
      // Isso evita falhar o CI por "Target closed" durante o teardown.
      console.warn(`[Hook Warning] Erro ao fechar contexto: ${e}`);
  }
});

AfterAll(async function () {
  try {
      if (browser) await browser.close();
  } catch (e) {
      console.warn(`[Hook Warning] Erro ao fechar navegador: ${e}`);
  }
});