import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Acessibilidade', () => {
  
  test('Deve não ter violações de acessibilidade na página de Login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Roda a análise do Axe na página inteira
    const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']) // foca em padrões específicos
        .analyze();

    // Verifica se não tem nenhuma violação
    // Se tiver erro, ele mostra um relatório detalhado no console/report
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});