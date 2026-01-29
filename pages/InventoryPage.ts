import { type Locator, type Page, expect } from "@playwright/test";

export class InventoryPage {
  readonly page: Page;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
  }

  /**
   * Adiciona um item ao carrinho com base no nome do produto.
   * Converte o nome para o formato de slug esperado pelo data-test.
   */
  async addItemToCart(itemName: string) {
    const itemSlug = itemName.toLowerCase().replace(/\s/g, "-");
    const itemButtonLocator = this.page.locator(
      `[data-test="add-to-cart-${itemSlug}"]`,
    );
    await itemButtonLocator.click();
  }

  /**
   * Redireciona para a página do carrinho.
   */
  async goToCart() {
    await this.cartLink.click();
  }

  /**
   * Simula a ação de favoritar um produto.
   * No Swag Labs, usamos o botão de adicionar para demonstrar a lógica de reuso.
   */
  async favoritarProduto(nomeProduto: string) {
    // Localiza o item específico pelo texto (nome) e clica no botão contido nele
    const productLocator = this.page.locator('.inventory_item', { hasText: nomeProduto });
    await productLocator.locator('button').click();
  }

  /**
   * Valida se o "favorito" está ativo.
   * Verifica se o botão mudou o texto para "Remove", indicando que a ação foi concluída.
   */
  async validarIconeFavoritoAtivo(nomeProduto: string) {
    const productLocator = this.page.locator('.inventory_item', { hasText: nomeProduto });
    const button = productLocator.locator('button');
    
    // Asserção do Playwright para garantir que o estado do botão mudou
    await expect(button).toHaveText('Remove');
  }
}