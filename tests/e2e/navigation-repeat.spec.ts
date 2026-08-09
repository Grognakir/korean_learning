import { expect, test } from "@playwright/test";

const ROOT_LOADING_LABEL = "Загрузка страницы…";

function navName(projectName: string): string {
  return projectName.includes("mobile") ? "Мобильная навигация" : "Основная навигация";
}

async function expectNoRootLoading(page: import("@playwright/test").Page) {
  await expect(page.getByText(ROOT_LOADING_LABEL, { exact: true })).toHaveCount(0);
}

test.describe("repeat navigation", () => {
  test("does not show root loading when revisiting training and topics", async ({ page }, testInfo) => {
    const nav = page.getByRole("navigation", { name: navName(testInfo.project.name) });

    await page.goto("/training");
    await expect(page.getByRole("heading", { level: 1, name: "Тренировка" })).toBeVisible();

    await nav.getByRole("link", { name: /Темы/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Темы" })).toBeVisible();

    await nav.getByRole("link", { name: /Учиться|Тренировка/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Тренировка" })).toBeVisible({
      timeout: 1500,
    });
    await expectNoRootLoading(page);
  });

  test("does not show root loading on review progress dictionary cycle", async ({ page }, testInfo) => {
    const nav = page.getByRole("navigation", { name: navName(testInfo.project.name) });
    const isMobile = testInfo.project.name.includes("mobile");

    if (isMobile) {
      await page.goto("/topics");
      await expect(page.getByRole("heading", { level: 1, name: "Темы" })).toBeVisible();

      await nav.getByRole("link", { name: /Учиться|Тренировка/ }).click();
      await expect(page.getByRole("heading", { level: 1, name: "Тренировка" })).toBeVisible();

      await nav.getByRole("link", { name: /Прогресс/ }).click();
      await expect(page.getByRole("heading", { level: 1, name: "Прогресс" })).toBeVisible();

      await nav.getByRole("link", { name: /Темы/ }).click();
      await expect(page.getByRole("heading", { level: 1, name: "Темы" })).toBeVisible({
        timeout: 1500,
      });
      await expectNoRootLoading(page);
      return;
    }

    await page.goto("/review");
    await expect(page.getByRole("heading", { level: 1, name: "Повторение" })).toBeVisible();

    await nav.getByRole("link", { name: /Прогресс/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Прогресс" })).toBeVisible();

    await nav.getByRole("link", { name: /Словарь/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Словарь" })).toBeVisible();

    await nav.getByRole("link", { name: /Повторение/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Повторение" })).toBeVisible({
      timeout: 1500,
    });
    await expectNoRootLoading(page);
  });
});
