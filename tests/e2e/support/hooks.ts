process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

const envPath = path.resolve(process.cwd(), 'envs/.env.dev');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`✅ Ambiente carregado: ${envPath}`);
}

let browser: Browser;
let context: BrowserContext;

setDefaultTimeout(60000);

BeforeAll(async function () {
  const headlessMode = process.env.CI === 'true' || process.env.HEADLESS === 'true';

  browser = await chromium.launch({ 
    headless: headlessMode,
    args: [
      "--disable-gpu", 
      "--no-sandbox", 
      "--disable-setuid-sandbox",
      // --- OTIMIZAÇÃO CRÍTICA PARA LINUX ---
      "--disable-dev-shm-usage", // Resolve a lentidão e travamento de memória no Linux
      "--no-zygote",             // Evita processos zumbis
      // -------------------------------------
      "--disable-features=Translate,TranslateUI,OptimizationHints,MediaRouter",
      "--disable-extensions",
      "--lang=en-US"
    ]
  });
});

Before(async function () {
  if (!process.env.BASE_URL) throw new Error("BASE_URL não definida!");

  // Recria o contexto para cada teste (Isolamento total)
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
        // Tenta tirar screenshot mesmo se a página travou
        try {
            const screenshot = await this.page.screenshot({ fullPage: true, timeout: 5000 });
            this.attach(screenshot, 'image/png');
        } catch (e) {
            console.warn("Não foi possível tirar screenshot (página travada?)");
        }
    }

    const isTimeout = errorMessage.includes('Timeout') || errorMessage.includes('exceeded');

    if (process.env.GITHUB_AI_TOKEN && !isTimeout) {
      if (!this.pageManager) {
        return;
      }
      try {
        const aiService = this.pageManager.ai; 

        // DOM Stripping Otimizado
        const cleanDom = await this.page.evaluate(() => {
            return document.body ? document.body.innerHTML.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "").substring(0, 20000) : "DOM Vazio";
        }).catch(() => "Erro ao ler DOM");

        console.log(`[IA] ⏳ Analisando falha: ${scenario.pickle.name}...`);
        const analysis = await aiService.analyzeFailure(errorMessage, cleanDom as string);
        this.attach(`IA Root Cause Analysis (RCA):\n\n${analysis}`, 'text/plain');
        
        console.log(`[IA] ✅ RCA concluída em ${((Date.now() - startTime) / 1000).toFixed(2)}s.`);
      } catch (aiError) {
        console.error(`[IA] ❌ Erro na análise: ${aiError.message}`);
      }
    }
  }

  // Garante o fechamento para liberar memória
  if (this.page) await this.page.close();
  if (context) await context.close();
});

AfterAll(async function () {
  if (browser) await browser.close();
});