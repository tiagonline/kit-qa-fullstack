import { Page } from "@playwright/test";
import { AIService } from "../services/AIService";

export class BasePage {
  protected readonly page: Page;
  protected readonly ai: AIService;

  constructor(page: Page, ai: AIService) {
    this.page = page;
    this.ai = ai;
  }

  async navigate(path: string = "") {
    const url = path ? path : (process.env.BASE_URL || "");
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[BasePage] 🧭 Navegando para: ${url} (Tentativa ${attempt}/${maxRetries})`);
            const currentTimeout = attempt === 1 ? 5000 : 30000;
            await this.page.goto(path, { waitUntil: 'domcontentloaded', timeout: currentTimeout });
            await this.page.waitForSelector('body', { timeout: 10000 }); 
            return; 
        } catch (error: any) {
            if (attempt === maxRetries) {
                console.error(`[BasePage] ❌ Falha final de conexão com ${url}`);
                throw error;
            }
            console.warn(`[BasePage] ⚠️ Falha na tentativa ${attempt}: Retentando...`);
            await this.page.waitForTimeout(2000);
        }
    }
  }

  async smartClick(selector: string, contextDescription: string) {
    try {
      // Tenta clicar com timeout curto (5s)
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 5000 });
      await this.page.click(selector);
    } catch (error: any) {
      if (!process.env.AZURE_AI_TOKEN) throw error;

      console.warn(`[Self-Healing] 🚑 Falha ao clicar em: '${contextDescription}'. Chamando IA...`);
      
      try {
          const cleanDom = await this.page.evaluate(() => {
              return document.body ? document.body.innerHTML.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "").substring(0, 15000) : "DOM Vazio";
          });

          const failureMessage = error.message || String(error);
          
          console.log(`[Self-Healing] 📞 Contactando AIService...`);
          const analysis = await this.ai.analyzeFailure(failureMessage, cleanDom);
          console.log(`[Self-Healing] 🤖 Retorno da IA: ${analysis}`);

          // Regex mais flexível: Pega entre crases OU pega a última palavra se parecer um ID/Class
          const match = analysis.match(/`([^`]+)`/);
          let suggestedSelector = match ? match[1] : null;

          // Fallback: Se a IA respondeu só "#login-button" sem crases
          if (!suggestedSelector && (analysis.startsWith("#") || analysis.startsWith("."))) {
              suggestedSelector = analysis.trim();
          }

          if (suggestedSelector && suggestedSelector !== "null") {
            console.log(`[Self-Healing] ✅ Tentando novo seletor: ${suggestedSelector}`);
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