import { test, expect } from "@playwright/test";
import { allure } from "allure-playwright";
import { PageManager } from "../../pages/PageManager";

test.describe("Regressão Visual", () => {
  let pageManager: PageManager;

  test.beforeEach(async ({ page }) => {
    pageManager = new PageManager(page);
  });

  test("Deve garantir o layout da Login Page", async ({ page }) => {
    // 🏷️ METADADOS ALLURE
    allure.epic("Interface do Usuário (UI)");
    allure.feature("Autenticação");
    allure.story("Aparência da Página de Login");
    allure.tag("Visual", "Login", "Responsividade");
    allure.severity("normal");
    allure.owner("Tiago Silva");

    await pageManager.login.navigate();

    // Tira um print e compara com o "baseline" (imagem de referência)
    await expect(page).toHaveScreenshot("login-page.png", { fullPage: true });
  });

  test("Deve garantir o layout do Inventário", async ({ page }) => {
    // 🏷️ METADADOS ALLURE
    allure.epic("Interface do Usuário (UI)");
    allure.feature("Vitrine de Produtos");
    allure.story("Aparência da Listagem de Itens");
    allure.tag("Visual", "Inventário");
    allure.severity("normal");
    allure.owner("Tiago Silva");

    await pageManager.login.navigate();
    await pageManager.login.performLogin("standard_user", "secret_sauce");

    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(page).toHaveScreenshot("inventory-page.png", {
      fullPage: true,
    });
  });
});
