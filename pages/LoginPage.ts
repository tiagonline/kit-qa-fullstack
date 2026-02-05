import { Page } from "@playwright/test";
import { BasePage } from "./BasePages";
import { AIService } from "../services/AIService";

export class LoginPage extends BasePage {
  private readonly usernameInput = "#user-name";
  private readonly passwordInput = "#password";
  private readonly loginButton = "#login-button";
  // Elemento que confirma que o login deu certo (da Home Page)
  private readonly inventoryContainer = "#inventory_container"; 

  constructor(page: Page, ai: AIService) {
    super(page, ai);
  }

  async performLogin(user: string, pass: string) {
    // 1. Checagem de segurança (já implementada)
    if (this.page.url() === 'about:blank') {
        console.log("⚠️ [Login] Página em branco detectada! Forçando navegação automática.");
        await this.navigate();
    }

    try {
        console.log(`[Login] Preenchendo credenciais...`);
        
        await this.page.waitForSelector(this.usernameInput, { state: 'visible', timeout: 15000 });
        await this.page.fill(this.usernameInput, user);
        await this.page.fill(this.passwordInput, pass);
        
        await this.smartClick(this.loginButton, "Botão de Login Principal");

        // 🛑 FIX CRÍTICO: ESPERA O REDIRECIONAMENTO!
        // O método só termina quando a URL mudar E a grade de produtos aparecer.
        // Isso resolve o problema de "agarrar" em Checkout, Favorites e Inventory de uma vez só.
        
        console.log(`[Login] Aguardando redirecionamento para Inventário...`);
        await this.page.waitForURL(/.*inventory\.html/, { timeout: 20000 });
        await this.page.waitForSelector(this.inventoryContainer, { state: 'visible', timeout: 20000 });
        
        console.log(`[Login] ✅ Login realizado e página carregada!`);

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