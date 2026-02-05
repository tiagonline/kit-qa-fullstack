// POC - Criado com Playwright MCP
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'envs/.env.dev') });

Given('que estou logado no sistema', async function () {
  if (!this.pageManager) this.pageManager = new PageManager(this.page);
  await this.pageManager.login.navigate();
  
  const username = process.env.SAUCE_USERNAME?.trim();
  const password = process.env.SAUCE_PASSWORD?.trim();
  await this.pageManager.login.performLogin(username!, password!);
});

Given('estou na página de inventário', async function () {
  await expect(this.page).toHaveURL(/.*inventory\.html/, { timeout: 10000 });
});

Then('devo ver o título {string}', async function (titulo: string) {
  await expect(this.pageManager.inventory.productsTitle).toBeVisible();
  await expect(this.pageManager.inventory.productsTitle).toHaveText(titulo);
});

Then('devo ver o menu hamburguer', async function () {
  await this.pageManager.inventory.validateMenuButton();
});

Then('devo ver o carrinho de compras', async function () {
  await this.pageManager.inventory.validateCartLink();
});

Then('devo ver o filtro de ordenação', async function () {
  await this.pageManager.inventory.validateSortDropdown();
});

Then('devo ver o rodapé com links sociais', async function () {
  await this.pageManager.inventory.validateFooter();
  await this.pageManager.inventory.validateSocialLinks();
});

Then('devo ver {int} produtos na lista', async function (expectedCount: number) {
  const count = await this.pageManager.inventory.getProductCount();
  expect(count).toBe(expectedCount);
});

// Eu ajustei a lógica abaixo para usar localizadores dinâmicos e evitar falhas de comparação
Then('devo ver os seguintes produtos:', async function (dataTable) {
  const products = dataTable.hashes();
  
  for (const product of products) {
    // Eu extraio o nome e o preço tratando qualquer variação de nome de coluna
    const productName = product['Nome'] || Object.values(product)[0] as string;
    const expectedPrice = product['Preço'] || Object.values(product)[1] as string;

    // Eu localizo o container específico do produto para garantir isolamento na busca
    const productItem = this.page.locator('.inventory_item', { hasText: productName });
    await expect(productItem).toBeVisible();
    
    // Eu utilizo toContainText para ser resiliente a caracteres especiais ou espaços
    const priceLocator = productItem.locator('.inventory_item_price');
    await expect(priceLocator).toContainText(expectedPrice.trim());
  }
});

// Outros steps permanecem iguais para garantir a compatibilidade
Then('cada produto deve ter uma imagem', async function () {
  const count = await this.pageManager.inventory.getProductCount();
  for (let i = 0; i < count; i++) {
    await expect(this.pageManager.inventory.productItems.nth(i).locator('img')).toBeVisible();
  }
});

Then('devo ver o link do Twitter no rodapé', async function () {
  await expect(this.pageManager.inventory.twitterLink).toBeVisible();
});

Then('devo ver o texto de copyright', async function () {
  await this.pageManager.inventory.validateCopyrightText();
});