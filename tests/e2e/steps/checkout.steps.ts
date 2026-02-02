import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';

Given('que tenho produtos no carrinho', async function () {
  this.pageManager = new PageManager(this.page);
  await this.pageManager.login.navigate();
  await this.pageManager.login.performLogin('standard_user', 'secret_sauce');
  await this.pageManager.inventory.addToCart('Sauce Labs Backpack');
  await this.pageManager.inventory.goToCart();
});

Given('que estou na página de checkout', async function () {
  await this.pageManager.cart.goToCheckout();
});

When('eu preencho os dados de entrega corretamente', async function () {
  await this.pageManager.checkout.fillInformation('Tiago', 'Tester', '12345678');
});

When('finalizo a compra', async function () {
  await this.pageManager.checkout.finishCheckout();
});

Then('devo ver a mensagem de sucesso {string}', async function (mensagem) {
  await this.pageManager.checkout.validateOrderComplete(mensagem);
});

When('tento continuar sem preencher os dados', async function () {
  await this.page.locator('[data-test="continue"]').click();
});

Then('devo ver a mensagem de erro no checkout {string}', async function (mensagem) {
  const error = this.page.locator('[data-test="error"]');
  await expect(error).toContainText(mensagem);
});