import { Page, expect } from "@playwright/test";

export class LoginPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // 👇 Mudou de 'goto' para 'navigate' (Padrão e resolve o erro do visual test)
  public async navigate() {
    await this.page.goto("/");
  }

  // 👇 Mudou de 'login' para 'performLogin' (Mais semântico e evita 'login.login')
  public async performLogin(usuario: string, senha: string) {
    await this.page.locator('[data-test="username"]').fill(usuario);
    await this.page.locator('[data-test="password"]').fill(senha);
    await this.page.locator('[data-test="login-button"]').click();
  }

  public async validateErrorMessage(message: string) {
    const errorLocator = this.page.locator('[data-test="error"]');
    await expect(errorLocator).toBeVisible();
    await expect(errorLocator).toContainText(message);
  }
}