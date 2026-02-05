import { Page } from "@playwright/test";
import { AIService } from "../services/AIService";
import { LoginPage } from "./LoginPage";
import { InventoryPage } from "./InventoryPage";
import { CartPage } from "./CartPage";
import { CheckoutPage } from "./CheckoutPage";

export class PageManager {
  private readonly page: Page;
  private readonly _ai: AIService;
  private loginPage?: LoginPage;
  private inventoryPage?: InventoryPage;
  private cartPage?: CartPage;
  private checkoutPage?: CheckoutPage;

  constructor(page: Page) {
    this.page = page;
    // Eu inicializo a IA uma única vez para economizar recursos
    this._ai = new AIService();
  }

  public get ai() {
    return this._ai;
  }

  public get login() {
    return this.loginPage ?? (this.loginPage = new LoginPage(this.page, this._ai));
  }

  public get inventory() {
    return this.inventoryPage ?? (this.inventoryPage = new InventoryPage(this.page, this._ai));
  }

  public get cart() {
    return this.cartPage ?? (this.cartPage = new CartPage(this.page, this._ai));
  }

  public get checkout() {
    return this.checkoutPage ?? (this.checkoutPage = new CheckoutPage(this.page, this._ai));
  }
}