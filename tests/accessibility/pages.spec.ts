import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Acessibilidade', () => {
  
  test('Deve não ter violações de acessibilidade na página de Login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.navigate();

    const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});