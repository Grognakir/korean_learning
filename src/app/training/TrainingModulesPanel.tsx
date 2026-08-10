import Link from "next/link";

import { CatalogEmptyState, ServiceUnavailableState } from "@/components/feedback";
import { TrainingSetupControls } from "@/features/training/components/TrainingSetup/TrainingSetupControls";
import { GuestSessionImportPrompt } from "@/features/training/components/GuestSessionImportPrompt";
import { ResumeTrainingPrompt } from "@/features/training/components/ResumeTrainingPrompt";
import { DEMO_TRAINING_SEED } from "@/features/training/sessionConstants";
import { buildFilteredSessionId } from "@/features/training/setup/filteredSessionId";
import { parseTrainingSetupQuery } from "@/features/training/setup/parseTrainingSetupQuery";
import { resolveTrainingSetup } from "@/features/training/setup/resolveTrainingSetup";
import {
  getCachedApprovedCurriculumExercises,
  getCachedPublicGrammarTopics,
  getCachedPublicUnits,
} from "@/modules/curriculum/cachedCurriculumContent";

import styles from "./page.module.css";

type TrainingModulesPanelProps = {
  readonly searchParams: Promise<{
    skill?: string | string[];
    unit?: string | string[];
    grammar?: string | string[];
    difficulty?: string | string[];
    size?: string | string[];
  }>;
};

const DIFFICULTY_LABELS = {
  easy: "Легко",
  hard: "Сложно",
  medium: "Средне",
} as const;

function getExerciseCountLabel(count: number): string {
  const remainder100 = count % 100;
  const remainder10 = count % 10;
  const form =
    remainder100 >= 11 && remainder100 <= 14
      ? "заданий"
      : remainder10 === 1
        ? "задание"
        : remainder10 >= 2 && remainder10 <= 4
          ? "задания"
          : "заданий";

  return `${count} ${form}`;
}

export async function TrainingModulesPanel({ searchParams }: TrainingModulesPanelProps) {
  const url = parseTrainingSetupQuery(await searchParams);
  const [unitsResult, grammarResult, exercisesResult] = await Promise.all([
    getCachedPublicUnits(),
    url.unitSlug ? getCachedPublicGrammarTopics(url.unitSlug) : getCachedPublicGrammarTopics(),
    url.unitSlug
      ? getCachedApprovedCurriculumExercises({
          unitSlug: url.unitSlug,
          ...(url.skill ? { learningSkill: url.skill } : {}),
        })
      : Promise.resolve({ status: "ready" as const, data: [] as const }),
  ]);

  if (
    unitsResult.status === "unavailable" ||
    grammarResult.status === "unavailable" ||
    exercisesResult.status === "unavailable"
  ) {
    return <ServiceUnavailableState />;
  }

  if (unitsResult.data.length === 0) {
    return <CatalogEmptyState />;
  }

  const setup = resolveTrainingSetup({
    url,
    units: unitsResult.data,
    grammarTopics: grammarResult.data,
    exercises: exercisesResult.data,
  });

  const unitOptions = unitsResult.data.map((unit) => ({
    value: unit.slug,
    label: `Урок ${unit.unitNumber}: ${unit.title.ru.charAt(0).toUpperCase() + unit.title.ru.slice(1)}`,
  }));
  const grammarOptions = grammarResult.data.map((topic) => ({
    value: topic.logicalId,
    label: topic.patternKo,
    lang: "ko",
  }));
  const difficultyOptions = setup.difficulties.map((value) => ({
    value,
    label: DIFFICULTY_LABELS[value],
  }));
  const sizeOptions = Array.from({ length: setup.maxSessionSize }, (_, index) => {
    const value = String(index + 1);
    return { value, label: value };
  });

  return (
    <>
      <ResumeTrainingPrompt />
      <GuestSessionImportPrompt
        moduleIdBySlug={Object.fromEntries(unitsResult.data.map((unit) => [unit.slug, unit.id]))}
      />

      <section aria-label="Настройка тренировки" className={styles.setup}>
        <TrainingSetupControls
          difficulty={url.difficulty}
          difficultyOptions={difficultyOptions}
          grammarOptions={grammarOptions}
          grammarTopicId={url.grammarTopicId}
          sessionSize={url.sessionSize}
          sizeOptions={sizeOptions}
          skill={url.skill}
          unitOptions={unitOptions}
          unitSlug={url.unitSlug}
        />

        <div className={styles.summary}>
          <p className={styles.summaryMeta}>
            Доступно: {getExerciseCountLabel(setup.availableCount)}
            {setup.request
              ? ` · в тренировке: ${getExerciseCountLabel(setup.request.sessionSize)}`
              : null}
          </p>
          <div className={styles.actionSlot}>
            {setup.canPreview && setup.request ? (
              <Link
                className={styles.startAction}
                href={`/training/${buildFilteredSessionId({
                  request: setup.request,
                  seed: DEMO_TRAINING_SEED,
                })}`}
              >
                Начать тренировку
              </Link>
            ) : (
              <>
                <span aria-disabled="true" className={styles.startDisabled}>
                  Начать тренировку
                </span>
                {setup.blockedReason ? (
                  <p className={styles.blockedReason}>{setup.blockedReason}</p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
