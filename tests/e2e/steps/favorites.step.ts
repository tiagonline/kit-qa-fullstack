import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';

Given('que estou logado na loja', async function () {
  this.pageManager = new PageManager(this.page);
  await this.pageManager.login.navigate();
  await this.pageManager.login.performLogin('standard_user', 'secret_sauce');
});

When('eu adiciono o produto {string} aos favoritos', async function (produto) {
  await this.pageManager.inventory.addToCart(produto); 
});

Then('o botão do produto deve mudar para {string}', async function (textoBotao) {
  const button = this.page.locator(`[data-test="remove-${textoBotao.toLowerCase().replace(/ /g, '-')}"]`);
  await expect(button).toBeVisible();
});