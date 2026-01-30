import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ICustomWorld } from '../support/world';

Given('que estou na página de login', async function (this: ICustomWorld) {
  await this.pageManager.login.navigate();
});

When('preencho as credenciais válidas', async function (this: ICustomWorld) {
  const username = process.env.SAUCE_USERNAME;
  const password = process.env.SAUCE_PASSWORD;

  if (!username || !password) {
    throw new Error("❌ Credenciais não encontradas no .env");
  }

  await this.pageManager.login.performLogin(username, password);
});

// Este step continua recebendo parametros PQ é para testes negativos (ex: usuario bloqueado)
When('tento logar com usuario {string} e senha {string}', async function (this: ICustomWorld, usuario: string, senha: string) {
  await this.pageManager.login.performLogin(usuario, senha);
});

Then('devo ver a mensagem de erro {string}', async function (this: ICustomWorld, mensagem: string) {
  await this.pageManager.login.validateErrorMessage(mensagem);
});

Then('devo ser redirecionado para a vitrine de produtos', async function (this: ICustomWorld) {
  await expect(this.page).toHaveURL(/.*inventory\.html/, { timeout: 10000 });
});