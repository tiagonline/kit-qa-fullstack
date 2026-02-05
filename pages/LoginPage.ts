import { Page } from "@playwright/test";
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

  // 👇 O PULO DO GATO: expectSuccess = true por padrão
  async performLogin(user: string, pass: string, expectSuccess: boolean = true) {
    if (this.page.url() === 'about:blank') {
        await this.navigate();
    }

    try {
        console.log(`[Login] Preenchendo: User='${user}' | Pass='${pass}'`);
        
        await this.page.waitForSelector(this.usernameInput, { state: 'visible', timeout: 15000 });
        
        // Trata null/undefined como string vazia para testes negativos
        await this.page.fill(this.usernameInput, user || "");
        await this.page.fill(this.passwordInput, pass || "");
        
        await this.smartClick(this.loginButton, "Botão de Login");

        // 👇 A LÓGICA DE DECISÃO QUE EVITA O TRAVAMENTO
        if (expectSuccess) {
            console.log(`[Login] Fluxo Positivo: Aguardando redirecionamento para Inventário...`);
            await this.page.waitForURL(/.*inventory\.html/, { timeout: 20000 });
            await this.page.waitForSelector(this.inventoryContainer, { state: 'visible' });
            console.log(`[Login] ✅ Login realizado e página carregada!`);
        } else {
            // 🛑 AQUI ESTÁ A CORREÇÃO:
            // Se esperamos falha, NÃO esperamos URL mudar. Liberamos o teste imediatamente.
            console.log(`[Login] Fluxo Negativo: Login submetido, verificando erros...`);
        }

    } catch (error: any) {
        console.error(`[Login] Erro durante ação de login: ${error.message}`);
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