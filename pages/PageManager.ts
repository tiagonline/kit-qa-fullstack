import { Page } from "@playwright/test";
import { AIService } from "../services/AIService";
import { LoginPage } from "./LoginPage";
import { InventoryPage } from "./InventoryPage";
import { CartPage } from "./CartPage";
import { CheckoutPage } from "./CheckoutPage";

export class PageManager {
  private readonly page: Page;
  private readonly _ai: AIService;

  // Instâncias privadas para o Lazy Loading
  private loginPage?: LoginPage;
  private inventoryPage?: InventoryPage;
  private cartPage?: CartPage;
  private checkoutPage?: CheckoutPage;

  // 📎 Armazena a função de anexo do Allure para injetar nas páginas quando forem criadas
  private attachFn?: (content: string, type: string) => void;

  constructor(page: Page) {
    this.page = page;
    this._ai = new AIService();
  }

  public get ai() {
    return this._ai;
  }

  // Recebe o 'attach' do Cucumber (do hooks.ts)
  public setAllureAttach(fn: (content: string, type: string) => void) {
    this.attachFn = fn;

    // Se alguma página já tiver sido instanciada antes disso, atualiza ela
    if (this.loginPage) this.loginPage.setAttachFunction(fn);
    if (this.inventoryPage) this.inventoryPage.setAttachFunction(fn);
    if (this.cartPage) this.cartPage.setAttachFunction(fn);
    if (this.checkoutPage) this.checkoutPage.setAttachFunction(fn);
  }

  // --- GETTERS (Com injeção automática do attachFn) ---

  public get login() {
    if (!this.loginPage) {
      this.loginPage = new LoginPage(this.page, this._ai);
      // Se já temos a função de anexo salva, injetamos na página nova
      if (this.attachFn) this.loginPage.setAttachFunction(this.attachFn);
    }
    return this.loginPage;
  }

  public get inventory() {
    if (!this.inventoryPage) {
      this.inventoryPage = new InventoryPage(this.page, this._ai);
      if (this.attachFn) this.inventoryPage.setAttachFunction(this.attachFn);
    }
    return this.inventoryPage;
  }

  public get cart() {
    if (!this.cartPage) {
      this.cartPage = new CartPage(this.page, this._ai);
      if (this.attachFn) this.cartPage.setAttachFunction(this.attachFn);
    }
    return this.cartPage;
  }

  public get checkout() {
    if (!this.checkoutPage) {
      this.checkoutPage = new CheckoutPage(this.page, this._ai);
      if (this.attachFn) this.checkoutPage.setAttachFunction(this.attachFn);
    }
    return this.checkoutPage;
  }
}
