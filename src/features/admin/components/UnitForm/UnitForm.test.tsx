import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UnitForm } from "./UnitForm";

vi.mock("@/features/admin/actions/saveUnitAction", () => ({
  saveUnitAction: vi.fn(async () => null),
}));

const initialValues = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "u01",
  level: "1급",
  unitNumber: 1,
  titleKo: "인사",
  titleRu: "Приветствие",
  descriptionRu: "Базовые фразы",
  contentVersion: "1.0.0",
  status: "draft" as const,
  sortOrder: 2,
};

describe("UnitForm", () => {
  it("renders required field labels", () => {
    render(<UnitForm />);

    expect(screen.getByLabelText(/Код юнита/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Уровень/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Название \(ru\)/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Описание/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Статус/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Сохранить" })).toBeInTheDocument();
  });

  it("derives unit number from the slug code", async () => {
    const user = userEvent.setup();
    render(<UnitForm />);

    await user.type(screen.getByLabelText(/Код юнита/), "u09");
    expect(screen.getByLabelText(/№ юнита/)).toHaveValue("9");
  });

  it("uses a custom status dropdown", () => {
    render(<UnitForm initialValues={initialValues} />);

    expect(screen.getByRole("combobox", { name: /Статус/ })).toHaveTextContent("Черновик");
    expect(screen.queryByRole("combobox", { name: /Статус/ })?.tagName).toBe("BUTTON");
  });

  it("renders optional actions next to save", () => {
    render(
      <UnitForm
        actionsExtra={<button type="button">Удалить</button>}
        initialValues={initialValues}
      />,
    );

    const save = screen.getByRole("button", { name: "Сохранить" });
    const remove = screen.getByRole("button", { name: "Удалить" });
    expect(save.compareDocumentPosition(remove) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
