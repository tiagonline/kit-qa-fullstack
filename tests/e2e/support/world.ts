import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { AllureCucumberWorld } from 'allure-cucumberjs';
import { PageManager } from '../../../pages/PageManager';
import { Page } from '@playwright/test';

export class CustomWorld extends AllureCucumberWorld {
  // Declaramos as propriedades que usamos nos Hooks para o TypeScript não reclamar
  page?: Page;
  pageManager?: PageManager;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(CustomWorld);