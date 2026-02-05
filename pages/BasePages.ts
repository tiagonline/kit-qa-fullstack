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
   * Navegação resiliente: aguarda o carregamento completo e garante estabilidade
   */
  async navigate(path: string = "") {
    await this.page.goto(path, { 
      waitUntil: 'load', 
      timeout: 60000 
    });
    // Garantia extra de que a página está pronta para interação
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Clique inteligente com espera automática por visibilidade
   */
  async smartClick(selector: string, contextDescription: string) {
    try {
      // Espera explícita pelo elemento estar pronto para clique
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
      await this.page.click(selector);
    } catch (error) {
      if (!process.env.GITHUB_AI_TOKEN) throw error;

      console.warn(`[Self-Healing] Tentando recuperar: ${contextDescription}...`);
      
      const cleanDom = await this.page.evaluate(() => {
          const clone = document.documentElement.cloneNode(true) as HTMLElement;
          const toRemove = clone.querySelectorAll('script, style, svg');
          toRemove.forEach(el => el.remove());
          return clone.innerHTML;
      });

      const analysis = await this.ai.analyzeFailure(error.message, cleanDom);
      const suggestedSelector = analysis.match(/`([^`]+)`/)?.[1];

      if (suggestedSelector) {
        console.log(`[Self-Healing] ✅ Novo seletor encontrado: ${suggestedSelector}`);
        await this.page.click(suggestedSelector);
      } else {
        throw error;
      }
    }
  }
}