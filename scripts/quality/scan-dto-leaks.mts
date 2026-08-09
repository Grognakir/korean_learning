import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import type { Exercise } from "../../src/features/training/domain";
import {
  assertPublicExerciseShape,
  toPublicExercise,
} from "../../src/features/training/presentation/PublicExercise";
import { loadPhase2ContentGraph, PHASE_2_CONTENT_ROOT } from "../content/contentValidation";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

const FORBIDDEN_CLIENT_MARKERS = [
  "acceptedAnswers",
  "correctOptionId",
  "is_correct",
  "SUPABASE_SERVICE_ROLE_KEY",
  "service_role",
] as const;

const ALLOWED_CLIENT_PATH_FRAGMENTS = [
  "assertPublicCatalogShape",
  "PublicExercise",
  "toExerciseView",
] as const;

type Finding = {
  readonly file: string;
  readonly detail: string;
};

function walkTsFiles(directory: string, files: string[]): void {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules") continue;
      walkTsFiles(fullPath, files);
      continue;
    }
    if (entry.isFile() && /\.(tsx?|mts|cts)$/.test(entry.name) && !entry.name.includes(".test.")) {
      files.push(fullPath);
    }
  }
}

function scanClientSources(): Finding[] {
  const findings: Finding[] = [];
  const files: string[] = [];
  walkTsFiles(join(ROOT, "src"), files);

  for (const filePath of files) {
    const relativePath = relative(ROOT, filePath).replaceAll("\\", "/");
    if (ALLOWED_CLIENT_PATH_FRAGMENTS.some((fragment) => relativePath.includes(fragment))) {
      continue;
    }

    const source = readFileSync(filePath, "utf8");
    if (!(source.includes('"use client"') || source.includes("'use client'"))) {
      continue;
    }

    for (const marker of FORBIDDEN_CLIENT_MARKERS) {
      if (source.includes(marker)) {
        findings.push({
          file: relativePath,
          detail: `client component references "${marker}"`,
        });
      }
    }
  }

  return findings;
}

function scanMappedPublicExercises(): Finding[] {
  const findings: Finding[] = [];
  const graph = loadPhase2ContentGraph(PHASE_2_CONTENT_ROOT);

  const recognition = graph.exercisesGrammar.items.find(
    (exercise) => exercise.exerciseType === "single-choice",
  );
  const application = graph.exercisesGrammar.items.find(
    (exercise) => exercise.exerciseType === "free-response",
  );
  const vocabularyChoice = graph.exercisesVocabulary.items.find(
    (exercise) =>
      exercise.exerciseType === "single-choice" || exercise.exerciseType === "meaning-choice",
  );
  const reading = graph.exercisesReading.items.find(
    (exercise) => exercise.exerciseType === "single-choice",
  );

  const samples: Exercise[] = [];

  if (recognition) {
    samples.push({
      schemaVersion: 1,
      id: "00000000-0000-4000-8000-000000000201",
      logicalId: recognition.logicalId,
      moduleSlug: "u01",
      topicIds: [recognition.grammarTopicLogicalId ?? "topic"],
      type: "single-choice",
      difficulty: recognition.difficulty,
      prompt: recognition.prompt,
      explanation: recognition.explanation,
      contentVersion: "1.0.0",
      scoring: { points: 1, partialCredit: false },
      options: recognition.options,
      correctOptionId: recognition.correctOptionId!,
      passage: null,
    });
  }

  if (application) {
    samples.push({
      schemaVersion: 1,
      id: "00000000-0000-4000-8000-000000000202",
      logicalId: application.logicalId,
      moduleSlug: "u01",
      topicIds: [application.grammarTopicLogicalId ?? "topic"],
      type: "free-response",
      difficulty: application.difficulty,
      prompt: application.prompt,
      explanation: application.explanation,
      contentVersion: "1.0.0",
      scoring: { points: 1, partialCredit: false },
      answerLanguage: "ko",
      acceptedAnswers: application.acceptedAnswers.map((value, index) => ({
        id: `ans${index + 1}`,
        value,
      })),
      passage: null,
    });
  }

  if (vocabularyChoice?.options?.length && vocabularyChoice.correctOptionId) {
    samples.push({
      schemaVersion: 1,
      id: "00000000-0000-4000-8000-000000000203",
      logicalId: vocabularyChoice.logicalId,
      moduleSlug: "u01",
      topicIds: [],
      type: "single-choice",
      difficulty: vocabularyChoice.difficulty,
      prompt: vocabularyChoice.prompt,
      explanation: vocabularyChoice.explanation,
      contentVersion: "1.0.0",
      scoring: { points: 1, partialCredit: false },
      options: vocabularyChoice.options,
      correctOptionId: vocabularyChoice.correctOptionId,
      passage: null,
    });
  }

  if (reading) {
    samples.push({
      schemaVersion: 1,
      id: "00000000-0000-4000-8000-000000000204",
      logicalId: reading.logicalId,
      moduleSlug: "u01",
      topicIds: [],
      type: "single-choice",
      difficulty: reading.difficulty,
      prompt: reading.prompt,
      explanation: reading.explanation,
      contentVersion: "1.0.0",
      scoring: { points: 1, partialCredit: false },
      options: reading.options,
      correctOptionId: reading.correctOptionId!,
      passage: null,
    });
  }

  for (const sample of samples) {
    try {
      const publicExercise = toPublicExercise(sample, { seed: 7 });
      assertPublicExerciseShape(publicExercise);
      const serialized = JSON.stringify(publicExercise);
      for (const key of ["correctOptionId", "acceptedAnswers", "is_correct", "isCorrect"]) {
        if (serialized.includes(`"${key}"`)) {
          findings.push({
            file: sample.logicalId,
            detail: `public exercise still contains "${key}"`,
          });
        }
      }
    } catch (error) {
      findings.push({
        file: sample.logicalId,
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return findings;
}

function main(): void {
  const findings = [...scanClientSources(), ...scanMappedPublicExercises()];
  if (findings.length > 0) {
    console.error("DTO leak scan failed:");
    for (const finding of findings.slice(0, 40)) {
      console.error(`- ${finding.file}: ${finding.detail}`);
    }
    process.exit(1);
  }

  console.log("DTO leak scan passed.");
}

main();
