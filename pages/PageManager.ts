//Este arquivo centraliza a gestão das páginas, fornecendo acesso fácil e organizado a cada uma delas.

import { Page } from "@playwright/test";
import { LoginPage } from "./LoginPage";
import { InventoryPage } from "./InventoryPage";
import { CartPage } from "./CartPage";
import { CheckoutPage } from "./CheckoutPage";

export class PageManager {
  private readonly page: Page;
  private loginPage?: LoginPage;
  private inventoryPage?: InventoryPage;
  private cartPage?: CartPage;
  private checkoutPage?: CheckoutPage;

  constructor(page: Page) {
    this.page = page;
  }

  public get login() {
    return this.loginPage ?? (this.loginPage = new LoginPage(this.page));
  }

  public get inventory() {
    return this.inventoryPage ?? (this.inventoryPage = new InventoryPage(this.page));
  }

  public get cart() {
    return this.cartPage ?? (this.cartPage = new CartPage(this.page));
  }

  public get checkout() {
    return this.checkoutPage ?? (this.checkoutPage = new CheckoutPage(this.page));
  }
}