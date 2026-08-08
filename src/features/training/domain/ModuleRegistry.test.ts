import { describe, expect, it } from "vitest";

import { sampleModule } from "@/modules/sample";

import { ModuleRegistry, ModuleRegistryError } from "./ModuleRegistry";

describe("ModuleRegistry", () => {
  it("looks up a validated module by slug and id", () => {
    const registry = new ModuleRegistry([sampleModule]);

    expect(registry.getBySlug("sample-module")?.id).toBe(sampleModule.id);
    expect(registry.getById(sampleModule.id)?.slug).toBe("sample-module");
    expect(registry.getPublished()).toHaveLength(1);
  });

  it("rejects duplicate module slugs", () => {
    const duplicateSlug = {
      ...sampleModule,
      id: "3d855f00-df54-40cc-b915-d74486944f7f",
      topics: sampleModule.topics.map((topic, index) => ({
        ...topic,
        id:
          index === 0
            ? "b64328aa-d66c-482c-8643-8f9a2e23b7d3"
            : "8c7407c5-8da6-4ac9-812e-6657c20781fc",
      })),
    };

    expect(() => new ModuleRegistry([sampleModule, duplicateSlug])).toThrowError(
      expect.objectContaining<Partial<ModuleRegistryError>>({ code: "duplicate-module-slug" }),
    );
  });

  it("rejects duplicate module identifiers", () => {
    const duplicateId = {
      ...sampleModule,
      slug: "another-module",
    };

    expect(() => new ModuleRegistry([sampleModule, duplicateId])).toThrowError(
      expect.objectContaining<Partial<ModuleRegistryError>>({ code: "duplicate-module-id" }),
    );
  });

  it("rejects invalid module content before registration", () => {
    expect(() => new ModuleRegistry([{ ...sampleModule, slug: "Invalid Slug" }])).toThrow();
  });
});
