import { expect, test } from "@playwright/test";

import {
  answerCurrentExercise,
  assertNoHorizontalOverflow,
  expectFeedback,
  FILTERED_GRAMMAR_SESSION_ID,
  goNext,
  seedShortChoiceSession,
} from "./helpers";

test.describe("training session", () => {
  test("completes a short mixed session and can retry mistakes", async ({ page }, testInfo) => {
    await seedShortChoiceSession(page);
    await page.goto(`/training/${FILTERED_GRAMMAR_SESSION_ID}`);

    await expect(page.getByText(/Задание 1 из 2/)).toBeVisible();

    await page.getByRole("radio", { name: "이에요" }).click();
    await page.getByRole("button", { name: "Ответить" }).click();
    await expect(page.getByText("Неверно")).toBeVisible();
    await goNext(page);

    await expect(page.getByText(/Задание 2 из 2/)).toBeVisible();
    await page.getByRole("radio", { name: "입니까?" }).click();
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
    await page.goto(`/training/${FILTERED_GRAMMAR_SESSION_ID}`);

    await page.getByRole("radio").first().focus();
    await page.keyboard.press("Space");
    await page.getByRole("button", { name: "Ответить" }).focus();
    await page.keyboard.press("Enter");
    await expectFeedback(page);
    await page.getByRole("button", { name: "Дальше" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText(/Задание 2 из 2/)).toBeVisible();
  });

  test("starts a live filtered curriculum session from setup", async ({ page }) => {
    await page.goto("/training?skill=grammar&unit=u01&size=2");
    await page.getByRole("link", { name: "Начать тренировку" }).click();
    await expect(page).toHaveURL(/\/training\/filt__grammar__/);
    await expect(page.getByText(/Задание 1 из/)).toBeVisible();
    await answerCurrentExercise(page);
    await expectFeedback(page);
  });
});
