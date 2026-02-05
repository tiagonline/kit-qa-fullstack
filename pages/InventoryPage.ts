import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePages";
import { AIService } from "../services/AIService";

export class InventoryPage extends BasePage {
  // Seletores
  private readonly inventoryContainer = "#inventory_container"; // Âncora principal
  private readonly title = ".title";
  private readonly hamburgerMenu = "#react-burger-menu-btn";
  private readonly cartIcon = ".shopping_cart_link";
  private readonly inventoryItem = ".inventory_item";
  private readonly inventoryItemName = ".inventory_item_name";
  private readonly inventoryItemDesc = ".inventory_item_desc";
  private readonly inventoryItemPrice = ".inventory_item_price";
  private readonly sortDropdown = ".product_sort_container";
  private readonly footer = "footer.footer";
  private readonly footerTwitter = "a[href*='twitter.com']";
  private readonly footerFacebook = "a[href*='facebook.com']";
  private readonly footerLinkedIn = "a[href*='linkedin.com']";
  private readonly footerCopy = ".footer_copy";

  constructor(page: Page, ai: AIService) {
    super(page, ai);
  }

  // ⚓ MÉTODO NOVO: Espera a página estar 100% pronta
  async waitInventoryLoad() {
    // Espera explícita pelo container principal. Isso evita "flakiness" nos passos seguintes.
    await this.page.waitForSelector(this.inventoryContainer, { state: 'visible', timeout: 10000 });
  }

  // --- COMPONENTES PRINCIPAIS (Cenário 1) ---
  
  async validateTitle(expectedTitle: string) {
    await expect(this.page.locator(this.title)).toHaveText(expectedTitle);
  }

  async validateHamburgerMenu() {
    await expect(this.page.locator(this.hamburgerMenu)).toBeVisible();
  }

  async validateCartIcon() {
    await expect(this.page.locator(this.cartIcon)).toBeVisible();
  }

  async validateSortDropdownVisible() {
    await expect(this.page.locator(this.sortDropdown)).toBeVisible();
  }

  async validateFooterVisible() {
    await expect(this.page.locator(this.footer)).toBeVisible();
  }

  // --- LISTA DE PRODUTOS (Cenário 2) ---

  async validateProductCount(count: number) {
    const items = await this.page.locator(this.inventoryItem).count();
    expect(items).toBe(count);
  }

  async validateImagesLoad() {
    const images = await this.page.locator(".inventory_item_img img").all();
    
    // 🚀 PERFORMANCE: Valida todas as imagens em PARALELO (Promise.all)
    // Antes: Valida 1.. espera.. Valida 2.. espera.. (Lento)
    // Agora: Valida 1, 2, 3, 4, 5, 6 ao mesmo tempo! (Rápido)
    await Promise.all(images.map(async (img) => {
       const src = await img.getAttribute("src");
       expect(src).toBeTruthy();
       await expect(img).toBeVisible();
    }));
  }

  async validateProductNames() {
    const names = await this.page.locator(this.inventoryItemName).allInnerTexts();
    expect(names.length).toBeGreaterThan(0);
    names.forEach(name => expect(name.trim()).not.toBe(""));
  }

  async validateProductDescriptions() {
    const descs = await this.page.locator(this.inventoryItemDesc).allInnerTexts();
    expect(descs.length).toBeGreaterThan(0);
  }

  async validateProductPrices() {
    const prices = await this.page.locator(this.inventoryItemPrice).allInnerTexts();
    expect(prices.length).toBeGreaterThan(0);
    prices.forEach(price => expect(price).toMatch(/\$\d+\.\d{2}/));
  }

  async validateProductButtons(buttonText: string) {
    const buttons = await this.page.locator(".btn_inventory").all();
    // Validação rápida de texto
    const texts = await Promise.all(buttons.map(b => b.innerText()));
    texts.forEach(t => expect(t.toLowerCase()).toBe(buttonText.toLowerCase()));
  }

  // --- TABELA DE DADOS (Cenário 3) ---
  async validateSpecificProducts(productsData: string[][]) {
    for (const [name, price] of productsData) {
        const item = this.page.locator(this.inventoryItem, { hasText: name });
        await expect(item).toBeVisible();
        await expect(item.locator(this.inventoryItemPrice)).toHaveText(price);
    }
  }

  // --- RODAPÉ ---

  async validateSortOptions(expectedOptions: string[]) {
    // Clica no dropdown para forçar renderização das opções (hack para Webkit/Firefox as vezes)
    // Mas no Chrome só ler o texto funciona.
    const options = await this.page.locator(`${this.sortDropdown} option`).allInnerTexts();
    expectedOptions.forEach(opt => {
        expect(options.some(o => o.trim() === opt.trim())).toBeTruthy();
    });
  }

  async validateSocialLink(network: 'Twitter' | 'Facebook' | 'LinkedIn') {
    const selector = network === 'Twitter' ? this.footerTwitter :
                     network === 'Facebook' ? this.footerFacebook : this.footerLinkedIn;
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async validateFooterCopy() {
    await expect(this.page.locator(this.footerCopy)).toBeVisible();
    await expect(this.page.locator(this.footerCopy)).toContainText("Sauce Labs");
  }
}