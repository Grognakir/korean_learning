import { expect, test, type Page } from "@playwright/test";

import {
  answerCurrentExercise,
  assertCheckpointViewports,
  assertNoHorizontalOverflow,
  assertSessionProgressBar,
  clearTrainingSessionStorage,
  expectFeedback,
  FILTERED_GRAMMAR_SESSION_ID,
  seedShortChoiceSession,
  sweepViewportWidths,
  withPageZoom,
  withReducedMotion,
} from "./helpers";

async function expectStableShell(page: Page) {
  await expect(page.getByRole("banner")).toBeVisible();
  await assertNoHorizontalOverflow(page);
}

const KEY_PAGES = [
  { path: "/topics", heading: "Темы" },
  { path: "/topics?view=grammar", heading: "Темы" },
  { path: "/topics/u01", heading: "приветствие и представление" },
  { path: "/dictionary?unit=u01", heading: "Словарь" },
  { path: "/training", heading: "Тренировка" },
  { path: "/review", heading: "Повторение" },
  { path: "/progress", heading: "Прогресс" },
] as const;

test.describe("responsive and accessibility gate", () => {
  test("checkpoint viewports keep key curriculum pages overflow-free", async ({ page }) => {
    for (const entry of KEY_PAGES) {
      await page.goto(entry.path);
      await expect(page.getByRole("heading", { level: 1, name: entry.heading })).toBeVisible();
      await assertCheckpointViewports(page, async (current) => {
        await expectStableShell(current);
      });
    }
  });

  test("smooth viewport sweep on training setup and demo session", async ({ page }) => {
    test.setTimeout(180_000);

    await page.goto("/training");
    await expect(page.getByRole("heading", { level: 1, name: "Тренировка" })).toBeVisible();
    await sweepViewportWidths(page, async (current) => {
      await assertNoHorizontalOverflow(current);
    });

    await seedShortChoiceSession(page);
    await page.goto(`/training/${FILTERED_GRAMMAR_SESSION_ID}`);
    await expect(page.getByText(/Задание 1 из 2/)).toBeVisible();
    await sweepViewportWidths(page, async (current) => {
      await assertNoHorizontalOverflow(current);
    });
  });

  test("progress bar semantics hold across checkpoint widths", async ({ page }) => {
    await seedShortChoiceSession(page);
    await page.goto(`/training/${FILTERED_GRAMMAR_SESSION_ID}`);
    await expect(page.getByText(/Задание 1 из 2/)).toBeVisible();

    for (const width of [320, 768, 1440, 2560] as const) {
      await page.setViewportSize({ width, height: 800 });
      await assertSessionProgressBar(page, { value: 0, max: 2 });
    }

    await answerCurrentExercise(page);
    await expectFeedback(page);

    for (const width of [320, 768, 1440, 2560] as const) {
      await page.setViewportSize({ width, height: 800 });
      await assertSessionProgressBar(page, { value: 1, max: 2 });
    }
  });

  test("setup pickers and three skill sessions are keyboard reachable", async ({ page }) => {
    test.setTimeout(120_000);

    for (const skill of ["grammar", "vocabulary", "reading"] as const) {
      await page.goto("/training");
      await clearTrainingSessionStorage(page);
      await page.goto(`/training?skill=${skill}&unit=u01&size=2`);
      await expect(
        page.getByRole("button", { name: /Грамматика|Словарь|Чтение/ }).first(),
      ).toBeVisible();

      const unit = page.getByRole("combobox", { name: "Тема" });
      await unit.focus();
      await page.keyboard.press("ArrowDown");
      await expect(page.getByRole("listbox")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(unit).toHaveAttribute("aria-expanded", "false");

      const start = page.getByRole("link", { name: "Начать тренировку" });
      await expect(start).toBeVisible();
      await start.click();
      await expect(page).toHaveURL(new RegExp(`/training/filt__${skill}__`));
      await expect(page.getByText(/Задание 1 из/)).toBeVisible();
      await answerCurrentExercise(page);
      await expectFeedback(page);
    }
  });

  test("catalog tabs and dictionary filters stay keyboard operable", async ({ page }) => {
    await page.goto("/topics");
    const grammarTab = page.getByRole("tab", { name: "По грамматике" });
    await grammarTab.focus();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/view=grammar/);
    await expect(grammarTab).toHaveAttribute("aria-selected", "true");

    await page.goto("/dictionary?unit=u01");
    const unitFilter = page.getByRole("combobox").first();
    await unitFilter.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("listbox")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(unitFilter).toHaveAttribute("aria-expanded", "false");
  });

  test("reduced motion and 200% zoom do not introduce overflow on core pages", async ({ page }) => {
    await withReducedMotion(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/training");
    await withPageZoom(page, 2);
    await assertNoHorizontalOverflow(page);

    await page.goto("/topics/u01");
    await withPageZoom(page, 2);
    await assertNoHorizontalOverflow(page);

    await seedShortChoiceSession(page);
    await page.goto(`/training/${FILTERED_GRAMMAR_SESSION_ID}`);
    await withPageZoom(page, 2);
    await assertNoHorizontalOverflow(page);
  });

  test("attaches representative stable screenshots", async ({ page }, testInfo) => {
    await page.goto("/topics");
    await expect(page.getByRole("tab", { name: "По темам" })).toBeVisible();
    await testInfo.attach("catalog-themes", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });

    await page.getByRole("tab", { name: "По грамматике" }).click();
    await testInfo.attach("catalog-grammar", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });

    await seedShortChoiceSession(page);
    await page.goto(`/training/${FILTERED_GRAMMAR_SESSION_ID}`);
    await testInfo.attach("session-prompt", {
      body: await page.screenshot({ fullPage: true }),
      contentType: "image/png",
    });
  });
});
