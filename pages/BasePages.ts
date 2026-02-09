import { Page } from "@playwright/test";
import { AIService } from "../services/AIService";

export class BasePage {
  protected readonly page: Page;
  protected readonly ai: AIService;
  private attachFn?: (content: string, type: string) => void;

  constructor(page: Page, ai: AIService) {
    this.page = page;
    this.ai = ai;
  }

  public setAttachFunction(fn: (content: string, type: string) => void) {
    this.attachFn = fn;
  }

  async navigate(path: string = "") {

     const url = path ? path : (process.env.BASE_URL || "");
     await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 }); 
  }

  async smartClick(selector: string, contextDescription: string) {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
      await this.page.click(selector);
    } catch (error: any) {
      if (!process.env.AZURE_AI_TOKEN) throw error; // Use o nome novo da variavel

      console.warn(`[Self-Healing] 🚑 Falha ao clicar em: '${contextDescription}'. Chamando IA...`);
      
      try {
          const cleanDom = await this.page.evaluate(() => {
              return document.body ? document.body.innerHTML.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "").substring(0, 15000) : "DOM Vazio";
          });

          const failureMessage = error.message || String(error);
          
          console.log(`[Self-Healing] 📞 Contactando AIService...`);
          const analysis = await this.ai.analyzeFailure(failureMessage, cleanDom);
          console.log(`[Self-Healing] 🤖 Retorno da IA: ${analysis}`);

          const match = analysis.match(/`([^`]+)`/);
          let suggestedSelector = match ? match[1] : (analysis.startsWith("#") || analysis.startsWith(".") ? analysis.trim() : null);

          if (suggestedSelector && suggestedSelector !== "null") {
            console.log(`[Self-Healing] ✅ Tentando novo seletor: ${suggestedSelector}`);
            
            // 🚨 AQUI ESTÁ A MÁGICA DO REPORT 🚨
            if (this.attachFn) {
                this.attachFn(
                    `⚠️ SELF-HEALING ATIVADO!\n\nSeletor Original Quebrado: ${selector}\nSeletor Novo (IA): ${suggestedSelector}\nContexto: ${contextDescription}`, 
                    'text/plain'
                );
            }

            await this.page.waitForSelector(suggestedSelector, { state: 'visible', timeout: 5000 });
            await this.page.click(suggestedSelector);
            console.log(`[Self-Healing] ✨ SUCESSO! Correção aplicada.`);
          } else {
            console.error(`[Self-Healing] ❌ IA não retornou um seletor válido.`);
            throw error; 
          }
      } catch (aiError) {
          console.error(`[Self-Healing] 💀 Erro no processo de cura: ${aiError}`);
          throw error;
      }
    }
  }
}