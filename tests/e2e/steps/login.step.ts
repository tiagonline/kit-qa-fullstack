import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'envs/.env.dev') });

Given('que estou na página de login', async function () {
  // Garante que o PageManager está instanciado (caso o hook falhe ou para segurança)
  if (!this.pageManager) this.pageManager = new PageManager(this.page);
  
  await this.pageManager.login.navigate();
});

When('preencho as credenciais válidas', async function () {
  const username = process.env.SAUCE_USERNAME?.trim();
  const password = process.env.SAUCE_PASSWORD?.trim();
  
  await this.pageManager.login.performLogin(username!, password!);
});

When('tento logar com usuario {string} e senha {string}', async function (usuario, senha) {
  if (!this.pageManager) this.pageManager = new PageManager(this.page);
  
  await this.pageManager.login.performLogin(usuario, senha);
});

Then('devo ver a mensagem de erro {string}', async function (mensagem) {
  await this.pageManager.login.validateErrorMessage(mensagem);
});

Then('devo ser redirecionado para a vitrine de produtos', async function () {
  await expect(this.page).toHaveURL(/.*inventory\.html/, { timeout: 10000 });
});