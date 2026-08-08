import { expect, type Page } from "@playwright/test";

export const TRAINING_SESSION_STORAGE_KEY = "korean-learning:training-session:v1";

export const SAMPLE_CHOICE_HOME_ID = "39c0c607-38a1-4a70-8e2a-e14061871ded";
export const SAMPLE_CHOICE_SCHOOL_ID = "eaaf766c-82f8-4a41-b89a-9a275b8148ec";

export async function assertNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

function shortChoiceSessionRecord() {
  const now = "2026-08-08T12:00:00.000Z";
  const expiresAt = "2026-08-15T12:00:00.000Z";
  const queue = [SAMPLE_CHOICE_HOME_ID, SAMPLE_CHOICE_SCHOOL_ID];

  return {
    storageVersion: 1,
    savedAt: now,
    expiresAt,
    sessionState: {
      schemaVersion: 1,
      sessionId: "demo-session",
      moduleSlug: "sample-module",
      mode: "practice" as const,
      seed: 1,
      status: "active" as const,
      queue,
      currentIndex: 0,
      attempts: [],
      startedAt: now,
      lastActivityAt: now,
      completedAt: null,
      contentSnapshot: {
        contentVersion: "1.0.0",
        exerciseIds: queue,
      },
    },
  };
}

/** Seeds localStorage on the current origin without re-applying on later reloads. */
export async function seedShortChoiceSession(page: Page) {
  await page.goto("/training");
  await page.evaluate(
    ({ key, record }) => {
      window.localStorage.setItem(key, JSON.stringify(record));
    },
    {
      key: TRAINING_SESSION_STORAGE_KEY,
      record: shortChoiceSessionRecord(),
    },
  );
}

export async function answerCurrentExercise(page: Page, options?: { readonly wrong?: boolean }) {
  const wrong = options?.wrong ?? false;

  const choiceGroup = page
    .getByRole("radiogroup")
    .or(page.getByRole("group", { name: /Выберите/ }));
  if (await choiceGroup.count()) {
    const radios = page.getByRole("radio");
    const count = await radios.count();
    expect(count).toBeGreaterThan(0);
    await radios.nth(wrong ? Math.min(1, count - 1) : 0).click();
    await page.getByRole("button", { name: "Ответить" }).click();
    return;
  }

  const answerField = page.getByLabel("Ваш ответ");
  if (await answerField.count()) {
    const prompt = (await page.getByRole("heading", { level: 2 }).textContent()) ?? "";
    const value = wrong
      ? "틀림"
      : prompt.includes("Спасибо") || prompt.includes("благодар")
        ? "감사합니다"
        : "안녕하세요";
    await answerField.fill(value);
    await page.getByRole("button", { name: "Ответить" }).click();
    return;
  }

  const blank = page.getByLabel(/Пропуск 1/);
  if (await blank.count()) {
    await blank.fill(wrong ? "틀림" : "안녕하세요");
    await page.getByRole("button", { name: "Ответить" }).click();
    return;
  }

  const comboboxes = page.getByRole("combobox");
  const comboCount = await comboboxes.count();
  if (comboCount > 0) {
    for (let index = 0; index < comboCount; index += 1) {
      const combobox = comboboxes.nth(index);
      await combobox.click();
      const options = page.getByRole("option");
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);
      await options.nth(wrong ? Math.min(1, optionCount - 1) : 0).click();
    }
    await page.getByRole("button", { name: "Ответить" }).click();
    return;
  }

  throw new Error("Unsupported exercise controls for e2e helper.");
}

export async function goNext(page: Page) {
  await page.getByRole("button", { name: "Дальше" }).click();
}

export async function expectFeedback(page: Page) {
  await expect(page.getByText(/^(Верно|Неверно|Частично верно)$/)).toBeVisible();
}
