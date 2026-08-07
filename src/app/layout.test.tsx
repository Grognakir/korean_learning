import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import RootLayout from "./layout";

describe("RootLayout", () => {
  it("задаёт язык документа и ссылку пропуска навигации", () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <main id="main-content">Содержимое</main>
      </RootLayout>,
    );

    expect(markup).toContain('<html lang="ru">');
    expect(markup).toContain('<a class="skip-link" href="#main-content">');
  });
});
