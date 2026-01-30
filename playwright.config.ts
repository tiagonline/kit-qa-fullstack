import { defineConfig, devices } from "@playwright/test";
import * as dotenv from 'dotenv';
import path from 'path';

const envPath = process.env.DOTENV_CONFIG_PATH || '.env'; 
dotenv.config({ path: path.resolve(__dirname, envPath) });

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['list'],
    ['allure-playwright', { 
      detail: true,
      outputFolder: 'allure-results', 
      suiteTitle: false 
    }]
  ],

  use: {
    headless: true,
    baseURL: process.env.BASE_URL,    
    video: "on",
    trace: "on",
    screenshot: "only-on-failure",
    // Ignora animações css para evitar "falsos positivos" no teste visual
    ignoreHTTPSErrors: true,
  },
  
  // Configuração global para snapshots (ajuste a sensibilidade se precisar)
  expect: {
    toHaveScreenshot: { maxDiffPixels: 100 } // Tolera até 100 pixels diferentes
  },

  projects: [
    {
      name: "e2e Tests",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: ['**/mobile/**', '**/visual/**'],
    },
    {
      name: "Mobile Tests",
      use: { ...devices["Pixel 5"] },
      testMatch: '**/mobile/*.spec.ts',
    },
    {
      name: "Visual Regression",
      use: { ...devices["Desktop Chrome"] },
      testMatch: '**/visual/*.spec.ts', 
    },
  ],
});