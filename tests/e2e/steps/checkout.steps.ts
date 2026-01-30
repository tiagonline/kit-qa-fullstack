import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { ICustomWorld } from '../support/world';

Given('que estou logado', async function (this: ICustomWorld) {
  await this.pageManager.login.navigate();
  
  // CORREÇÃO: Busca do ENV. Se não achar, falha o teste imediatamente.
  const username = process.env.SAUCE_USERNAME;
  const password = process.env.SAUCE_PASSWORD;

  if (!username || !password) {
    throw new Error("❌ Credenciais de ambiente (SAUCE_USERNAME/PASSWORD) não configuradas!");
  }

  // Login limpo, sem expor dados no código
  await this.pageManager.login.performLogin(username, password);
});

When('adicionei o produto {string} ao carrinho', async function (this: ICustomWorld, produtoNome: string) {
  await this.pageManager.inventory.addItemToCart(produtoNome);
});

When('acesso o carrinho', async function (this: ICustomWorld) {
  await this.pageManager.inventory.goToCart();
});

When('prossigo para o checkout', async function (this: ICustomWorld) {
  await this.pageManager.cart.proceedToCheckout();
});

When('preencho os dados de entrega corretamente', async function (this: ICustomWorld) {
  // Data Fuzzing com Faker para garantir robustez
  await this.pageManager.checkout.fillInformation(
    faker.person.firstName(),
    faker.person.lastName(),
    faker.location.zipCode()
  );
});

When('finalizo a compra', async function (this: ICustomWorld) {
  await this.pageManager.checkout.finishCheckout();
});

Then('devo ver a mensagem de confirmação {string}', async function (this: ICustomWorld, mensagem: string) {
  await this.pageManager.checkout.validateOrderComplete();
  const header = this.page.locator('.complete-header');
  await expect(header).toContainText(mensagem);
});

When('tento continuar sem preencher o formulário', async function (this: ICustomWorld) {
  await this.pageManager.checkout.submitCheckout();
});

Then('devo ver a mensagem de erro no checkout {string}', async function (this: ICustomWorld, msgErro: string) {
  await this.pageManager.checkout.validateErrorMessage(msgErro);
});