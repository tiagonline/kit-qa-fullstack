import { test, expect } from "@playwright/test";

test("Mobile - Validar a Responsividade da Home Swag Labs num pixel 5", async ({
  page,
}) => {
  // 1. Acessa a Home
  await page.goto("/");

  // Pega o tamanho da janela atual (Viewport)
  const viewportSize = page.viewportSize();
  console.log(
    `[DEBUG] Tamanho da tela: ${viewportSize?.width}x${viewportSize?.height}`,
  );

  // A largura deve ser menor que 500px (Pixel 5 tem 393px)
  expect(viewportSize?.width).toBeLessThan(500);

  // --- Validações de Elementos ---

  // 2. Valida se o elemento de login está visível
  const loginInput = page.locator('[data-test="username"]');
  await expect(loginInput).toBeVisible();

  // 3. Valida o Logo (Visual)
  await expect(page.locator(".login_logo")).toBeVisible();

  // 4. Verificar se não tem a barra de rolagem horizontal
  const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
  const clientWidth = await page.evaluate(() => document.body.clientWidth);

  // Se scrollWidth for igual clientWidth, não tem scroll horizontal "vazando"
  expect(scrollWidth).toBe(clientWidth);
});
