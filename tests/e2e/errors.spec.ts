import { expect, test } from "@playwright/test";

test.describe("errors and empty routes", () => {
  test("unknown module and session urls show not-found", async ({ page }) => {
    const missingModule = await page.goto("/topics/missing-module");
    expect(missingModule?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Страница не найдена" })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "На главную" })).toBeVisible();
    await expect(page.getByRole("main").getByRole("link", { name: "К каталогу" })).toBeVisible();

    const missingSession = await page.goto("/training/missing-session");
    expect(missingSession?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Страница не найдена" })).toBeVisible();

    const honorificsPreview = await page.goto("/training/honorifics-preview");
    expect(honorificsPreview?.status()).toBe(404);
  });

  test("guest progress and review show safe empty states", async ({ page }) => {
    await page.goto("/progress");
    await expect(page.getByRole("heading", { level: 1, name: "Прогресс" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Прогресс пока недоступен" })).toBeVisible();

    await page.goto("/review");
    await expect(page.getByRole("heading", { level: 1, name: "Повторение" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Повторение пока недоступно" })).toBeVisible();
  });
});
