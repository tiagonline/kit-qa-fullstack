import { Page } from "@playwright/test";
import { BasePage } from "./BasePages.ts";
import { AIService } from "../services/AIService";

export class LoginPage extends BasePage {
  // Eu mantive os seletores originais do seu projeto
  private readonly usernameInput = "#user-name";
  private readonly passwordInput = "#password";
  private readonly loginButton = "#login-button";

  constructor(page: Page, ai: AIService) {
    super(page, ai);
  }

  async login(user: string, pass: string) {
    // Eu uso o navigate sem argumentos para ir à BASE_URL definida no .env
    await this.navigate(); 
    await this.page.fill(this.usernameInput, user);
    await this.page.fill(this.passwordInput, pass);
    
    // Eu aplico o smartClick aqui para garantir que o login nunca quebre por ID alterado
    await this.smartClick(this.loginButton, "Botão de Login Principal");
  }
}