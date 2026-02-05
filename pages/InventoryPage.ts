import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePages";
import { AIService } from "../services/AIService";

export class InventoryPage extends BasePage {
  // Seletores
  private readonly inventoryContainer = "#inventory_container";
  private readonly cartIcon = ".shopping_cart_link";
  private readonly cartBadge = ".shopping_cart_badge"; // 🔴 NOVO SELETOR
  private readonly inventoryItem = ".inventory_item";
  private readonly inventoryItemName = ".inventory_item_name";
  private readonly inventoryItemDesc = ".inventory_item_desc";
  private readonly inventoryItemPrice = ".inventory_item_price";
  private readonly sortDropdown = ".product_sort_container";
  // ... (outros seletores de footer mantidos)
  private readonly title = ".title";
  private readonly hamburgerMenu = "#react-burger-menu-btn";
  private readonly footer = "footer.footer";
  private readonly footerTwitter = "a[href*='twitter.com']";
  private readonly footerFacebook = "a[href*='facebook.com']";
  private readonly footerLinkedIn = "a[href*='linkedin.com']";
  private readonly footerCopy = ".footer_copy";

  constructor(page: Page, ai: AIService) {
    super(page, ai);
  }

  // ⚓ MÉTODO DE ÂNCORA
  async waitInventoryLoad() {
    await this.page.waitForSelector(this.inventoryContainer, { state: 'visible', timeout: 10000 });
  }

  // --- AÇÃO: ADICIONAR AO CARRINHO (BLINDADO) ---
  async addItemToCart(productName: string) {
    console.log(`[Inventory] Adicionando '${productName}' ao carrinho...`);
    const item = this.page.locator(this.inventoryItem, { hasText: productName });
    await expect(item).toBeVisible();
    
    const addToCartBtn = item.locator("button[id^='add-to-cart']");
    await addToCartBtn.click();

    // 🛑 SINCRONIA: Espera a bolinha vermelha aparecer antes de prosseguir!
    // Isso garante que o site registrou a ação e está pronto para navegar.
    console.log("[Inventory] Aguardando confirmação visual (badge)...");
    await this.page.waitForSelector(this.cartBadge, { state: 'visible', timeout: 5000 });
  }

  // --- AÇÃO: IR PARA O CARRINHO (COM DEBUG) ---
  async goToCart() {
    console.log("[Inventory] Navegando para o Carrinho...");
    
    // Usamos force: true para garantir o clique mesmo se houver animação sobrepondo
    await this.page.locator(this.cartIcon).click({ force: true });
    
    console.log("[Inventory] Aguardando URL do carrinho...");
    await this.page.waitForURL(/.*cart\.html/, { timeout: 10000 });
    
    await this.page.waitForSelector(".cart_list", { state: 'visible' });
    console.log("[Inventory] Carrinho carregado com sucesso!");
  }

  // --- RESTO DOS MÉTODOS (Mantidos iguais) ---
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

  async validateProductCount(count: number) {
    const items = await this.page.locator(this.inventoryItem).count();
    expect(items).toBe(count);
  }

  async validateImagesLoad() {
    const images = await this.page.locator(".inventory_item_img img").all();
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
    const texts = await Promise.all(buttons.map(b => b.innerText()));
    texts.forEach(t => expect(t.toLowerCase()).toBe(buttonText.toLowerCase()));
  }

  async validateSpecificProducts(productsData: string[][]) {
    for (const [name, price] of productsData) {
        const item = this.page.locator(this.inventoryItem, { hasText: name });
        await expect(item).toBeVisible();
        await expect(item.locator(this.inventoryItemPrice)).toHaveText(price);
    }
  }

  async validateSortOptions(expectedOptions: string[]) {
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