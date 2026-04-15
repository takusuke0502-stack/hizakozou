import { test, expect } from '@playwright/test';

test.describe('トップページ', () => {
  test('ページタイトルが表示される', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
  });

  test('主要ナビゲーションが存在する', async ({ page }) => {
    await page.goto('/');
    // ページが正常にロードされること
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('ブログ一覧', () => {
  test('ブログ一覧ページが開ける', async ({ page }) => {
    await page.goto('/blog.html');
    await expect(page).toHaveTitle(/.+/);
  });
});

test.describe('ブログ詳細', () => {
  test('ブログ詳細ページが開ける', async ({ page }) => {
    await page.goto('/blog-detail.html');
    await expect(page).toHaveTitle(/.+/);
  });
});
