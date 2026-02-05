import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carrega variáveis de ambiente
dotenv.config({ path: path.resolve(__dirname, 'envs/.env.dev') });

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  
  // 👇 AQUI ESTÁ A CORREÇÃO VISUAL
  expect: { 
    timeout: 10000,
    toHaveScreenshot: {
      // Aceita até 5% de diferença de pixels (Crucial para CI vs Local)
      maxDiffPixelRatio: 0.05,
      // Ignora diferenças muito sutis de cor (anti-aliasing de fontes)
      threshold: 0.2,
    }
  },

  fullyParallel: true,
  reporter: [['html'], ['allure-playwright']],
  
  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
    locale: 'en-US', 
    
    // Configurações blindadas para rodar liso no Docker/Linux
    launchOptions: {
      args: [
        "--disable-gpu",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--no-zygote",
        "--disable-features=Translate,TranslateUI,OptimizationHints,MediaRouter",
        "--disable-extensions",
        "--lang=en-US"
      ]
    }
  },

  projects: [
    // 1. Suíte E2E Principal (Desktop)
    {
      name: 'E2E Web',
      testMatch: ['tests/e2e/**/*.spec.ts'], 
      testIgnore: ['**/*.visual.spec.ts', '**/*.mobile.spec.ts', '**/steps/*.ts'],
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome', 
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
        viewport: null 
      }
    }
  ],
});