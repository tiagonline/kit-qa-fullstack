import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';

Given('que estou na página de login', async function () {
  if (!this.pageManager) this.pageManager = new PageManager(this.page);
  await this.pageManager.login.navigate();
});

// --- FLUXO POSITIVO ---
When('preencho as credenciais válidas', async function () {
  const user = process.env.STANDARD_USER || "standard_user";
  const pass = process.env.SECRET_SAUCE || "secret_sauce";
  
  // O parametro 'true' já faz um wait interno, mas o Step 'Então' fará a validação final
  await this.pageManager.login.performLogin(user, pass, true);
});

When('realizo login com {string} e {string}', async function (usuario, senha) {
  await this.pageManager.login.performLogin(usuario, senha, true);
});

Then('devo ser redirecionado para a vitrine de produtos', async function () {
  console.log('[Step] Validando redirecionamento para Vitrine...');
  // Garante que a URL mudou para /inventory.html
  await expect(this.page).toHaveURL(/.*inventory\.html/, { timeout: 10000 });
});

// --- FLUXO NEGATIVO ---
When('tento logar com usuario {string} e senha {string}', async function (usuario, senha) {
  console.log(`[Step] Executando login negativo para: ${usuario}`);
  // Passo 'false' para não travar esperando o inventário
  await this.pageManager.login.performLogin(usuario, senha, false);
});

Then('devo ver a mensagem de erro {string}', async function (mensagem) {
  await this.pageManager.login.validateErrorMessage(mensagem);
});