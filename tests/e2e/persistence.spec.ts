import { expect, test } from "@playwright/test";

import { goNext, seedShortChoiceSession, TRAINING_SESSION_STORAGE_KEY } from "./helpers";

test.describe("persistence", () => {
  test.describe.configure({ mode: "serial" });

  test("resumes after refresh on the answered question", async ({ page }) => {
    await seedShortChoiceSession(page);
    await page.goto("/training/demo-session");

    await page.getByRole("radio", { name: "дом" }).click();
    await page.getByRole("button", { name: "Ответить" }).click();
    await expect(page.getByText("Верно")).toBeVisible();
    await expect(page.getByRole("button", { name: "Дальше" })).toBeVisible();

    const saved = await page.evaluate(
      (key) => window.localStorage.getItem(key),
      TRAINING_SESSION_STORAGE_KEY,
    );
    expect(saved).toBeTruthy();

    await page.reload();
    await expect(page.getByText(/Задание 1 из 2/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Дальше" })).toBeVisible();
    await expect(page.getByText("Верно")).toBeVisible();

    await goNext(page);
    await expect(page.getByText(/Задание 2 из 2/)).toBeVisible();
  });

  test("offers continue or restart from the training index", async ({ page }) => {
    await seedShortChoiceSession(page);
    await page.goto("/training/demo-session");
    await page.getByRole("radio", { name: "дом" }).click();
    await page.getByRole("button", { name: "Ответить" }).click();
    await expect(page.getByText("Верно")).toBeVisible();

    await page.goto("/training");
    await expect(page.getByRole("link", { name: "Продолжить" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Начать заново" })).toBeVisible();
  });
});
