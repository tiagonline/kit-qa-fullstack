import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePages";
import { AIService } from "../services/AIService";

export class InventoryPage extends BasePage {
  // Seletores
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

  // --- NOVOS MÉTODOS PARA O PRIMEIRO CENÁRIO ---
  
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

  // --- MÉTODOS DE PRODUTOS ---

  async validateProductCount(count: number) {
    await this.page.waitForSelector(this.inventoryItem, { state: 'visible', timeout: 10000 });
    const items = await this.page.locator(this.inventoryItem).count();
    expect(items).toBe(count);
  }

  async validateImagesLoad() {
    const images = await this.page.locator(".inventory_item_img img").all();
    for (const img of images) {
      const src = await img.getAttribute("src");
      expect(src).toBeTruthy();
      await expect(img).toBeVisible();
    }
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
    for (const button of buttons) {
        const text = await button.innerText();
        expect(text.toLowerCase()).toBe(buttonText.toLowerCase());
    }
  }

  // --- NOVO MÉTODO PARA VALIDAR TABELA DE PRODUTOS ESPECÍFICOS ---
  async validateSpecificProducts(productsData: string[][]) {
    // productsData vem como [['Sauce Labs Backpack', '$29.99'], ...]
    for (const [name, price] of productsData) {
        // Localiza o item que tem esse texto exato
        const item = this.page.locator(this.inventoryItem, { hasText: name });
        await expect(item).toBeVisible();
        
        // Dentro desse item, valida o preço
        const priceEl = item.locator(this.inventoryItemPrice);
        await expect(priceEl).toHaveText(price);
    }
  }

  // --- RODAPÉ E ORDENAÇÃO ---

  async validateSortOptions(expectedOptions: string[]) {
    await this.page.waitForSelector(this.sortDropdown);
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