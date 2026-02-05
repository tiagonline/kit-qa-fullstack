// Forçamos a aceitação de certificados logo na linha 1
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
    console.log(`✅ Ambiente carregado: ${envPath}`);
}

let browser: Browser;
let context: BrowserContext;

// Timeout global de 2 minutos para tolerar instabilidade de rede e Retry Pattern
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
  // --- 🎨 ALLURE HIERARCHY SETUP ---
  // Aqui definimos que todos os testes E2E ficam dentro da suite "e2e"
  const featureName = scenario.gherkinDocument.feature?.name || "Funcionalidade Desconhecida";
  const world = this as any; 
  
  if (world.label) {
      // 1. Nível Mais Alto (Pasta Raiz no Relatório)
      world.label("parentSuite", "e2e"); 
      
      // 2. Nível Secundário (Agrupamento por Feature/Funcionalidade)
      world.label("suite", featureName);     
      
      // 3. Nível Terciário (Nome do Cenário - opcional, mas ajuda na busca)
      world.label("subSuite", scenario.pickle.name); 
  }
  // -------------------------------

  if (!process.env.BASE_URL) throw new Error("BASE_URL não definida!");

  context = await browser.newContext({
    baseURL: process.env.BASE_URL, 
    ignoreHTTPSErrors: true,
    locale: 'en-US'
  });
  
  const page = await context.newPage();
  this.page = page;
  this.pageManager = new PageManager(this.page);
});

After(async function (scenario) {
  if (scenario.result?.status === Status.FAILED) {
    const startTime = Date.now();
    const errorMessage = scenario.result.message || "";
    
    if (this.page) {
        try {
            const screenshot = await this.page.screenshot({ fullPage: true, timeout: 5000 });
            this.attach(screenshot, 'image/png');
        } catch (e) {
            console.warn("Não foi possível tirar screenshot (página travada?)");
        }
    }

    // IA entra em ação se houver falha
    if (process.env.GITHUB_AI_TOKEN) {
      if (!this.pageManager) return;
      
      try {
        const aiService = this.pageManager.ai; 

        const cleanDom = await this.page.evaluate(() => {
            return document.body ? document.body.innerHTML.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "").substring(0, 20000) : "DOM Vazio";
        }).catch(() => "Erro ao ler DOM");

        console.log(`[IA] ⏳ Analisando falha: ${scenario.pickle.name}...`);
        
        const analysis = await aiService.analyzeFailure(errorMessage, cleanDom as string);
        this.attach(`IA Root Cause Analysis (RCA):\n\n${analysis}`, 'text/plain');
        
        console.log(`[IA] ✅ RCA concluída em ${((Date.now() - startTime) / 1000).toFixed(2)}s.`);
      } catch (aiError: any) {
        console.error(`[IA] ❌ Erro na análise: ${aiError.message}`);
      }
    }
  }

  if (this.page) await this.page.close();
  if (context) await context.close();
});

AfterAll(async function () {
  if (browser) await browser.close();
});