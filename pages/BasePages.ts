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
   * Navegação Resiliente (Retry Pattern):
   * Tenta conectar até 3 vezes caso haja instabilidade de rede (ERR_TIMED_OUT).
   * Isso resolve falhas intermitentes no CI/CD ou Linux.
   */
  async navigate(path: string = "") {
    const url = path ? path : (process.env.BASE_URL || "");
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`[BasePage] 🧭 Navegando para: ${url} (Tentativa ${attempt}/${maxRetries})`);

            await this.page.goto(path, { 
                waitUntil: 'domcontentloaded', // Mais rápido que 'load' para SPA
                timeout: 30000 // Timeout reduzido para falhar rápido e tentar de novo
            });
            
            // Garantia extra para Linux: espera o body ser renderizado
            await this.page.waitForSelector('body', { timeout: 10000 }); 
            
            // Se chegou aqui, deu certo! Encerra o loop.
            return; 

        } catch (error: any) {
            console.warn(`[BasePage] ⚠️ Falha de conexão na tentativa ${attempt}: ${error.message}`);
            
            // Se for a última tentativa, não tem mais o que fazer. Lança o erro.
            if (attempt === maxRetries) {
                console.error(`[BasePage] ❌ Esgotadas todas as tentativas de conexão com ${url}`);
                throw error;
            }
            
            // Backoff: Espera 2 segundos antes de tentar novamente para a rede estabilizar
            console.log(`[BasePage] ⏳ Aguardando 2s antes de tentar novamente...`);
            await this.page.waitForTimeout(2000);
        }
    }
  }

  /**
   * Clique Inteligente (Self-Healing com IA):
   * 1. Tenta clicar normalmente.
   * 2. Se falhar, captura o DOM limpo (sem scripts).
   * 3. Pergunta para a IA qual é o novo seletor.
   * 4. Tenta clicar no seletor sugerido.
   */
  async smartClick(selector: string, contextDescription: string) {
    try {
      // Espera explícita pelo elemento estar visível e estável
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
      await this.page.click(selector);
    } catch (error: any) {
      // Se não tiver token, falha logo para não gastar tempo
      if (!process.env.GITHUB_AI_TOKEN) throw error;

      console.warn(`[Self-Healing] Falha ao clicar em: '${contextDescription}'. Iniciando reparo via IA...`);
      
      // DOM STRIPPING: Removemos scripts, estilos e SVGs para reduzir custos e tokens
      const cleanDom = await this.page.evaluate(() => {
          const clone = document.documentElement.cloneNode(true) as HTMLElement;
          const toRemove = clone.querySelectorAll('script, style, svg, iframe, noscript');
          toRemove.forEach(el => el.remove());
          return clone.innerHTML;
      });

      const failureMessage = error.message || String(error);
      
      // Chama o serviço de IA para analisar o erro
      const analysis = await this.ai.analyzeFailure(failureMessage, cleanDom);
      
      // Extrai o seletor sugerido (que a IA deve devolver entre crases ` `)
      const suggestedSelector = analysis.match(/`([^`]+)`/)?.[1];

      if (suggestedSelector) {
        console.log(`[Self-Healing] ✅ Sucesso! Novo seletor aplicado: ${suggestedSelector}`);
        await this.page.click(suggestedSelector);
      } else {
        // Se a IA não conseguir ajudar, lançamos o erro original
        throw error;
      }
    }
  }
}