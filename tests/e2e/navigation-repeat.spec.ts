import { expect, test, type Page } from "@playwright/test";

const ROOT_LOADING_LABEL = "Загрузка страницы…";

type LoadingWatchWindow = Window & {
  __loadingWatchSeen?: string[];
  __loadingWatchObserver?: MutationObserver;
};

function navName(projectName: string): string {
  return projectName.includes("mobile") ? "Мобильная навигация" : "Основная навигация";
}

/**
 * Records loading placeholders for the whole duration of a transition. Asserting after the target
 * heading appears is not enough: a placeholder can be mounted and removed before that point.
 */
async function beginLoadingWatch(page: Page): Promise<void> {
  await page.evaluate(() => {
    const state: string[] = [];
    const scope = window as LoadingWatchWindow;
    scope.__loadingWatchSeen = state;

    const record = () => {
      for (const node of document.querySelectorAll('[aria-busy="true"]')) {
        const label =
          node.querySelector("[aria-label]")?.getAttribute("aria-label") ??
          node.textContent?.trim().slice(0, 60) ??
          "unnamed";
        const entry = `${location.pathname}: ${label}`;

        if (!state.includes(entry)) {
          state.push(entry);
        }
      }
    };

    record();

    const observer = new MutationObserver(record);
    observer.observe(document.documentElement, {
      attributeFilter: ["aria-busy"],
      attributes: true,
      childList: true,
      subtree: true,
    });
    scope.__loadingWatchObserver = observer;
  });
}

async function endLoadingWatch(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const scope = window as LoadingWatchWindow;
    scope.__loadingWatchObserver?.disconnect();
    return scope.__loadingWatchSeen ?? [];
  });
}

async function expectNoRootLoading(page: Page): Promise<void> {
  await expect(page.getByText(ROOT_LOADING_LABEL, { exact: true })).toHaveCount(0);
}

/**
 * A first visit may legitimately stream a local skeleton. Settling before the watch keeps the
 * assertion about the repeat transition instead of leftovers from the warm-up navigation.
 */
async function waitForSettledUi(page: Page): Promise<void> {
  await expect(page.locator('[aria-busy="true"]')).toHaveCount(0);
}

test.describe("repeat navigation", () => {
  test("revisiting training and topics renders from cache without any loading placeholder", async ({
    page,
  }, testInfo) => {
    const nav = page.getByRole("navigation", { name: navName(testInfo.project.name) });

    await page.goto("/training");
    await expect(page.getByRole("heading", { level: 1, name: "Тренировка" })).toBeVisible();

    await nav.getByRole("link", { name: /Темы/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Темы" })).toBeVisible();

    await waitForSettledUi(page);
    await beginLoadingWatch(page);
    await nav.getByRole("link", { name: /Учиться|Тренировка/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Тренировка" })).toBeVisible({
      timeout: 1500,
    });

    expect(await endLoadingWatch(page)).toEqual([]);
    await expectNoRootLoading(page);
  });

  test("cycling secondary sections never shows the root loading screen", async ({
    page,
  }, testInfo) => {
    const nav = page.getByRole("navigation", { name: navName(testInfo.project.name) });
    const isMobile = testInfo.project.name.includes("mobile");
    const entryPath = isMobile ? "/topics" : "/review";
    const entryHeading = isMobile ? "Темы" : "Повторение";
    const middleLink = isMobile ? /Учиться|Тренировка/ : /Словарь/;
    const middleHeading = isMobile ? "Тренировка" : "Словарь";
    const returnLink = isMobile ? /Темы/ : /Повторение/;

    await page.goto(entryPath);
    await expect(page.getByRole("heading", { level: 1, name: entryHeading })).toBeVisible();

    await nav.getByRole("link", { name: /Прогресс/ }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Прогресс" })).toBeVisible();

    await nav.getByRole("link", { name: middleLink }).click();
    await expect(page.getByRole("heading", { level: 1, name: middleHeading })).toBeVisible();

    await waitForSettledUi(page);
    await beginLoadingWatch(page);
    await nav.getByRole("link", { name: returnLink }).click();
    await expect(page.getByRole("heading", { level: 1, name: entryHeading })).toBeVisible({
      timeout: 1500,
    });

    expect(await endLoadingWatch(page)).toEqual([]);
    await expectNoRootLoading(page);
  });
});
