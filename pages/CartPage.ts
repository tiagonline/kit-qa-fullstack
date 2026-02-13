import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePages";
import { AIService } from "../services/AIService";

export class CartPage extends BasePage {
  private readonly checkoutButton = "#checkout";
  private readonly cartItem = ".cart_item";
  private readonly continueShoppingButton = "#continue-shopping";

  constructor(page: Page, ai: AIService) {
    super(page, ai);
  }

  async validateItemInCart(productName: string) {
    console.log(`[Cart] Validando presença de '${productName}'...`);
    const item = this.page.locator(this.cartItem, { hasText: productName });
    await expect(item).toBeVisible();
  }

  async proceedToCheckout() {
    console.log("[Cart] Indo para o Checkout...");
    await this.smartClick(this.checkoutButton, "Botão de Checkout");

    // Espera a página de Step One carregar
    await this.page.waitForURL(/.*checkout-step-one\.html/);
    await this.page.waitForSelector("#checkout_info_container", {
      state: "visible",
    });
  }

  async continueShopping() {
    await this.smartClick(
      this.continueShoppingButton,
      "Botão Continue Shopping",
    );
  }
}
