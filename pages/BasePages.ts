import { Page } from "@playwright/test";
import { AIService } from "../services/AIService";

export class BasePage {
  protected readonly page: Page;
  protected readonly ai: AIService;

  constructor(page: Page, ai: AIService) {
    this.page = page;
    this.ai = ai;
  }

  // Eu mantenho a URL base vinda do process.env.BASE_URL definida no seu config
  async navigate(path: string = "") {
    await this.page.goto(path);
  }

  async smartClick(selector: string, contextDescription: string) {
    try {
      // Eu respeito o fluxo padrão, tentando o clique por 5 segundos primeiro
      await this.page.click(selector, { timeout: 5000 });
    } catch (error) {
      // Se falhar e tivermos o Token de IA, eu tento a auto-cura
      if (!process.env.GITHUB_AI_TOKEN) throw error;

      console.warn(`[Self-Healing] Falha em: ${contextDescription}. Consultando GitHub Models...`);
      const dom = await this.page.content();
      const analysis = await this.ai.analyzeFailure(error.message, dom);
      
      const suggestedSelector = analysis.match(/`([^`]+)`/)?.[1];

      if (suggestedSelector) {
        console.log(`[Self-Healing] Novo seletor encontrado: ${suggestedSelector}`);
        await this.page.click(suggestedSelector);
      } else {
        throw error;
      }
    }
  }
}