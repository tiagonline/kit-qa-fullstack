import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { BrowserContext, Page } from '@playwright/test';
import { PageManager } from '../../../pages/PageManager';

/**
 * Interface que define o que existe no contexto "this" dos steps.
 * Aqui declaramos que todo step terá acesso à page, context e ao nosso PageManager.
 */
export interface ICustomWorld extends World {
  page: Page;
  context: BrowserContext;
  pageManager: PageManager;
}

/**
 * Implementação concreta do World.
 * Inicializamos as variáveis como undefined ou null, elas serão preenchidas no Hook @Before.
 */
export class CustomWorld extends World implements ICustomWorld {
  page!: Page;
  context!: BrowserContext;
  pageManager!: PageManager;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

// Diz ao Cucumber para usar a nossa classe CustomWorld em vez da padrão
setWorldConstructor(CustomWorld);