import { Page, expect } from "@playwright/test";
import { BasePage } from "./BasePages";
import { AIService } from "../services/AIService";

export class CheckoutPage extends BasePage {
  // Seletores Step One
  private readonly firstNameInput = "#first-name";
  private readonly lastNameInput = "#last-name";
  private readonly zipInput = "#postal-code";
  private readonly continueButton = "#continue";
  private readonly errorMessage = "[data-test='error']";

  // Seletores Step Two (Overview)
  private readonly finishButton = "#finish";
  private readonly cancelButton = "#cancel";

  // Seletores Complete
  private readonly completeHeader = ".complete-header";
  private readonly backHomeButton = "#back-to-products";

  constructor(page: Page, ai: AIService) {
    super(page, ai);
  }

  // --- FLUXO NEGATIVO / FORMULÁRIO ---
  async clickContinue() {
    console.log("[Checkout] Tentando continuar...");
    await this.smartClick(this.continueButton, "Botão Continue no Checkout");
  }

  async validateErrorMessage(message: string) {
    await this.page.waitForSelector(this.errorMessage, { state: "visible" });
    const text = await this.page.textContent(this.errorMessage);
    if (!text?.includes(message)) {
      throw new Error(`Esperava erro "${message}", mas recebeu "${text}"`);
    }
  }

  // --- FLUXO POSITIVO ---
  async fillCheckoutForm(firstName: string, lastName: string, zip: string) {
    console.log(`[Checkout] Preenchendo formulário: ${firstName} ${lastName}`);
    await this.page.fill(this.firstNameInput, firstName);
    await this.page.fill(this.lastNameInput, lastName);
    await this.page.fill(this.zipInput, zip);
    await this.clickContinue();

    // Espera ir para o Step Two (Overview)
    await this.page.waitForURL(/.*checkout-step-two\.html/);
    await this.page.waitForSelector(this.finishButton, { state: "visible" });
  }

  async clickFinish() {
    console.log("[Checkout] Finalizando compra...");
    await this.smartClick(this.finishButton, "Botão Finish");

    // Espera ir para a tela de Complete
    await this.page.waitForURL(/.*checkout-complete\.html/);
  }

  async validateOrderSuccess(message: string) {
    console.log("[Checkout] Validando sucesso...");
    await this.page.waitForSelector(this.completeHeader, { state: "visible" });
    await expect(this.page.locator(this.completeHeader)).toContainText(message);
  }
}
