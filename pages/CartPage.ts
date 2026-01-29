import { type Locator, type Page } from "@playwright/test";
export class CartPage {
  readonly page: Page;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }
  async proceedToCheckout() {
    await this.checkoutButton.click();
  }
}
