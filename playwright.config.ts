import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carrega variáveis de ambiente (igual fizemos no hooks)
dotenv.config({ path: path.resolve(__dirname, 'envs/.env.dev') });

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  reporter: [['html'], ['allure-playwright']],
  
  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
    locale: 'en-US', // Força inglês para evitar tradução
    
    // --- A MÁGICA QUE FALTAVA ---
    // Repassamos as mesmas configurações blindadas do Cucumber para o Playwright nativo
    launchOptions: {
      args: [
        "--disable-gpu",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Vital para Linux/Docker
        "--no-zygote",
        "--disable-features=Translate,TranslateUI,OptimizationHints,MediaRouter",
        "--disable-extensions",
        "--lang=en-US"
      ]
    }
  },

projects: [
    // 1. Suíte E2E Principal (Desktop)
    // Pega todos os .spec.ts dentro de 'e2e', exceto os visuais/mobile/steps
    {
      name: 'E2E Web',
      testMatch: ['tests/e2e/**/*.spec.ts'], 
      testIgnore: ['**/*.visual.spec.ts', '**/*.mobile.spec.ts', '**/steps/*.ts'],
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome', // Força usar o Chrome real se disponível
      },
    },
    // 2. Testes de Regressão Visual (Snapshot Testing)
    {
      name: 'Visual Regression',
      testMatch: /.*visual.spec.ts/, 
      use: { ...devices['Desktop Chrome'] },
    },

    // 3. Testes Mobile (Emulação)
    {
      name: 'Mobile',
      testMatch: /.*mobile.spec.ts/,
      use: { ...devices['Pixel 5'] },
    },

    // 4. Testes de API (Sem navegador)
    {
      name: 'API',
      testMatch: /.*api.spec.ts/,
      use: { 
        viewport: null // Economiza recursos pois não abre janela
      }
    }
  ],
});