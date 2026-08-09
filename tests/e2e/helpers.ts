import { expect, type Page } from "@playwright/test";

export const TRAINING_SESSION_STORAGE_KEY = "korean-learning:training-session:v2";

/** Local curriculum fixture grammar choices (u01). */
export const FIXTURE_GRAMMAR_Q01_ID = "55555555-5555-4555-8555-555555555502";
export const FIXTURE_GRAMMAR_Q02_ID = "55555555-5555-4555-8555-555555555505";
export const FILTERED_GRAMMAR_SESSION_ID = "filt__grammar__u01__grammar.u01.n01__none__2__17";

export const VIEWPORT_CHECKPOINTS = [320, 375, 768, 1024, 1440, 2560] as const;

export async function assertNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

/** Inclusive endpoints; step ≤ 6 per F2-I20. Walks out and back. */
export async function sweepViewportWidths(
  page: Page,
  assert: (page: Page, width: number) => Promise<void>,
  options?: {
    readonly from?: number;
    readonly to?: number;
    readonly step?: number;
    readonly height?: number;
  },
) {
  const from = options?.from ?? 320;
  const to = options?.to ?? 2560;
  const step = options?.step ?? 6;
  const height = options?.height ?? 800;

  if (step < 1 || step > 6) {
    throw new Error("Viewport sweep step must be between 1 and 6.");
  }

  const ascending: number[] = [];
  for (let width = from; width < to; width += step) {
    ascending.push(width);
  }
  ascending.push(to);

  for (const width of ascending) {
    await page.setViewportSize({ width, height });
    await assert(page, width);
  }

  for (let index = ascending.length - 2; index >= 0; index -= 1) {
    const width = ascending[index]!;
    await page.setViewportSize({ width, height });
    await assert(page, width);
  }
}

export async function assertCheckpointViewports(
  page: Page,
  assert: (page: Page, width: number) => Promise<void>,
  options?: { readonly height?: number },
) {
  const height = options?.height ?? 800;
  for (const width of VIEWPORT_CHECKPOINTS) {
    await page.setViewportSize({ width, height });
    await assert(page, width);
  }
}

export async function withReducedMotion(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" });
}

/** Chromium page scale (true browser zoom), not CSS zoom which skews scrollWidth. */
export async function withPageZoom(page: Page, scale: number) {
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setPageScaleFactor", { pageScaleFactor: scale });
}

export async function assertSessionProgressBar(
  page: Page,
  input: { readonly value: number; readonly max: number },
) {
  const progress = page.getByRole("progressbar", {
    name: new RegExp(`Выполнено заданий:\\s*${input.value}\\s*из\\s*${input.max}`),
  });
  await expect(progress).toBeVisible();
  await expect(progress).toHaveAttribute("aria-valuenow", String(input.value));
  await expect(progress).toHaveAttribute("aria-valuemax", String(input.max));
  const box = await progress.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThan(40);
}

function shortChoiceSessionRecord() {
  const now = "2026-08-08T12:00:00.000Z";
  const expiresAt = "2026-08-15T12:00:00.000Z";
  const queue = [FIXTURE_GRAMMAR_Q01_ID, FIXTURE_GRAMMAR_Q02_ID];

  return {
    storageVersion: 2,
    savedAt: now,
    expiresAt,
    sessionState: {
      schemaVersion: 1,
      sessionId: FILTERED_GRAMMAR_SESSION_ID,
      moduleSlug: "u01",
      mode: "practice" as const,
      seed: 17,
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

export async function clearTrainingSessionStorage(page: Page) {
  await page.evaluate((key) => {
    window.localStorage.removeItem(key);
    window.localStorage.removeItem("korean-learning:training-session:v1");
  }, TRAINING_SESSION_STORAGE_KEY);
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
