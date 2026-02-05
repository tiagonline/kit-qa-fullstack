import { Page } from "@playwright/test";
import { AIService } from "../services/AIService";

export class BasePage {
  protected readonly page: Page;
  protected readonly ai: AIService;

  constructor(page: Page, ai: AIService) {
    this.page = page;
    this.ai = ai;
  }

  /**
   * Navegação Resiliente com FAST FAIL:
   * A 1ª tentativa tem timeout curto (5s) para não travar o teste se a rede engasgar.
   * As tentativas seguintes usam timeout padrão (30s).
   */
  async navigate(path: string = "") {
    const url = path ? path : (process.env.BASE_URL || "");
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[BasePage] 🧭 Navegando para: ${url} (Tentativa ${attempt}/${maxRetries})`);

            // ESTRATÉGIA FAST FAIL:
            // Se for a primeira tentativa, espera só 5s. Se travar, já tenta de novo.
            // Nas próximas, damos mais tempo (30s) para carregar.
            const currentTimeout = attempt === 1 ? 5000 : 30000;

            await this.page.goto(path, { 
                waitUntil: 'domcontentloaded', 
                timeout: currentTimeout 
            });
            
            await this.page.waitForSelector('body', { timeout: 10000 }); 
            
            return; // Sucesso! Sai do loop.

        } catch (error: any) {
            // Se for a última tentativa, explode o erro.
            if (attempt === maxRetries) {
                console.error(`[BasePage] ❌ Falha final de conexão com ${url}`);
                throw error;
            }
            
            const isTimeout = error.message.includes('Timeout');
            console.warn(`[BasePage] ⚠️ Falha na tentativa ${attempt} (${isTimeout ? 'Timeout' : 'Erro'}): Retentando...`);
            
            // Backoff: Espera um pouquinho antes de tentar de novo
            await this.page.waitForTimeout(2000);
        }
    }
  }

  async smartClick(selector: string, contextDescription: string) {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
      await this.page.click(selector);
    } catch (error: any) {
      if (!process.env.GITHUB_AI_TOKEN) throw error;

      console.warn(`[Self-Healing] Falha ao clicar em: '${contextDescription}'. Iniciando reparo via IA...`);
      
      const cleanDom = await this.page.evaluate(() => {
          const clone = document.documentElement.cloneNode(true) as HTMLElement;
          const toRemove = clone.querySelectorAll('script, style, svg, iframe, noscript');
          toRemove.forEach(el => el.remove());
          return clone.innerHTML;
      });

      const failureMessage = error.message || String(error);
      const analysis = await this.ai.analyzeFailure(failureMessage, cleanDom);
      const suggestedSelector = analysis.match(/`([^`]+)`/)?.[1];

      if (suggestedSelector) {
        console.log(`[Self-Healing] ✅ Sucesso! Novo seletor aplicado: ${suggestedSelector}`);
        await this.page.click(suggestedSelector);
      } else {
        throw error;
      }
    }
  }
}