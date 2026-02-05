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
            console.warn(`[BasePage] ⚠️ Falha na tentativa ${attempt} (${error.message.includes('Timeout') ? 'Timeout' : 'Erro'}): Retentando...`);
            await this.page.waitForTimeout(2000);
        }
    }
  }

  async smartClick(selector: string, contextDescription: string) {
    try {
      // Tenta clicar normalmente
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 5000 }); // Timeout curto para acionar o healing rápido
      await this.page.click(selector);
    } catch (error: any) {
      // Se falhar e não tiver token, explode erro normal
      if (!process.env.GITHUB_AI_TOKEN) throw error;

      console.warn(`[Self-Healing] 🚑 Falha ao clicar em: '${contextDescription}'. Pedindo socorro à IA...`);
      
      try {
          const cleanDom = await this.page.evaluate(() => {
              // Limpa scripts e styles para facilitar a leitura da IA
              return document.body ? document.body.innerHTML.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "").substring(0, 15000) : "DOM Vazio";
          });

          const failureMessage = error.message || String(error);
          
          // Chama a IA
          const analysis = await this.ai.analyzeFailure(failureMessage, cleanDom);
          
          // 🔍 DEBUG: Ver o que a IA respondeu
          console.log(`[Self-Healing] 🤖 Resposta da IA: ${analysis}`);

          // Extrai o conteúdo entre crases
          const suggestedSelector = analysis.match(/`([^`]+)`/)?.[1];

          if (suggestedSelector) {
            console.log(`[Self-Healing] ✅ Seletor encontrado: ${suggestedSelector}. Aplicando correção...`);
            
            // Tenta clicar no NOVO seletor sugerido
            await this.page.waitForSelector(suggestedSelector, { state: 'visible', timeout: 5000 });
            await this.page.click(suggestedSelector);
            
            console.log(`[Self-Healing] ✨ SUCESSO! O teste foi curado automaticamente.`);
          } else {
            console.error(`[Self-Healing] ❌ A IA não conseguiu sugerir um seletor válido.`);
            throw error; // Relança o erro original se a IA falhar
          }
      } catch (aiError) {
          console.error(`[Self-Healing] 💀 Falha crítica no processo de cura: ${aiError}`);
          throw error; // Garante que o teste falhe se o healing quebrar
      }
    }
  }
}