import { test } from "@playwright/test";
import { LoginPage } from "../../../pages/LoginPage";
import { InventoryPage } from "../../../pages/InventoryPage";
import { CartPage } from "../../../pages/CartPage";
import { CheckoutPage } from "../../../pages/CheckoutPage";
import * as dotenv from "dotenv";
import { faker } from "@faker-js/faker";

dotenv.config();
test.describe.configure({ mode: 'serial' });

test.describe("E2E Nativo | Fluxo de Compra SAUCE LABS", () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  const VALID_USERNAME = process.env.SAUCE_USERNAME;
  const VALID_PASSWORD = process.env.SAUCE_PASSWORD;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    
    await loginPage.navigate();
  });

  test("Cenário Negativo - Deve falhar ao tentar logar com credenciais inválidas", async () => {
    const invalidPassword = faker.internet.password();
    const invalidUsername = faker.internet.userName();

    await test.step("Quando: Tenta logar com credenciais inválidas", async () => {
      await loginPage.performLogin(invalidUsername, invalidPassword);
    });

    await test.step("Então: Deve mostrar mensagem de erro", async () => {
      await loginPage.validateErrorMessage("Epic sadface: Username and password do not match");
    });
  });

  test("Cenário E2E Principal - Deve realizar a compra de um item com sucesso", async () => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const postalCode = faker.location.zipCode();

    await test.step("Dado: Que o login é feito com sucesso", async () => {
      await loginPage.performLogin(VALID_USERNAME, VALID_PASSWORD);
    });

    await test.step("Quando: Adiciono a mochila e prossigo para o checkout", async () => {
      await inventoryPage.addItemToCart("Sauce Labs Backpack");
      await inventoryPage.goToCart();
      await cartPage.proceedToCheckout();
    });

    await test.step("E: Preencho os dados de entrega dinâmicos", async () => {
      await checkoutPage.fillInformation(firstName, lastName, postalCode);
    });

    await test.step("Então: Finalizo o pedido e vejo a confirmação", async () => {
      await checkoutPage.finishCheckout();
      await checkoutPage.validateOrderComplete();
    });
  });

  test("Cenário Exceção - Deve falhar o checkout com campos de entrega incompletos", async () => {
    await test.step("Dado: Que o login é feito com sucesso", async () => {
      await loginPage.performLogin(VALID_USERNAME, VALID_PASSWORD);
    });

    await test.step("Quando: Adiciono item e tento continuar sem o CEP", async () => {
      await inventoryPage.addItemToCart("Sauce Labs Backpack");
      await inventoryPage.goToCart();
      await cartPage.proceedToCheckout();
      await checkoutPage.fillInformation(
        faker.person.firstName(),
        faker.person.lastName(),
        ""
      );
    });

    await test.step("Então: Deve exibir a mensagem de erro de CEP obrigatório", async () => {
      await checkoutPage.validateErrorMessage("Error: Postal Code is required");
    });
  });
});