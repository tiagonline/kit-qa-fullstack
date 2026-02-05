import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./BasePages"; // Eu herdo da BasePage
import { AIService } from "../services/AIService";

export class CheckoutPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly errorMessage: Locator;
  readonly orderCompleteHeader: Locator;

  constructor(page: Page, ai: AIService) {
    // Eu inicializo a classe pai com o page e o serviço de IA
    super(page, ai);

    // Eu mantive todos os seus localizadores originais de preenchimento e validação
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.finishButton = page.locator('[data-test="finish"]');
    
    // Elementos de Validação
    this.errorMessage = page.locator('[data-test="error"]');
    this.orderCompleteHeader = page.locator(".complete-header");
  }

  /**
   * Método de Ação: Preenche as informações e clica em continuar.
   * Eu mantive o preenchimento padrão (fill) e apliquei o smartClick no botão de transição.
   */
  async fillInformation(
    firstName: string,
    lastName: string,
    postalCode: string,
  ) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    
    // Eu uso o smartClick aqui pois o botão 'Continue' é um ponto comum de falha em refatorações de UI
    await this.smartClick('[data-test="continue"]', "Botão Continuar do Formulário de Checkout");
  }

  /**
   * Método de Ação: Finaliza o checkout.
   */
  async finishCheckout() {
    // Eu aplico resiliência no clique final que confirma a compra
    await this.smartClick('[data-test="finish"]', "Botão Finish para concluir o pedido");
  }

  /**
   * Método de Validação: Isolando o expect no Page Object.
   */
  async validateErrorMessage(message: string) {
    // Eu mantive a asserção original baseada em texto
    await expect(this.errorMessage).toContainText(message);
  }

  /**
   * Método de Validação: Verifica se a ordem foi completada com sucesso.
   */
  async validateOrderComplete() {
    // Eu mantive o texto de sucesso original do SauceLabs
    await expect(this.orderCompleteHeader).toHaveText(
      "Thank you for your order!",
    );
  }
}