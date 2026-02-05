// Eu forço a aceitação de certificados para que a IA funcione em qualquer rede (VPN/Proxy)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, Page, BrowserContext } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';
import { AIService } from '../../../services/AIService'; // Eu centralizei a lógica de IA aqui
import * as dotenv from 'dotenv';
import * as path from 'path';

// Eu carrego as variáveis de ambiente garantindo que o Token de IA esteja disponível
dotenv.config({ path: path.resolve(process.cwd(), 'envs/.env.dev') });

let browser: Browser;
let context: BrowserContext;

// Timeout global aumentado para acomodar o tempo de resposta da IA em caso de falha
setDefaultTimeout(60000);

BeforeAll(async function () {
  // Eu rodo em modo headless no CI para performance, mas permito debug local
  const headlessMode = process.env.CI === 'true' || process.env.HEADLESS === 'true';

  browser = await chromium.launch({ 
    headless: headlessMode,
    args: ["--disable-gpu", "--no-sandbox", "--disable-setuid-sandbox"]
  });
});

Before(async function () {
  // Eu configuro o contexto respeitando a Base URL do ambiente
  context = await browser.newContext({
    baseURL: process.env.BASE_URL, 
    ignoreHTTPSErrors: true 
  });
  
  const page = await context.newPage();
  this.page = page;
  
  // Eu inicializo o PageManager para abstrair a criação de instâncias das páginas
  this.pageManager = new PageManager(this.page);
});

After(async function (scenario) {
  if (scenario.result?.status === Status.FAILED) {
    const scenarioName = scenario.pickle.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    // 1. Captura de Evidência Visual Tradicional
    const screenshot = await this.page.screenshot({ fullPage: true });
    this.attach(screenshot, 'image/png');

    // 2. IA Root Cause Analysis (O Diferencial Sênior)
    // Eu só disparo a IA se o token estiver configurado, evitando erros no pipeline
    if (process.env.GITHUB_AI_TOKEN) {
      try {
        const aiService = new AIService();
        const domSnapshot = await this.page.content();
        const errorMessage = scenario.result.message || "Erro desconhecido";

        console.log(`[IA] Analisando falha do cenário: ${scenario.pickle.name}...`);
        
        const analysis = await aiService.analyzeFailure(errorMessage, domSnapshot);
        
        // Eu anexo a análise técnica da IA no relatório Allure/Cucumber
        this.attach(`--- IA ANALYSIS ---\n${analysis}`, 'text/plain');
        console.log(`[IA] RCA concluída com sucesso.`);
      } catch (aiError) {
        console.error(`[IA] Erro ao processar análise: ${aiError.message}`);
      }
    }
  }

  // Eu garanto a limpeza dos recursos para evitar vazamento de memória
  if (this.page) await this.page.close();
  if (context) await context.close();
});

AfterAll(async function () {
  if (browser) await browser.close();
});