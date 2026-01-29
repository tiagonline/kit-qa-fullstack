import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';
import { faker } from '@faker-js/faker';

Given('que estou logado', async function () {
  this.pageManager = new PageManager(this.page);
  await this.pageManager.login.goto();
  await this.pageManager.login.login("standard_user", "secret_sauce");
});

When('adicionei o produto {string} ao carrinho', async function (produtoNome) {
  await this.pageManager.inventory.addItemToCart(produtoNome);
});

When('acesso o carrinho', async function () {
  await this.pageManager.inventory.goToCart();
});

When('prossigo para o checkout', async function () {
  await this.pageManager.cart.proceedToCheckout();
});

When('preencho os dados de entrega corretamente', async function () {
  await this.pageManager.checkout.fillInformation(
    faker.person.firstName(),
    faker.person.lastName(),
    faker.location.zipCode()
  );
});

When('finalizo a compra', async function () {
  await this.pageManager.checkout.finishCheckout();
});

Then('devo ver a mensagem de confirmação {string}', async function (mensagem) {
  await this.pageManager.checkout.validateOrderComplete();
  const header = this.page.locator('.complete-header');
  await expect(header).toContainText(mensagem);
});

When('tento continuar sem preencher o formulário', async function () {
  await this.page.locator('[data-test="continue"]').click();
});

Then('devo ver a mensagem de erro no checkout {string}', async function (msgErro) {
  const locatorErro = this.page.locator('[data-test="error"]');
  await expect(locatorErro).toContainText(msgErro);
});