// POC - Criado com Playwright MCP
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'envs/.env.dev') });

Given('que estou logado no sistema', async function () {
  // Garante que o PageManager está instanciado
  if (!this.pageManager) this.pageManager = new PageManager(this.page);
  
  // Navega para página de login
  await this.pageManager.login.navigate();
  
  // Realiza o login
  const username = process.env.SAUCE_USERNAME?.trim();
  const password = process.env.SAUCE_PASSWORD?.trim();
  await this.pageManager.login.performLogin(username!, password!);
});

Given('estou na página de inventário', async function () {
  // Verifica se está na página de inventário
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

Then('cada produto deve ter uma imagem', async function () {
  const count = await this.pageManager.inventory.getProductCount();
  for (let i = 0; i < count; i++) {
    const product = this.pageManager.inventory.productItems.nth(i);
    await expect(product.locator('img')).toBeVisible();
  }
});

Then('cada produto deve ter um nome', async function () {
  const count = await this.pageManager.inventory.getProductCount();
  for (let i = 0; i < count; i++) {
    const product = this.pageManager.inventory.productItems.nth(i);
    await expect(product.locator('.inventory_item_name')).toBeVisible();
  }
});

Then('cada produto deve ter uma descrição', async function () {
  const count = await this.pageManager.inventory.getProductCount();
  for (let i = 0; i < count; i++) {
    const product = this.pageManager.inventory.productItems.nth(i);
    await expect(product.locator('.inventory_item_desc')).toBeVisible();
  }
});

Then('cada produto deve ter um preço', async function () {
  const count = await this.pageManager.inventory.getProductCount();
  for (let i = 0; i < count; i++) {
    const product = this.pageManager.inventory.productItems.nth(i);
    await expect(product.locator('.inventory_item_price')).toBeVisible();
  }
});

Then('cada produto deve ter um botão {string}', async function (buttonText: string) {
  const count = await this.pageManager.inventory.getProductCount();
  for (let i = 0; i < count; i++) {
    const product = this.pageManager.inventory.productItems.nth(i);
    const button = product.locator('button');
    await expect(button).toBeVisible();
    const text = await button.textContent();
    expect(text?.toLowerCase()).toContain('add to cart');
  }
});

Then('devo ver as seguintes opções de ordenação:', async function (dataTable) {
  const expectedOptions = dataTable.raw().flat();
  await this.pageManager.inventory.validateSortOptions(expectedOptions);
});

Then('devo ver os seguintes produtos:', async function (dataTable) {
  const products = dataTable.hashes();
  
  for (const product of products) {
    const productName = Object.keys(product)[0];
    const price = product[productName];
    await this.pageManager.inventory.validateProduct(productName, price);
  }
});

Then('devo ver o link do Twitter no rodapé', async function () {
  await expect(this.pageManager.inventory.twitterLink).toBeVisible();
});

Then('devo ver o link do Facebook no rodapé', async function () {
  await expect(this.pageManager.inventory.facebookLink).toBeVisible();
});

Then('devo ver o link do LinkedIn no rodapé', async function () {
  await expect(this.pageManager.inventory.linkedinLink).toBeVisible();
});

Then('devo ver o texto de copyright', async function () {
  await this.pageManager.inventory.validateCopyrightText();
});
