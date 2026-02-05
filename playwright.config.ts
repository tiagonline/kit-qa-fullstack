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
    {
      name: 'Visual Regression',
      testMatch: /.*visual.spec.ts/, // Só roda os testes visuais
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile',
      testMatch: /.*mobile.spec.ts/,
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'API',
      testMatch: /.*api.spec.ts/,
    }
  ],
});