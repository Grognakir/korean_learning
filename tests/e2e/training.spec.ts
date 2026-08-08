import { expect, test } from "@playwright/test";

import {
  answerCurrentExercise,
  assertNoHorizontalOverflow,
  expectFeedback,
  goNext,
  seedShortChoiceSession,
} from "./helpers";

test.describe("training session", () => {
  test("completes a short mixed session and can retry mistakes", async ({ page }, testInfo) => {
    await seedShortChoiceSession(page);
    await page.goto("/training/demo-session");

    await expect(page.getByText(/Задание 1 из 2/)).toBeVisible();

    // First exercise: home meaning — wrong answer first radio may vary; pick "школа".
    await page.getByRole("radio", { name: "школа" }).click();
    await page.getByRole("button", { name: "Ответить" }).click();
    await expect(page.getByText("Неверно")).toBeVisible();
    await goNext(page);

    await expect(page.getByText(/Задание 2 из 2/)).toBeVisible();
    await page.getByRole("radio", { name: "школа" }).click();
    await page.getByRole("button", { name: "Ответить" }).click();
    await expect(page.getByText("Верно")).toBeVisible();
    await goNext(page);

    await expect(page.getByRole("heading", { name: "Тренировка завершена" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Итог" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Повторить ошибки" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Новая тренировка" })).toHaveAttribute(
      "href",
      "/training",
    );

    await page.getByRole("button", { name: "Повторить ошибки" }).click();
    await expect(page.getByText(/Задание 1 из 1/)).toBeVisible();

    if (testInfo.project.name.includes("mobile")) {
      const submit = page.getByRole("button", { name: "Ответить" });
      await page.getByRole("radio").first().click();
      await expect(submit).toBeEnabled();

      const mobileNav = page.getByRole("navigation", { name: "Мобильная навигация" });
      const submitBox = await submit.boundingBox();
      const navBox = await mobileNav.boundingBox();
      expect(submitBox).not.toBeNull();
      expect(navBox).not.toBeNull();
      if (submitBox && navBox) {
        expect(submitBox.y + submitBox.height).toBeLessThanOrEqual(navBox.y + 1);
      }
    }

    await assertNoHorizontalOverflow(page);
  });

  test("supports keyboard-only choice answering", async ({ page }) => {
    await seedShortChoiceSession(page);
    await page.goto("/training/demo-session");

    await page.getByRole("radio").first().focus();
    await page.keyboard.press("Space");
    await page.getByRole("button", { name: "Ответить" }).focus();
    await page.keyboard.press("Enter");
    await expectFeedback(page);
    await page.getByRole("button", { name: "Дальше" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText(/Задание 2 из 2/)).toBeVisible();
  });

  test("answers the live demo session first exercise", async ({ page }) => {
    await page.goto("/training");
    await page.getByRole("link", { name: "Начать тренировку" }).click();
    await expect(page).toHaveURL(/\/training\/demo-session/);
    await expect(page.getByText(/Задание 1 из/)).toBeVisible();
    await answerCurrentExercise(page);
    await expectFeedback(page);
  });
});
