import { test, expect } from '@playwright/test';

test.describe('Tzav Rishon Platform E2E Tests', () => {
  test('Guest can view home page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/הכנה לצו ראשון/);
    await expect(page.locator('text=תרגול')).toBeVisible();
    await expect(page.locator('text=מבחן')).toBeVisible();
    await expect(page.locator('text=מעקב')).toBeVisible();
  });

  test('Guest can start limited practice', async ({ page }) => {
    await page.goto('http://localhost:3000/practice');
    
    // Choose question type
    await page.locator('text=אנלוגיה מילולית').click();
    
    // Should see questions
    await expect(page.locator('text=שאלה')).toBeVisible();
  });

  test('Exam requires authentication', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Exam card should be disabled for guests
    const examCard = page.locator('text=מבחן').locator('..');
    await expect(examCard).toHaveAttribute('disabled', '');
  });

  test('Progress requires authentication', async ({ page }) => {
    await page.goto('http://localhost:3000/progress');
    
    // Should redirect or show auth required message
    // (Implementation depends on auth flow)
  });
});

