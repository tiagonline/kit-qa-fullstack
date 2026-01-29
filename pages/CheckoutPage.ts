import { expect, type Locator, type Page } from "@playwright/test";

export class CheckoutPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly errorMessage: Locator;
  readonly orderCompleteHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    // Localizadores
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    // Elementos de Validação
    this.errorMessage = page.locator('[data-test="error"]');
    this.orderCompleteHeader = page.locator(".complete-header");
  }

  // Método de Ação: Preenche as informações e clica em continuar
  async fillInformation(
    firstName: string,
    lastName: string,
    postalCode: string,
  ) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  // Método de Ação: Finaliza o checkout
  async finishCheckout() {
    await this.finishButton.click();
  }

  // Método de Validação: Isolando o expect no Page Object
  async validateErrorMessage(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }

  // Método de Validação: Isolando o expect no Page Object
  async validateOrderComplete() {
    await expect(this.orderCompleteHeader).toHaveText(
      "Thank you for your order!",
    );
  }
}
