import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type { Exercise } from "@/features/training/domain/exercise";
import { sampleExercises } from "@/modules/sample/sampleExercises";
import { sampleModule } from "@/modules/sample/sampleModule";

import {
  buildCurriculumSeedSql,
  sqlJson,
  sqlString,
  uuidFromKey,
} from "./content/curriculumSeedSql";

const lines: string[] = [
  "-- Deterministic dev seed: sample module (F1) + phase-2 curriculum authoring (F2-I08).",
  "begin;",
  "",
  `insert into public.learning_modules (`,
  `  id, slug, level, title_ko, title_ru, description_ru, status, content_version, sort_order, unit_number`,
  `) values (`,
  `  '${sampleModule.id}',`,
  `  '${sampleModule.slug}',`,
  `  ${sqlString(sampleModule.level)},`,
  `  ${sqlString(sampleModule.title.ko)},`,
  `  ${sqlString(sampleModule.title.ru)},`,
  `  ${sqlString(sampleModule.description.ru)},`,
  `  'published',`,
  `  '${sampleModule.contentVersion}',`,
  `  ${sampleModule.sortOrder},`,
  `  null`,
  `);`,
  "",
];

for (const topic of sampleModule.topics) {
  lines.push(
    `insert into public.grammar_topics (`,
    `  id, module_id, code, title, summary_ru, rule_payload, level, status, sort_order, content_version,`,
    `  logical_id, pattern_ko, category, usage_key`,
    `) values (`,
    `  '${topic.id}',`,
    `  '${sampleModule.id}',`,
    `  '${topic.code}',`,
    `  ${sqlString(topic.title.ru)},`,
    `  ${sqlString(topic.summary.ru)},`,
    `  ${sqlJson({ titleKo: topic.title.ko, summaryKo: topic.summary.ko })},`,
    `  ${sqlString(topic.level)},`,
    `  'published',`,
    `  ${topic.sortOrder},`,
    `  '${topic.contentVersion}',`,
    `  ${sqlString(`grammar.sample.${topic.code}`)},`,
    `  ${sqlString(topic.title.ko)},`,
    `  'sample',`,
    `  null`,
    `);`,
    "",
  );
}

function exercisePayload(exercise: Exercise): Record<string, unknown> {
  switch (exercise.type) {
    case "free-response":
      return {
        answerLanguage: exercise.answerLanguage,
        acceptedAnswerIds: exercise.acceptedAnswers.map((a) => a.id),
      };
    case "meaning-choice":
    case "honorific-choice":
    case "plain-choice":
    case "single-choice":
      return {
        correctOptionId: exercise.correctOptionId,
        optionIds: exercise.options.map((o) => o.id),
      };
    case "matching-translation":
    case "matching-honorific":
      return { pairs: exercise.pairs };
    case "fill-blank":
      return {
        template: exercise.template,
        templateLanguage: exercise.templateLanguage,
        blanks: exercise.blanks.map((b) => ({
          id: b.id,
          acceptedAnswerIds: b.acceptedAnswers.map((a) => a.id),
        })),
      };
    default:
      return {};
  }
}

const samplePassageIds = new Map<string, string>();
for (const exercise of sampleExercises) {
  if (exercise.type === "single-choice" && exercise.passage) {
    const passageId = uuidFromKey(
      `sample-passage:${exercise.passage.logicalId}@${exercise.contentVersion}`,
    );
    if (!samplePassageIds.has(exercise.passage.logicalId)) {
      samplePassageIds.set(exercise.passage.logicalId, passageId);
      lines.push(
        `insert into public.reading_passages (`,
        `  id, logical_id, primary_module_id, title_ko, title_ru, body_ko, status, content_version`,
        `) values (`,
        `  '${passageId}',`,
        `  ${sqlString(exercise.passage.logicalId)},`,
        `  '${sampleModule.id}',`,
        `  ${sqlString(exercise.passage.title.ko)},`,
        `  ${sqlString(exercise.passage.title.ru)},`,
        `  ${sqlString(exercise.passage.bodyKo)},`,
        `  'published',`,
        `  '${exercise.contentVersion}'`,
        `);`,
        "",
      );
    }
  }
}

