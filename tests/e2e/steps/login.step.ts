import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';
// Não precisa carregar dotenv aqui de novo, o hooks.ts já fez isso globalmente!

Given('que estou na página de login', async function () {
  if (!this.pageManager) this.pageManager = new PageManager(this.page);
  
  // AQUI acontece a navegação. Única e exclusivamente aqui.
  await this.pageManager.login.navigate();
});

When('preencho as credenciais válidas', async function () {
  // O Hook já garantiu que as variáveis existem, mas o trim() é uma boa prática
  const username = process.env.SAUCE_USERNAME?.trim() || "standard_user";
  const password = process.env.SAUCE_PASSWORD?.trim() || "secret_sauce";
  
  // Chama o método que SÓ preenche, sem recarregar a página
  await this.pageManager.login.performLogin(username, password);
});

When('tento logar com usuario {string} e senha {string}', async function (usuario, senha) {
  if (!this.pageManager) this.pageManager = new PageManager(this.page);
  
  await this.pageManager.login.performLogin(usuario, senha);
});

Then('devo ver a mensagem de erro {string}', async function (mensagem) {
  await this.pageManager.login.validateErrorMessage(mensagem);
});

Then('devo ser redirecionado para a vitrine de produtos', async function () {
  // Aumentei o timeout para 10s caso a rede esteja lenta no redirecionamento
  await expect(this.page).toHaveURL(/.*inventory\.html/, { timeout: 10000 });
});