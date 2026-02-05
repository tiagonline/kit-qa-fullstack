// Forçamos a aceitação de certificados
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';
import { AIService } from 'services/AIService';
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

// Aumentei para 60s para garantir
setDefaultTimeout(60000);

BeforeAll(async function () {
  const headlessMode = process.env.CI === 'true' || process.env.HEADLESS === 'true';

  browser = await chromium.launch({ 
    headless: headlessMode,
    args: [
      "--disable-gpu", 
      "--no-sandbox", 
      "--disable-setuid-sandbox",
      // --- BLOCO ANTI-TRADUÇÃO E POP-UPS ---
      "--disable-features=Translate,TranslateUI,OptimizationHints,MediaRouter",
      "--disable-extensions",
      "--disable-component-extensions-with-background-pages",
      "--disable-background-networking",
      "--disable-sync",
      "--mute-audio",
      "--no-first-run",
      "--lang=en-US"
    ]
  });
});

Before(async function () {
  if (!process.env.BASE_URL) throw new Error("BASE_URL não definida!");

  // Forçamos o locale para inglês britânico ou americano para alinhar com o site
  context = await browser.newContext({
    baseURL: process.env.BASE_URL, 
    ignoreHTTPSErrors: true,
    locale: 'en-US',
    timezoneId: 'America/New_York'
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
        const screenshot = await this.page.screenshot({ fullPage: true });
        this.attach(screenshot, 'image/png');
    }

    const isTimeout = errorMessage.includes('Timeout') || errorMessage.includes('exceeded');

    if (process.env.GITHUB_AI_TOKEN && !isTimeout) {
      try {
        const aiService = this.pageManager.ai; 

        const cleanDom = await this.page.evaluate(() => {
            const clone = document.documentElement.cloneNode(true) as HTMLElement;
            const toRemove = clone.querySelectorAll('script, style, svg, iframe, noscript');
            toRemove.forEach(el => el.remove());
            return clone.innerHTML;
        });

        console.log(`[IA] ⏳ Analisando falha: ${scenario.pickle.name}...`);
        const analysis = await aiService.analyzeFailure(errorMessage, cleanDom);
        this.attach(`IA Root Cause Analysis (RCA):\n\n${analysis}`, 'text/plain');
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`[IA] ✅ RCA concluída em ${duration}s.`);
      } catch (aiError) {
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