for (const exercise of sampleExercises) {
  const primaryTopicId = exercise.topicIds[0];
  const passageId =
    exercise.type === "single-choice" && exercise.passage
      ? (samplePassageIds.get(exercise.passage.logicalId) ?? null)
      : null;
  const learningSkill = passageId ? "reading" : "grammar";
  lines.push(
    `insert into public.exercises (`,
    `  id, logical_id, module_id, primary_topic_id, learning_skill, reading_passage_id, type, difficulty,`,
    `  prompt_ko, prompt_ru, payload, explanation_ru, status, content_version, source`,
    `) values (`,
    `  '${exercise.id}',`,
    `  '${exercise.logicalId}',`,
    `  '${sampleModule.id}',`,
    `  '${primaryTopicId}',`,
    `  '${learningSkill}',`,
    `  ${passageId ? `'${passageId}'` : "null"},`,
    `  '${exercise.type}',`,
    `  '${exercise.difficulty}',`,
    `  ${sqlString(exercise.prompt.ko)},`,
    `  ${sqlString(exercise.prompt.ru)},`,
    `  ${sqlJson(exercisePayload(exercise))},`,
    `  ${sqlString(exercise.explanation.ru)},`,
    `  'approved',`,
    `  '${exercise.contentVersion}',`,
    `  'manual'`,
    `);`,
    "",
  );

  for (const topicId of exercise.topicIds) {
    const role = topicId === primaryTopicId ? "primary" : "secondary";
    lines.push(
      `insert into public.exercise_topics (exercise_id, topic_id, role)`,
      `values ('${exercise.id}', '${topicId}', '${role}')`,
      `on conflict do nothing;`,
      "",
    );
  }

  if ("options" in exercise) {
    exercise.options.forEach((option, index) => {
      const isCorrect = "correctOptionId" in exercise && exercise.correctOptionId === option.id;
      lines.push(
        `insert into public.exercise_options (`,
        `  id, exercise_id, option_key, label_ko, label_ru, value_payload, is_correct, sort_order`,
        `) values (`,
        `  gen_random_uuid(),`,
        `  '${exercise.id}',`,
        `  '${option.id}',`,
        `  ${sqlString(option.label.ko)},`,
        `  ${sqlString(option.label.ru)},`,
        `  '{}'::jsonb,`,
        `  ${isCorrect},`,
        `  ${index}`,
        `);`,
        "",
      );
    });
  }

  if ("acceptedAnswers" in exercise && exercise.type === "free-response") {
    for (const answer of exercise.acceptedAnswers) {
      lines.push(
        `insert into public.accepted_answers (`,
        `  id, exercise_id, raw_value, normalized_value, is_canonical, review_status`,
        `) values (`,
        `  gen_random_uuid(),`,
        `  '${exercise.id}',`,
        `  ${sqlString(answer.value)},`,
        `  ${sqlString(answer.value)},`,
        `  ${answer.isCanonical},`,
        `  'approved'`,
        `);`,
        "",
      );
    }
  }

  if (exercise.type === "fill-blank") {
    for (const blank of exercise.blanks) {
      for (const answer of blank.acceptedAnswers) {
        lines.push(
          `insert into public.accepted_answers (`,
          `  id, exercise_id, raw_value, normalized_value, is_canonical, review_status`,
          `) values (`,
          `  gen_random_uuid(),`,
          `  '${exercise.id}',`,
          `  ${sqlString(answer.value)},`,
          `  ${sqlString(answer.value)},`,
          `  ${answer.isCanonical},`,
          `  'approved'`,
          `);`,
          "",
        );
      }
    }
  }

  lines.push(
    `insert into public.content_reviews (`,
    `  entity_type, entity_id, content_version, reviewer_label, decision, notes`,
    `) values (`,
    `  'exercise',`,
    `  '${exercise.id}',`,
    `  '${exercise.contentVersion}',`,
    `  'seed',`,
    `  'approved',`,
    `  'Sample seed approval'`,
    `);`,
    "",
  );
}

lines.push(
  `insert into public.content_reviews (`,
  `  entity_type, entity_id, content_version, reviewer_label, decision, notes`,
  `) values (`,
  `  'learning_module',`,
  `  '${sampleModule.id}',`,
  `  '${sampleModule.contentVersion}',`,
  `  'seed',`,
  `  'approved',`,
  `  'Sample module seed approval'`,
  `);`,
  "",
);

const curriculum = buildCurriculumSeedSql("insert");
lines.push(curriculum.sql.trimEnd(), "", "commit;", "");

const target = resolve(process.cwd(), "supabase/seed.sql");
writeFileSync(target, lines.join("\n"));
console.log(
  `Wrote ${target} (sampleExercises=${sampleExercises.length}, curriculumExercises=${curriculum.stats.exercises}, modules=${1 + curriculum.stats.modules})`,
);
