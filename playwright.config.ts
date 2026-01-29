import { defineConfig, devices } from "@playwright/test";
import * as dotenv from 'dotenv';
import path from 'path';

// Se ENV_FILE for passado (pelo script), usa ele. 
// Senão, tenta o .env da raiz.
const envPath = process.env.DOTENV_CONFIG_PATH || '.env'; 
dotenv.config({ path: path.resolve(__dirname, envPath) });

dotenv.config();

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  // Se tiver algum "test.only" no código, falha imediatamente no CI, para evitar que testes sejam esquecidos
  forbidOnly: !!process.env.CI,//
  // Retries: Se falhar, quantas vezes tenta de novo se rolar flakiness
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  use: {
    headless: true,
    // Esta baseURL serve como "Padrão" para testes de UI (Web/Mobile).
    // Assim, nos testes visuais fiz apenas page.goto('/').
    // Nos testes de API, sobrescrevo isso com a url completa.
    baseURL: process.env.BASE_URL,    
    video: "on",
    trace: "on",
    screenshot: "only-on-failure",
  },

projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      // Ignora os testes mobile (assim não roda duplicado nem tenta rodar mobile em desktop)
      testIgnore: '**/mobile/**', 
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
      testMatch: '**/mobile/*.spec.ts',
    },
  ],
});