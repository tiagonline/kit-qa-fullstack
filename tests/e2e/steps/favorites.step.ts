import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';

Given('que estou logado na loja', async function () {
  this.pageManager = new PageManager(this.page);
  // Atualizado: goto() -> navigate()
  await this.pageManager.login.navigate();
  // Atualizado: login() -> performLogin()
  await this.pageManager.login.performLogin('standard_user', 'secret_sauce');
});

When('eu adiciono o produto {string} aos favoritos', async function (produto) {
  // O inventário não mudou, então continua igual
  await this.pageManager.inventory.addToCart(produto); 
});

Then('o botão do produto deve mudar para {string}', async function (textoBotao) {
  // Validação simples de texto no botão (Remove)
  const button = this.page.locator(`[data-test="remove-${textoBotao.toLowerCase().replace(/ /g, '-')}"]`);
  await expect(button).toBeVisible();
});