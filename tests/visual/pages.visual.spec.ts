import { test, expect } from '@playwright/test';
import { PageManager } from '../../pages/PageManager';
import * as dotenv from 'dotenv';

// Carrega variáveis (caso precise rodar isolado)
dotenv.config();

test.describe('Regressão Visual', () => {
  let pageManager: PageManager;

  test.beforeEach(async ({ page }) => {
    pageManager = new PageManager(page);
  });

  test('Deve garantir o layout da Login Page', async ({ page }) => {
    await pageManager.login.navigate();
    
    // Tira um print e compara com o "baseline" (imagem de referência)
    // fullPage: true garante que pegue a página inteira, não só o viewport
    await expect(page).toHaveScreenshot('login-page.png', { fullPage: true });
  });

  test('Deve garantir o layout do Inventário', async ({ page }) => {
    await pageManager.login.navigate();
    await pageManager.login.performLogin('standard_user', 'secret_sauce');
    
    // Aguarda o inventário carregar
    await expect(page).toHaveURL(/.*inventory\.html/);
    
    // Snapshot do inventário
    await expect(page).toHaveScreenshot('inventory-page.png', { fullPage: true });
  });
});