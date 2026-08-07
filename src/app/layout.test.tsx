import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import RootLayout from "./layout";

describe("RootLayout", () => {
  it("задаёт язык документа и ссылку пропуска навигации", () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <div>Содержимое</div>
      </RootLayout>,
    );

    expect(markup).toContain('<html lang="ru">');
    expect(markup).toContain('<a class="skip-link" href="#main-content">');
    expect(markup).toContain('<main class="');
    expect(markup).toContain('id="main-content"');
  });
});
