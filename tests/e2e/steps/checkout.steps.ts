import { Given, When, Then } from '@cucumber/cucumber';

// --- SETUP / LOGIN ---

Given('que estou logado', async function () {
  // Atalho para logar rápido
  await this.pageManager.login.navigate();
  await this.pageManager.login.performLogin("standard_user", "secret_sauce");
});

Given('adicionei o produto {string} ao carrinho', async function (produto) {
  await this.pageManager.inventory.addItemToCart(produto);
});

// --- CARRINHO & CHECKOUT ---

When('acesso o carrinho', async function () {
  await this.pageManager.inventory.goToCart();
});

When('prossigo para o checkout', async function () {
  await this.pageManager.cart.proceedToCheckout();
});

// --- FLUXO NEGATIVO ---

When('tento continuar sem preencher o formulário', async function () {
  await this.pageManager.checkout.clickContinue();
});

Then('devo ver a mensagem de erro no checkout {string}', async function (msg) {
  await this.pageManager.checkout.validateErrorMessage(msg);
});

// --- FLUXO POSITIVO ---

When('preencho os dados de entrega corretamente', async function () {
  // Passamos dados fixos (Hardcoded) pois o passo do Gherkin não enviou parâmetros
  await this.pageManager.checkout.fillCheckoutForm("Tiago", "QA", "12345-678");
});

When('preencho o formulário de checkout com {string}, {string} e {string}', async function (nome, sobrenome, cep) {
  await this.pageManager.checkout.fillCheckoutForm(nome, sobrenome, cep);
});

When('finalizo a compra', async function () {
  await this.pageManager.checkout.clickFinish();
});

Then('devo ver a mensagem de confirmação {string}', async function (msg) {
  await this.pageManager.checkout.validateOrderSuccess(msg);
});