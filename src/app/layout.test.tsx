import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import RootLayout from "./layout";

vi.mock("@/features/authentication/server/getServerAuthUser", () => ({
  getServerAuthUser: vi.fn(async () => null),
}));

describe("RootLayout", () => {
  it("задаёт язык документа и ссылку пропуска навигации", async () => {
    const element = await RootLayout({
      children: <div>Содержимое</div>,
    });
    const markup = renderToStaticMarkup(element);

    expect(markup).toContain('<html lang="ru">');
    expect(markup).toContain('<a class="skip-link" href="#main-content">');
    expect(markup).toContain('<main class="');
    expect(markup).toContain('id="main-content"');
  });
});
