import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePages";
import { AIService } from "../services/AIService";

export class LoginPage extends BasePage {
  private readonly usernameInput = "#user-name";
  private readonly passwordInput = "#password";
  private readonly loginButton = "#login-button";
  private readonly inventoryContainer = "#inventory_container";
  private readonly errorContainer = "[data-test='error']";

  constructor(page: Page, ai: AIService) {
    super(page, ai);
  }

  async performLogin(
    user: string,
    pass: string,
    expectSuccess: boolean = true,
  ) {
    if (this.page.url() === "about:blank") {
      await this.navigate();
    }

    try {
      console.log(
        `[Login] 🚀 Ação de Login: User='${user}' | Pass='${pass ? "*****" : "VAZIO"}'`,
      );

      await this.page.waitForSelector(this.usernameInput, {
        state: "visible",
        timeout: 15000,
      });
      await this.page.click(this.usernameInput);
      await this.page.fill(this.usernameInput, ""); // Garante limpeza prévia

      if (user) {
        await this.page.fill(this.usernameInput, user);
        // Verifica se o React aceitou o valor
        await expect(this.page.locator(this.usernameInput)).toHaveValue(user, {
          timeout: 2000,
        });
      } else {
        await expect(this.page.locator(this.usernameInput)).toHaveValue("", {
          timeout: 2000,
        });
      }

      await this.page.fill(this.passwordInput, pass || "");
      // -------------------------------

      await this.smartClick(this.loginButton, "Botão de Login");

      if (expectSuccess) {
        console.log(`[Login] ⏳ Aguardando Inventário...`);
        await this.page.waitForURL(/.*inventory\.html/, { timeout: 20000 });
        await this.page.waitForSelector(this.inventoryContainer, {
          state: "visible",
        });
        console.log(`[Login] ✅ Sucesso: Inventário carregado!`);
      } else {
        console.log(`[Login] ⏳ Aguardando mensagem de erro...`);
      }
    } catch (error: any) {
      console.error(`[Login] ❌ Erro Crítico no Login: ${error.message}`);
      throw error;
    }
  }

  async validateErrorMessage(message: string) {
    console.log(`[Login] 🔍 Validando se erro contém: "${message}"`);

    const errorLocator = this.page.locator(this.errorContainer);
    // 1. Garante que o container de erro apareceu
    await expect(errorLocator).toBeVisible({ timeout: 10000 });
    // 2. Valida o texto (toContainText é case-insensitive e ignora whitespace)
    await expect(errorLocator).toContainText(message, { timeout: 5000 });
    console.log(`[Login] ✅ Mensagem de erro validada com sucesso!`);
  }
}
