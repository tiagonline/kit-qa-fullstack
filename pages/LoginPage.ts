import { Page } from "@playwright/test";
import { BasePage } from "./BasePages"; // Remova o .ts do import se der erro
import { AIService } from "../services/AIService";

export class LoginPage extends BasePage {
  private readonly usernameInput = "#user-name";
  private readonly passwordInput = "#password";
  private readonly loginButton = "#login-button";

  constructor(page: Page, ai: AIService) {
    super(page, ai);
  }

  // Renomeei para performLogin para bater com o seu step
  async performLogin(user: string, pass: string) {
    // REMOVI O this.navigate() DAQUI! 
    // Quem navega é o Step 'Given', não a ação de logar.
    
    try {
        console.log(`[Login] Preenchendo credenciais...`);
        
        // Espera o campo estar pronto (visível e não animado)
        await this.page.waitForSelector(this.usernameInput, { state: 'visible', timeout: 10000 });
        
        await this.page.fill(this.usernameInput, user);
        await this.page.fill(this.passwordInput, pass);
        
        await this.smartClick(this.loginButton, "Botão de Login Principal");
        
    } catch (error) {
        console.error(`[Login] Erro na interação: ${error.message}`);
        throw error;
    }
  }

  async validateErrorMessage(message: string) {
     const errorContainer = "[data-test='error']";
     await this.page.waitForSelector(errorContainer);
     const text = await this.page.textContent(errorContainer);
     if (!text?.includes(message)) {
         throw new Error(`Esperava erro "${message}", mas veio "${text}"`);
     }
  }
}