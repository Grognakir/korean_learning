import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { ExercisesEmptyState, ServiceUnavailableState } from "@/components/feedback";
import { PageHeader } from "@/components/layout";
import { getServerAuthUser } from "@/features/authentication/server/getServerAuthUser";
import { evaluateTrainingSubmissionAction } from "@/features/training/actions/evaluateTrainingSubmissionAction";
import { TrainingSession } from "@/features/training/components/TrainingSession";
import type { Exercise } from "@/features/training/domain";
import { toPublicExercises } from "@/features/training/presentation";
import { parseFilteredSessionId } from "@/features/training/setup/filteredSessionId";
import { selectFilteredSessionExercises } from "@/features/training/setup/selectFilteredSessionExercises";
import { getCachedPublishedModuleBySlug } from "@/modules/cachedLearningContent";
import { getCachedApprovedCurriculumExercises } from "@/modules/curriculum/cachedCurriculumContent";
import { listFixtureDomainExercises } from "@/modules/curriculum/mapFixtureExerciseToDomain";
import { resolveContentSource } from "@/modules/contentSource";

export type ResolvedSession = {
  readonly sessionId: string;
  readonly moduleSlug: string;
  readonly description: ReactNode;
  readonly kind: "filtered";
  readonly seed: number;
  readonly exerciseIds?: readonly string[];
  readonly contentVersion?: string;
};

export type SessionResolution =
  { readonly status: "ready"; readonly session: ResolvedSession } | { readonly status: "unknown" };

export async function resolveSession(sessionId: string): Promise<SessionResolution> {
  const filtered = parseFilteredSessionId(sessionId);
  if (!filtered) {
    return { status: "unknown" };
  }

  return {
    status: "ready",
    session: {
      kind: "filtered",
      sessionId,
      moduleSlug: filtered.request.unitSlug,
      seed: filtered.seed,
      description: `Отфильтрованная тренировка: ${filtered.request.skill} · ${filtered.request.unitSlug}.`,
    },
  };
}

type SessionExercisePanelProps = {
  readonly session: ResolvedSession;
};

async function loadFilteredDomainExercises(moduleSlug: string): Promise<readonly Exercise[]> {
  if (resolveContentSource() === "local") {
    return listFixtureDomainExercises().filter((exercise) => exercise.moduleSlug === moduleSlug);
  }

  const { getExerciseContent } = await import("@/modules/resolveLearningContent");
  const { exerciseRepository } = await getExerciseContent();
  return exerciseRepository.list({ moduleSlug });
}

export async function SessionExercisePanel({ session }: SessionExercisePanelProps) {
  const user = await getServerAuthUser();

  const filtered = parseFilteredSessionId(session.sessionId);
  if (!filtered) {
    notFound();
  }

  const [publicListResult, domainExercises, unitModule] = await Promise.all([
    getCachedApprovedCurriculumExercises({
      unitSlug: filtered.request.unitSlug,
      learningSkill: filtered.request.skill,
      ...(filtered.request.difficulty ? { difficulty: filtered.request.difficulty } : {}),
      ...(filtered.request.grammarTopicId
        ? { grammarTopicId: filtered.request.grammarTopicId }
        : {}),
    }),
    loadFilteredDomainExercises(filtered.request.unitSlug),
    getCachedPublishedModuleBySlug(filtered.request.unitSlug),
  ]);

  if (publicListResult.status === "unavailable") {
    return (
      <>
        <PageHeader description="Не удалось загрузить задания сессии." title="Учебная сессия" />
        <ServiceUnavailableState />
      </>
    );
  }

  let selection;
  try {
    selection = selectFilteredSessionExercises({
      exercises: publicListResult.data.map((exercise) => ({
        id: exercise.id,
        skill: exercise.skill,
        unitSlug: exercise.unitSlug,
        difficulty: exercise.difficulty,
        grammarTopicLogicalId: exercise.grammarTopicLogicalId,
        contentVersion: exercise.contentVersion,
        status: "approved" as const,
      })),
      request: filtered.request,
      seed: filtered.seed,
    });
  } catch {
    return (
      <>
        <PageHeader
          description="Для выбранных фильтров нет approved заданий."
          title="Учебная сессия"
        />
        <ExercisesEmptyState />
      </>
    );
  }

  const domainById = new Map(domainExercises.map((exercise) => [exercise.id, exercise]));
  const orderedDomain = selection.exerciseIds
    .map((id) => domainById.get(id))
    .filter((exercise): exercise is Exercise => Boolean(exercise));

  // Keep input order sorted by id so createTrainingSession + seed rebuilds the same queue.
  orderedDomain.sort((left, right) => left.id.localeCompare(right.id));
  const publicExercises = toPublicExercises(orderedDomain, { seed: selection.seed });

  if (publicExercises.length === 0) {
    return (
      <>
        <PageHeader description="Для выбранной сессии сейчас нет заданий." title="Учебная сессия" />
        <ExercisesEmptyState />
      </>
    );
  }

  const learningModule = unitModule.status === "ready" ? unitModule.data : null;
  // Cloud create requires approved rows in Supabase; local fixtures stay guest/local-only.
  const cloudPersistence =
    user && learningModule && resolveContentSource() !== "local"
      ? {
          moduleId: learningModule.id,
          clientSessionKey: session.sessionId,
          contentVersion: selection.contentVersion,
          exerciseIds: selection.exerciseIds,
          randomSeed: String(selection.seed),
        }
      : undefined;

  return (
    <>
      <PageHeader description={session.description} title="Учебная сессия" />
      <TrainingSession
        {...(cloudPersistence ? { cloudPersistence } : {})}
        contentVersion={selection.contentVersion}
        evaluateSubmission={evaluateTrainingSubmissionAction}
        limit={selection.exerciseIds.length}
        moduleSlug={session.moduleSlug}
        publicExercises={publicExercises}
        seed={selection.seed}
        sessionId={session.sessionId}
        topics={learningModule?.topics ?? []}
      />
    </>
  );
}

export async function SessionPageContent({ sessionId }: { readonly sessionId: string }) {
  const resolution = await resolveSession(sessionId);

  if (resolution.status === "unknown") {
    notFound();
  }

  return <SessionExercisePanel session={resolution.session} />;
}
