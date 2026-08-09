"use client";

import { usePathname, useRouter } from "next/navigation";

import type { LearningSkillId } from "@/features/catalog/domain/types";
import { Select, type SelectOption } from "@/components/ui/Select";
import { buildTrainingSetupHref } from "@/features/training/setup/parseTrainingSetupQuery";

import styles from "./TrainingSetupControls.module.css";

const SKILLS: ReadonlyArray<{ readonly value: LearningSkillId; readonly label: string }> = [
  { value: "grammar", label: "Грамматика" },
  { value: "vocabulary", label: "Словарь" },
  { value: "reading", label: "Чтение" },
];

type TrainingSetupControlsProps = {
  readonly skill: LearningSkillId | null;
  readonly unitSlug: string | null;
  readonly grammarTopicId: string | null;
  readonly difficulty: "easy" | "medium" | "hard" | null;
  readonly sessionSize: number | null;
  readonly unitOptions: readonly SelectOption[];
  readonly grammarOptions: readonly SelectOption[];
  readonly difficultyOptions: readonly SelectOption[];
  readonly sizeOptions: readonly SelectOption[];
};

export function TrainingSetupControls({
  skill,
  unitSlug,
  grammarTopicId,
  difficulty,
  sessionSize,
  unitOptions,
  grammarOptions,
  difficultyOptions,
  sizeOptions,
}: TrainingSetupControlsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const replace = (next: {
    skill: LearningSkillId | null;
    unitSlug: string | null;
    grammarTopicId: string | null;
    difficulty: "easy" | "medium" | "hard" | null;
    sessionSize: number | null;
  }) => {
    const href = buildTrainingSetupHref(next);
    router.replace(href === "/training" ? pathname : href, { scroll: false });
  };

  return (
    <div className={styles.root}>
      <div className={styles.skills} role="group" aria-label="Навык">
        {SKILLS.map((option) => {
          const selected = option.value === skill;
          return (
            <button
              key={option.value}
              aria-pressed={selected}
              className={selected ? styles.skillActive : styles.skill}
              type="button"
              onClick={() =>
                replace({
                  skill: option.value,
                  unitSlug,
                  grammarTopicId: option.value === "grammar" ? grammarTopicId : null,
                  difficulty: null,
                  sessionSize: null,
                })
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className={styles.filters}>
        <label className={styles.field}>
          <span className={styles.label}>Тема</span>
          <Select
            aria-label="Тема"
            disabled={!skill}
            options={[{ value: "", label: "Выберите тему" }, ...unitOptions]}
            value={unitSlug ?? ""}
            onChange={(value) =>
              replace({
                skill,
                unitSlug: value || null,
                grammarTopicId: null,
                difficulty: null,
                sessionSize: null,
              })
            }
          />
        </label>

        {skill === "grammar" ? (
          <label className={styles.field}>
            <span className={styles.label}>Конструкция</span>
            <Select
              aria-label="Конструкция"
              disabled={!unitSlug}
              options={[{ value: "", label: "Все в теме" }, ...grammarOptions]}
              value={grammarTopicId ?? ""}
              onChange={(value) =>
                replace({
                  skill,
                  unitSlug,
                  grammarTopicId: value || null,
                  difficulty: null,
                  sessionSize: null,
                })
              }
            />
          </label>
        ) : null}

        <label className={styles.field}>
          <span className={styles.label}>Сложность</span>
          <Select
            aria-label="Сложность"
            disabled={!unitSlug || difficultyOptions.length === 0}
            options={[{ value: "", label: "Любая доступная" }, ...difficultyOptions]}
            value={difficulty ?? ""}
            onChange={(value) =>
              replace({
                skill,
                unitSlug,
                grammarTopicId,
                difficulty:
                  value === "easy" || value === "medium" || value === "hard" ? value : null,
                sessionSize: null,
              })
            }
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Размер сессии</span>
          <Select
            aria-label="Размер сессии"
            disabled={!unitSlug || sizeOptions.length === 0}
            options={[{ value: "", label: "Авто" }, ...sizeOptions]}
            value={sessionSize ? String(sessionSize) : ""}
            onChange={(value) =>
              replace({
                skill,
                unitSlug,
                grammarTopicId,
                difficulty,
                sessionSize: value ? Number.parseInt(value, 10) : null,
              })
            }
          />
        </label>
      </div>
    </div>
  );
}
