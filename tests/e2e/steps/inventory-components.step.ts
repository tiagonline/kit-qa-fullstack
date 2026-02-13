import { Given, When, Then, DataTable } from "@cucumber/cucumber";
import { PageManager } from "../../../pages/PageManager";
import { expect } from "@playwright/test";

Given("que estou logado no sistema", async function () {
  if (!this.pageManager) this.pageManager = new PageManager(this.page);
  await this.pageManager.login.navigate();
  await this.pageManager.login.performLogin("standard_user", "secret_sauce");
});

Given("estou na página de inventário", async function () {
  // 1. Valida a URL (Rápido)
  await expect(this.page).toHaveURL(/.*inventory\.html/);

  // 2. Garante que a grade de produtos carregou antes de prosseguir.
  // Isso evita que os próximos passos fiquem "girando em falso".
  await this.pageManager.inventory.waitInventoryLoad();
});

// --- CENÁRIO: COMPONENTES PRINCIPAIS ---

Then("devo ver o título {string}", async function (titulo) {
  await this.pageManager.inventory.validateTitle(titulo);
});

Then("devo ver o menu hamburguer", async function () {
  await this.pageManager.inventory.validateHamburgerMenu();
});

Then("devo ver o carrinho de compras", async function () {
  await this.pageManager.inventory.validateCartIcon();
});

Then("devo ver o filtro de ordenação", async function () {
  await this.pageManager.inventory.validateSortDropdownVisible();
});

Then("devo ver o rodapé com links sociais", async function () {
  await this.pageManager.inventory.validateFooterVisible();
});

// --- CENÁRIO: LISTA DE PRODUTOS ---

Then("devo ver {int} produtos na lista", async function (qtd) {
  await this.pageManager.inventory.validateProductCount(qtd);
});

Then("cada produto deve ter uma imagem", async function () {
  await this.pageManager.inventory.validateImagesLoad();
});

Then("cada produto deve ter um nome", async function () {
  await this.pageManager.inventory.validateProductNames();
});

Then("cada produto deve ter uma descrição", async function () {
  await this.pageManager.inventory.validateProductDescriptions();
});

Then("cada produto deve ter um preço", async function () {
  await this.pageManager.inventory.validateProductPrices();
});

Then("cada produto deve ter um botão {string}", async function (btnText) {
  await this.pageManager.inventory.validateProductButtons(btnText);
});

// --- CENÁRIO: PRODUTOS ESPECÍFICOS (DATA TABLE) ---

Then("devo ver os seguintes produtos:", async function (dataTable: DataTable) {
  // Converte a tabela do Cucumber para array de arrays [['Nome', 'Preço'], ...]
  const products = dataTable.rows();
  await this.pageManager.inventory.validateSpecificProducts(products);
});

// --- CENÁRIO: ORDENAÇÃO E RODAPÉ ---

Then(
  "devo ver as seguintes opções de ordenação:",
  async function (dataTable: DataTable) {
    const options = dataTable.raw().flat();
    await this.pageManager.inventory.validateSortOptions(options);
  },
);

Then("devo ver o link do Twitter no rodapé", async function () {
  await this.pageManager.inventory.validateSocialLink("Twitter");
});

Then("devo ver o link do Facebook no rodapé", async function () {
  await this.pageManager.inventory.validateSocialLink("Facebook");
});

Then("devo ver o link do LinkedIn no rodapé", async function () {
  await this.pageManager.inventory.validateSocialLink("LinkedIn");
});

Then("devo ver o texto de copyright", async function () {
  await this.pageManager.inventory.validateFooterCopy();
});
