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
    // CAMADA DE SEGURANÇA 2 (Mais inteligente):
    // Verifica se o campo de login NÃO está visível. 
    // Se não estiver (seja por about:blank ou página errada), forçamos a navegação.
    const isLoginFieldVisible = await this.page.isVisible(this.usernameInput).catch(() => false);
    
    if (!isLoginFieldVisible) {
        console.log(`⚠️ [Login] Campo de usuário não visível (URL: ${this.page.url()}). Forçando navegação...`);
        await this.navigate();
    }

    try {
        console.log(`[Login] Preenchendo credenciais...`);
        
        // Espera o campo estar visível (agora garantido pela lógica acima)
        await this.page.waitForSelector(this.usernameInput, { state: 'visible', timeout: 15000 });
        
        await this.page.fill(this.usernameInput, user);
        await this.page.fill(this.passwordInput, pass);
        
        await this.smartClick(this.loginButton, "Botão de Login Principal");
        
    } catch (error: any) {
        // Se falhar mesmo assim, o Hooks captura e manda para a IA
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