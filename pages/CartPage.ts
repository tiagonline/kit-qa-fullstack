import { type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePages"; // Eu herdo da BasePage para usar o Self-Healing
import { AIService } from "../services/AIService";

export class CartPage extends BasePage {
  readonly checkoutButton: Locator;

  constructor(page: Page, ai: AIService) {
    // Eu repasso as dependências (page e ai) para a classe pai
    super(page, ai);
    // Eu mantive o seu localizador original
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }

  /**
   * Procede para a etapa de checkout.
   * Eu utilizei o smartClick aqui para garantir que o fluxo não pare caso o seletor mude.
   */
  async proceedToCheckout() {
    await this.smartClick('[data-test="checkout"]', "Botão de Checkout no Carrinho");
  }
}