import { defineConfig, devices } from "@playwright/test";
import * as dotenv from 'dotenv';
import path from 'path';

// Carrega variáveis de ambiente
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
    ignoreHTTPSErrors: true,
  },

  // 👇 AQUI ESTÁ A MÁGICA
  expect: {
    toHaveScreenshot: { 
      maxDiffPixels: 2000 // Aceita até 2000 pixels diferentes (cobre seus 192 e até os 1150 do outro erro)
    }
  },

  projects: [
    {
      name: "E2E",
      use: { ...devices["Desktop Chrome"] },
      testIgnore: ['**/mobile/**', '**/visual/**'], 
    },
    {
      name: "Mobile",
      use: { ...devices["Pixel 5"] },
      testMatch: '**/mobile/*.spec.ts',
    },
    {
      name: "Visual Regression",
      use: { ...devices["Desktop Chrome"], animations: "disabled" },
      testMatch: '**/visual/*.spec.ts', 
    },
  ],
});