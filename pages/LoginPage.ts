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
    // --- REDE DE SEGURANÇA SÊNIOR ---
    // Se por acaso o Step Definition esqueceu de chamar o 'Given que estou na home',
    // ou se estamos num cenário de reuso, e a url for 'about:blank', nós navegamos forçado.
    if (this.page.url() === 'about:blank') {
        console.log("⚠️ [Login] Página em branco detectada! Forçando navegação automática.");
        await this.navigate();
    }

    try {
        console.log(`[Login] Aguardando campos de login...`);
        
        // Espera o campo estar visível (agora garantido pela navegação acima)
        await this.page.waitForSelector(this.usernameInput, { state: 'visible', timeout: 10000 });
        
        await this.page.fill(this.usernameInput, user);
        await this.page.fill(this.passwordInput, pass);
        
        await this.smartClick(this.loginButton, "Botão de Login Principal");
        
    } catch (error) {
        console.error(`[Login] Falha: ${error.message}`);
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