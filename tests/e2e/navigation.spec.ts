import { expect, test } from "@playwright/test";

import { assertNoHorizontalOverflow } from "./helpers";

test.describe("navigation", () => {
  test("primary destinations and active states work", async ({ page }, testInfo) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Корейский");

    const navName = testInfo.project.name.includes("mobile")
      ? "Мобильная навигация"
      : "Основная навигация";
    const nav = page.getByRole("navigation", { name: navName });

    await nav.getByRole("link", { name: /Темы/ }).click();
    await expect(page).toHaveURL(/\/topics$/);
    await expect(page.getByRole("heading", { level: 1, name: "Темы" })).toBeVisible();
    await expect(nav.getByRole("link", { name: /Темы/ })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("tab", { name: "По темам" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.getByRole("tab", { name: "По грамматике" }).click();
    await expect(page).toHaveURL(/\/topics\?view=grammar/);
    await expect(page.getByRole("tab", { name: "По грамматике" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await page.goBack();
    await expect(page).toHaveURL(/\/topics$/);
    await expect(page.getByRole("tab", { name: "По темам" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await nav.getByRole("link", { name: /Учиться|Тренировка/ }).click();
    await expect(page).toHaveURL(/\/training$/);
    await expect(page.getByRole("heading", { level: 1, name: "Тренировка" })).toBeVisible();

    await page.goto("/topics/sample-module");
    await expect(
      page.getByRole("heading", { level: 1, name: "Первые шаги в корейском" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Начать тренировку" }).click();
    await expect(page).toHaveURL(/\/training/);

    await page.goto("/topics/u01");
    await expect(
      page.getByRole("heading", { level: 1, name: "приветствие и представление" }),
    ).toBeVisible();
    await page.getByRole("link", { name: /N입니다\/입니까\?/ }).click();
    await expect(page).toHaveURL(/grammar=grammar\.u01\.n01/);
    await expect(page.getByRole("heading", { name: "N입니다/입니까?" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Тренировать конструкцию" })).toHaveAttribute(
      "href",
      "/training?skill=grammar&unit=u01&grammar=grammar.u01.n01",
    );

    await page.goto("/dictionary?unit=u01");
    await expect(page.getByRole("heading", { level: 1, name: "Словарь" })).toBeVisible();
    await expect(page.getByText("привет")).toBeVisible();
    await expect(page.getByText("пока")).toBeVisible();

    for (const width of [320, 375, 768, 1280] as const) {
      await page.setViewportSize({ width, height: 800 });
      await assertNoHorizontalOverflow(page);
    }
  });
});
