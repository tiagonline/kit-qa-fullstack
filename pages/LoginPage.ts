import { Page } from "@playwright/test";
import { BasePage } from "./BasePages";
import { AIService } from "../services/AIService";

export class LoginPage extends BasePage {
  private readonly usernameInput = "#user-name";
  private readonly passwordInput = "#password";
  private readonly loginButton = "#login-button";

  constructor(page: Page, ai: AIService) {
    super(page, ai);
  }

  async performLogin(user: string, pass: string) {
    // 🚀 OTIMIZAÇÃO DE PERFORMANCE:
    // Verificamos a URL localmente (instantâneo) em vez de perguntar ao browser se o elemento existe (lento).
    // Se estiver em 'about:blank', significa que o passo de navegação foi pulado ou falhou.
    if (this.page.url() === 'about:blank') {
        console.log("⚠️ [Login] Página em branco detectada! Forçando navegação automática.");
        await this.navigate();
    }

    try {
        console.log(`[Login] Preenchendo credenciais...`);
        
        // O waitForSelector aqui é suficiente para segurar a automação até o campo aparecer.
        // Timeout de 15s para garantir que flutuações de rede não quebrem o teste.
        await this.page.waitForSelector(this.usernameInput, { state: 'visible', timeout: 15000 });
        
        await this.page.fill(this.usernameInput, user);
        await this.page.fill(this.passwordInput, pass);
        
        // Clica usando nossa IA como fallback (Smart Click)
        await this.smartClick(this.loginButton, "Botão de Login Principal");
        
    } catch (error: any) {
        console.error(`[Login] Erro fatal no login: ${error.message}`);
        throw error;
    }
  }

  async validateErrorMessage(message: string) {
     const errorContainer = "[data-test='error']";
     await this.page.waitForSelector(errorContainer, { state: 'visible' });
     const text = await this.page.textContent(errorContainer);
     if (!text?.includes(message)) {
         throw new Error(`Esperava erro "${message}", mas veio "${text}"`);
     }
  }
}