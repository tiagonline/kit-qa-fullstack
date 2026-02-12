import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePages";
import { AIService } from "../services/AIService";

export class LoginPage extends BasePage {
  private readonly usernameInput = "#user-name";
  private readonly passwordInput = "#password";
  private readonly loginButton = "#login-button";
  private readonly inventoryContainer = "#inventory_container"; 

  constructor(page: Page, ai: AIService) {
    super(page, ai);
  }

  async performLogin(user: string, pass: string, expectSuccess: boolean = true) {
    if (this.page.url() === 'about:blank') {
        await this.navigate();
    }

    try {
        console.log(`[Login] 🚀 Preenchendo: User='${user}'`);
        
        await this.page.waitForSelector(this.usernameInput, { state: 'visible', timeout: 15000 });
        
        // 1. Clica para garantir foco
        await this.page.click(this.usernameInput);
        
        // 2. Preenche e valida se o valor realmente ficou lá (Crucial para React/Headless)
        await this.page.fill(this.usernameInput, user || "");
        
        if (user) {
            // Aguarda até 2s para o valor aparecer no DOM. Se falhar aqui, é erro real, não flaky.
            await expect(this.page.locator(this.usernameInput)).toHaveValue(user, { timeout: 2000 });
        }

        await this.page.fill(this.passwordInput, pass || "");
        // ----------------------------------------------
        
        await this.smartClick(this.loginButton, "Botão de Login");

        if (expectSuccess) {
            console.log(`[Login] Fluxo Positivo: Aguardando redirecionamento para Inventário...`);
            await this.page.waitForURL(/.*inventory\.html/, { timeout: 20000 });
            await this.page.waitForSelector(this.inventoryContainer, { state: 'visible' });
            console.log(`[Login] ✅ Login realizado e página carregada!`);
        } else {
            // Se espera falha, apenas damos um breve respiro para o DOM processar o clique
            console.log(`[Login] Fluxo Negativo: Login submetido, verificando erros...`);
            await this.page.waitForTimeout(500);
        }

    } catch (error: any) {
        console.error(`[Login] ❌ Erro durante ação de login: ${error.message}`);
        throw error;
    }
  }

  async validateErrorMessage(message: string) {
     const errorContainer = "[data-test='error']";
     console.log(`[Login] Validando mensagem de erro: "${message}"`);
     
     await this.page.waitForSelector(errorContainer, { state: 'visible', timeout: 10000 });
     const text = await this.page.textContent(errorContainer);
     
     if (!text?.includes(message)) {
         throw new Error(`Esperava erro contendo "${message}", mas veio "${text}"`);
     }
  }
}