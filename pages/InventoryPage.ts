import { type Locator, type Page, expect } from "@playwright/test";

export class InventoryPage {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly productsTitle: Locator;
  readonly menuButton: Locator;
  readonly sortDropdown: Locator;
  readonly productItems: Locator;
  readonly footer: Locator;
  readonly twitterLink: Locator;
  readonly facebookLink: Locator;
  readonly linkedinLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.productsTitle = page.locator('.title');
    this.menuButton = page.locator('#react-burger-menu-btn');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.productItems = page.locator('.inventory_item');
    this.footer = page.locator('footer');
    this.twitterLink = page.locator('a[href*="twitter"]');
    this.facebookLink = page.locator('a[href*="facebook"]');
    this.linkedinLink = page.locator('a[href*="linkedin"]');
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

  /**
   * Valida se o título "Products" está visível
   */
  async validateProductsTitle() {
    await expect(this.productsTitle).toBeVisible();
    await expect(this.productsTitle).toHaveText('Products');
  }

  /**
   * Valida se o menu hamburguer está visível
   */
  async validateMenuButton() {
    await expect(this.menuButton).toBeVisible();
  }

  /**
   * Valida se o carrinho de compras está visível
   */
  async validateCartLink() {
    await expect(this.cartLink).toBeVisible();
  }

  /**
   * Valida se o filtro de ordenação está visível
   */
  async validateSortDropdown() {
    await expect(this.sortDropdown).toBeVisible();
  }

  /**
   * Valida se o rodapé está visível
   */
  async validateFooter() {
    await expect(this.footer).toBeVisible();
  }

  /**
   * Retorna a contagem de produtos na página
   */
  async getProductCount(): Promise<number> {
    return await this.productItems.count();
  }

  /**
   * Valida que cada produto tem imagem, nome, descrição, preço e botão
   */
  async validateProductComponents() {
    const count = await this.getProductCount();
    for (let i = 0; i < count; i++) {
      const product = this.productItems.nth(i);
      await expect(product.locator('img')).toBeVisible();
      await expect(product.locator('.inventory_item_name')).toBeVisible();
      await expect(product.locator('.inventory_item_desc')).toBeVisible();
      await expect(product.locator('.inventory_item_price')).toBeVisible();
      await expect(product.locator('button')).toBeVisible();
    }
  }

  /**
   * Valida as opções disponíveis no dropdown de ordenação
   */
  async validateSortOptions(expectedOptions: string[]) {
    const options = this.sortDropdown.locator('option');
    const count = await options.count();
    expect(count).toBe(expectedOptions.length);
    
    for (let i = 0; i < count; i++) {
      const optionText = await options.nth(i).textContent();
      expect(expectedOptions).toContain(optionText);
    }
  }

  /**
   * Valida se um produto específico está visível com o preço correto
   */
  async validateProduct(productName: string, price: string) {
    const product = this.page.locator('.inventory_item', { hasText: productName });
    await expect(product).toBeVisible();
    await expect(product.locator('.inventory_item_price')).toHaveText(price);
  }

  /**
   * Valida os links sociais no rodapé
   */
  async validateSocialLinks() {
    await expect(this.twitterLink).toBeVisible();
    await expect(this.facebookLink).toBeVisible();
    await expect(this.linkedinLink).toBeVisible();
  }

  /**
   * Valida o texto de copyright no rodapé
   */
  async validateCopyrightText() {
    const copyrightText = this.footer.locator('.footer_copy');
    await expect(copyrightText).toBeVisible();
    await expect(copyrightText).toContainText('© 2026 Sauce Labs');
  }
}