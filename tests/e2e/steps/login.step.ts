import { Given, When, Then } from '@cucumber/cucumber';
import { PageManager } from '../../../pages/PageManager';

Given('que estou na página de login', async function () {
  if (!this.pageManager) this.pageManager = new PageManager(this.page);
  await this.pageManager.login.navigate();
});

// --- FLUXO POSITIVO (FIX: Step Adicionado) ---
When('preencho as credenciais válidas', async function () {
  // Pilar de Arquitetura #1: Zero Hardcoding. Tenta pegar do .env, senão usa fallback.
  const user = process.env.STANDARD_USER || "standard_user";
  const pass = process.env.SECRET_SAUCE || "secret_sauce";
  
  await this.pageManager.login.performLogin(user, pass, true);
});

When('realizo login com {string} e {string}', async function (usuario, senha) {
  await this.pageManager.login.performLogin(usuario, senha, true);
});

// --- FLUXO NEGATIVO ---
When('tento logar com usuario {string} e senha {string}', async function (usuario, senha) {
  console.log(`[Step] Executando login negativo para: ${usuario}`);
  // Passar 'false' para não travar esperando o inventário
  await this.pageManager.login.performLogin(usuario, senha, false);
});

Then('devo ver a mensagem de erro {string}', async function (mensagem) {
  await this.pageManager.login.validateErrorMessage(mensagem);
});