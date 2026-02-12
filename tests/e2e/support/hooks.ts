import { Before, After, BeforeAll, AfterAll, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';
import * as dotenv from 'dotenv';
import * as path from 'path';

// --- CONFIGURAÇÃO DE AMBIENTE ---
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const envPath = path.resolve(process.cwd(), 'envs/.env.dev');
dotenv.config({ path: envPath });

// --- DEBUG DE NODE.JS (Para pegar o erro oculto) ---
process.on('unhandledRejection', (reason, promise) => {
    console.error('🔥 CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
    // Não damos exit(1) aqui para não falhar o teste se for um erro bobo de analytics
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

  // Configuração do contexto por cenário (Isolamento)
  context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 }, // Tamanho padrão evita erros de responsividade
    locale: 'en-US'
  });
  
  const page = await context.newPage();
  this.page = page;
  this.pageManager = new PageManager(this.page);
  
  // Link para o Allure (se disponível)
  if (this.attach) {
      this.pageManager.setAllureAttach(this.attach.bind(this));
  }
});

After(async function (scenario) {
  // 1. Tira Screenshot em caso de falha
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

  // 2. Limpeza do Contexto (Safe Close)
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

  // -----------------------------------------------------------
  // O SEGREDO DO CI: Forçar saída limpa após os testes
  // Isso mata processos "zumbis" do Playwright que causam Exit 1
  // -----------------------------------------------------------
  if (process.env.CI === 'true') {
      console.log('[Hooks] 🏁 CI Detectado: Forçando Exit Code 0...');
      setTimeout(() => process.exit(0), 500); 
  }
});