import { Given, When, Then } from '@cucumber/cucumber';
import { PageManager } from '../../../pages/PageManager';
import { expect } from '@playwright/test';

// Reaproveita PageManager
Given('adicionei o produto {string} ao carrinho', async function (produto) {
  await this.pageManager.inventory.addItemToCart(produto);
});

When('acesso o carrinho', async function () {
  // Agora chama o método goToCart que criamos no InventoryPage
  await this.pageManager.inventory.goToCart();
});

When('prossigo para o checkout', async function () {
  // Agora chama o método proceedToCheckout que criamos no CartPage
  await this.pageManager.cart.proceedToCheckout();
});

When('tento continuar sem preencher o formulário', async function () {
  // Isso pertence à CheckoutPage (vamos garantir que ela existe depois, mas o passo é esse)
  await this.pageManager.checkout.clickContinue();
});

Then('devo ver a mensagem de erro no checkout {string}', async function (msg) {
  await this.pageManager.checkout.validateErrorMessage(msg);
});