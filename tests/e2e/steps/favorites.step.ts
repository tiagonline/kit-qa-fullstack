import { When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { PageManager } from "../../../pages/PageManager";

// O passo "Dado que estou logado" é puxado do checkout.steps.ts automaticamente.

When("favoritado o produto {string}", async function (produto) {
  // Como a loja não tem "Favoritos" real, adiciono ao carrinho
  // ou verifico se o botão virou "Remove"
  if (!this.pageManager) this.pageManager = new PageManager(this.page);
  await this.pageManager.inventory.addItemToCart(produto);
});

Then(
  "o ícone de favorito deve estar ativo para o produto {string}",
  async function (produto) {
    // Valido se o botão mudou para "REMOVE", indicando que foi selecionado
    const buttonRemove = this.page.locator(
      `[data-test="remove-${produto.toLowerCase().replace(/ /g, "-")}"]`,
    );
    await expect(buttonRemove).toBeVisible();
  },
);
