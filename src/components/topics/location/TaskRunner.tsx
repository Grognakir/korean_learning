"use client";

import { type FormEvent, useMemo, useState } from "react";
import { SceneCanvas } from "@/components/scene/SceneCanvas";
import type { LocationTask, VocabWord } from "@/content/topics/location";
import { subjectParticle } from "@/lib/ko/hangul";
import { findLexeme, positionWords } from "@/lib/ko/lexicon";
import {
  conjugationForms,
  parseLocationSentence,
  type ParsedSentence,
} from "@/lib/ko/parse";
import {
  getTrueRelations,
  holds,
  resolveTargetCell,
  type RelationFact,
} from "@/lib/scene/relations";
import type { Scene, SceneEntity, SpatialRelation } from "@/lib/scene/types";

type TaskRunnerProps = {
  tasks: LocationTask[];
  scenes: Scene[];
  vocab: VocabWord[];
};

type Status = "idle" | "error-parse" | "wrong" | "correct";

type Feedback = {
  kind: "warn" | "bad" | "ok";
  title: string;
  detail?: string;
};

const relationRu: Record<SpatialRelation, string> = {
  front: "перед",
  behind: "позади",
  beside: "рядом с",
  left: "слева от",
  right: "справа от",
  above: "над",
  below: "под",
  inside: "внутри",
  outside: "снаружи",
  between: "между",
  near: "недалеко от",
};

function cloneScene(scene: Scene): Scene {
  return {
    ...scene,
    entities: scene.entities.map((entity) => ({ ...entity })),
  };
}

function shuffleTasks(list: LocationTask[]): LocationTask[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy;
}

function normalizeSentence(input: string): string {
  return input
    .trim()
    .replace(/\s+/gu, " ")
    .replace(/[.!?。！？]+$/u, "");
}

function findEntity(scene: Scene, id: string): SceneEntity | undefined {
  return scene.entities.find((entity) => entity.id === id);
}

function entityLabel(scene: Scene, id: string): string {
  const entity = findEntity(scene, id);
  if (!entity) {
    const lexeme = findLexeme(id);
    return lexeme ? `${lexeme.ru} (${lexeme.ko})` : id;
  }
  return `${entity.ru} (${entity.ko})`;
}

function describeFactRu(scene: Scene, subjectId: string, fact: RelationFact): string {
  const subject = entityLabel(scene, subjectId);
  if (fact.relation === "between" && fact.refIds.length >= 2) {
    return `${subject} находится между ${entityLabel(scene, fact.refIds[0])} и ${entityLabel(scene, fact.refIds[1])}`;
  }
  const ref = fact.refIds[0] ? entityLabel(scene, fact.refIds[0]) : "…";
  return `${subject} ${relationRu[fact.relation]} ${ref}`;
}

function applyCell(
  scene: Scene,
  subjectId: string,
  cell: { col: number; row: number; containerId?: string },
): Scene {
  return {
    ...scene,
    entities: scene.entities.map((entity) => {
      if (entity.id !== subjectId) {
        return entity;
      }
      const next: SceneEntity = { ...entity, col: cell.col, row: cell.row };
      if (cell.containerId !== undefined) {
        next.containerId = cell.containerId;
      } else {
        delete next.containerId;
      }
      return next;
    }),
  };
}

function positionKo(relation: SpatialRelation): string {
  const entry = positionWords.find((item) => item.relation === relation);
  return entry?.ko[0] ?? relation;
}

function buildAnswerSentence(task: LocationTask, scene: Scene): string | null {
  const subject = findEntity(scene, task.subjectId);
  if (!subject) {
    return null;
  }

  let fact: RelationFact | undefined;
  if (task.type === "describe") {
    fact = getTrueRelations(scene, task.subjectId)[0];
  } else {
    fact = task.goal;
  }
  if (!fact) {
    return null;
  }

  const particle = subjectParticle(subject.ko);
  const verb = conjugationForms[0];

  if (fact.relation === "between" && fact.refIds.length >= 2) {
    const a = findEntity(scene, fact.refIds[0]);
    const b = findEntity(scene, fact.refIds[1]);
    if (!a || !b) {
      return null;
    }
    return `${subject.ko}${particle} ${a.ko}하고 ${b.ko} 사이에 ${verb}`;
  }

  const ref = findEntity(scene, fact.refIds[0]);
  if (!ref) {
    return null;
  }
  return `${subject.ko}${particle} ${ref.ko} ${positionKo(fact.relation)}에 ${verb}`;
}

function breakDownParsed(scene: Scene, parsed: ParsedSentence): string {
  return describeFactRu(scene, parsed.subjectId, {
    relation: parsed.relation,
    refIds: parsed.refIds,
  });
}

type TaskStepProps = {
  task: LocationTask;
  baseScene: Scene;
  vocab: VocabWord[];
  index: number;
  total: number;
  completed: number;
  onSolved: (firstTry: boolean) => void;
  onNext: () => void;
};

function TaskStep({
  task,
  baseScene,
  vocab,
  index,
  total,
  completed,
  onSolved,
  onNext,
}: TaskStepProps) {
  const [scene, setScene] = useState(() => cloneScene(baseScene));
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);

  const positionCheat = useMemo(() => {
    const byKo = new Map(vocab.map((word) => [word.ko, word.ru]));
    return positionWords.flatMap((item) =>
      item.ko.map((ko) => ({
        ko,
        ru: byKo.get(ko) ?? relationRu[item.relation],
      })),
    );
  }, [vocab]);

  function onCheck(event?: FormEvent) {
    event?.preventDefault();
    if (status === "correct") {
      return;
    }

    const normalized = normalizeSentence(input);
    if (
      task.type === "fix" &&
      normalized === normalizeSentence(task.wrongSentence)
    ) {
      setStatus("wrong");
      setFeedback({
        kind: "bad",
        title: "Это то же самое предложение",
        detail: "Нужно исправить ошибку, а не повторить исходный вариант.",
      });
      setAttempts((value) => value + 1);
      return;
    }

    const lexemeIds = scene.entities.map((entity) => entity.id);
    const parsed = parseLocationSentence(input, lexemeIds);

    if (!parsed.ok) {
      setStatus("error-parse");
      setFeedback({
        kind: "warn",
        title: parsed.errorRu,
        detail: parsed.hintRu,
      });
      setAttempts((value) => value + 1);
      return;
    }

    if (task.type === "describe") {
      const fact: RelationFact = {
        relation: parsed.relation,
        refIds: parsed.refIds,
      };
      const aboutSubject = parsed.subjectId === task.subjectId;
      const trueOnScene = holds(scene, task.subjectId, fact);

      if (aboutSubject && trueOnScene) {
        setStatus("correct");
        setFeedback({
          kind: "ok",
          title: "Верно! ✓",
          detail: breakDownParsed(scene, parsed),
        });
        onSolved(attempts === 0);
        return;
      }

      setStatus("wrong");
      setFeedback({
        kind: "bad",
        title: "Предложение грамматично, но неверно по сцене",
        detail: aboutSubject
          ? `Сейчас это не так: ${breakDownParsed(scene, parsed)}.`
          : `Вы описали ${entityLabel(scene, parsed.subjectId)}, а нужно — ${entityLabel(scene, task.subjectId)}.`,
      });
      setAttempts((value) => value + 1);
      return;
    }

    if (parsed.subjectId !== task.subjectId) {
      setStatus("wrong");
      setFeedback({
        kind: "bad",
        title: "Подлежащее не совпадает с заданием",
        detail: `Нужно предложение про ${entityLabel(scene, task.subjectId)}.`,
      });
      setAttempts((value) => value + 1);
      return;
    }

    const writtenFact: RelationFact = {
      relation: parsed.relation,
      refIds: parsed.refIds,
    };
    const target = resolveTargetCell(scene, task.subjectId, writtenFact);
    if (!target) {
      setStatus("wrong");
      setFeedback({
        kind: "bad",
        title: "Так в этой сцене встать нельзя",
        detail: breakDownParsed(scene, parsed),
      });
      setAttempts((value) => value + 1);
      return;
    }

    const moved = applyCell(scene, task.subjectId, target);
    setScene(moved);

    const goalHolds = holds(moved, task.subjectId, task.goal);
    if (goalHolds) {
      setStatus("correct");
      setFeedback({
        kind: "ok",
        title: "Верно! ✓",
        detail: breakDownParsed(moved, parsed),
      });
      onSolved(attempts === 0);
      return;
    }

    setStatus("wrong");
    setFeedback({
      kind: "bad",
      title: "Персонаж уехал не туда",
      detail: `Ты написал(а): ${describeFactRu(moved, parsed.subjectId, writtenFact)}, а нужно было: ${describeFactRu(moved, task.subjectId, task.goal)}.`,
    });
    setAttempts((value) => value + 1);
  }

  const progress = ((index + (status === "correct" ? 1 : 0)) / total) * 100;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 text-sm text-[var(--ink-soft)]">
        <span>
          Задание {index + 1} из {total}
        </span>
        <span>Выполнено: {completed}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--line)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      <div className="panel overflow-hidden rounded-2xl p-3 sm:p-4">
        <SceneCanvas
          scene={scene}
          highlightId={task.subjectId}
          className="rounded-xl"
        />
      </div>

      <section className="panel space-y-4 rounded-2xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
          {task.type === "describe"
            ? "Опиши"
            : task.type === "command"
              ? "Команда"
              : "Исправь"}
        </p>
        <p className="text-base leading-relaxed">{task.promptRu}</p>
        {task.type === "fix" ? (
          <p className="ko-text rounded-xl bg-white/70 px-3 py-2 text-lg text-[var(--ink)]">
            {task.wrongSentence}
          </p>
        ) : null}

        <form className="space-y-3" onSubmit={onCheck}>
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            lang="ko"
            className="ko-text w-full rounded-xl border border-[var(--line)] bg-white/90 px-3 py-3 text-lg outline-none transition focus:border-[var(--accent)]"
            placeholder="…이 … 앞에 있어요"
            disabled={status === "correct"}
            autoComplete="off"
          />

          {feedback ? (
            <div
              className={`rounded-xl px-3 py-3 text-sm ${
                feedback.kind === "ok"
                  ? "bg-[var(--accent-soft)] text-[var(--ok)]"
                  : feedback.kind === "warn"
                    ? "bg-[#f8e8dc] text-[var(--warn)]"
                    : "bg-[#f8e0e0] text-[var(--bad)]"
              }`}
            >
              <p className="font-semibold">{feedback.title}</p>
              {feedback.detail ? (
                <p className="mt-1 leading-relaxed opacity-90">{feedback.detail}</p>
              ) : null}
            </div>
          ) : null}

          {revealedAnswer ? (
            <p className="ko-text rounded-xl border border-[var(--line)] bg-white/80 px-3 py-2 text-base">
              Ответ: {revealedAnswer}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {status !== "correct" ? (
              <button
                type="submit"
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Проверить
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {index >= total - 1 ? "Завершить" : "Дальше"}
              </button>
            )}
            {status !== "correct" && attempts >= 3 ? (
              <button
                type="button"
                onClick={() => {
                  const answer = buildAnswerSentence(task, baseScene);
                  if (answer) {
                    setRevealedAnswer(answer);
                  }
                }}
                className="rounded-xl border border-[var(--line)] bg-white/80 px-4 py-2 text-sm font-semibold transition hover:border-[var(--accent)]"
              >
                Показать ответ
              </button>
            ) : null}
          </div>
        </form>

        <div className="border-t border-[var(--line)] pt-3">
          <button
            type="button"
            className="text-sm font-medium text-[var(--accent)]"
            onClick={() => setShowHint((value) => !value)}
          >
            {showHint ? "Скрыть шпаргалку" : "Шпаргалка: позиции и шаблон"}
          </button>
          {showHint ? (
            <div className="mt-3 space-y-3 text-sm text-[var(--ink-soft)]">
              <p>
                Шаблон:{" "}
                <span className="ko-text text-[var(--ink)]">
                  N이/가 REF 앞에 있어요
                </span>
                {" · "}
                <span className="ko-text text-[var(--ink)]">
                  N이/가 A하고 B 사이에 있어요
                </span>
              </p>
              <ul className="grid gap-1 sm:grid-cols-2">
                {positionCheat.map((item) => (
                  <li key={item.ko} className="flex gap-2">
                    <span className="ko-text font-medium text-[var(--ink)]">{item.ko}</span>
                    <span>— {item.ru}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function TaskRunner({ tasks, scenes, vocab }: TaskRunnerProps) {
  const sceneMap = useMemo(
    () => new Map(scenes.map((scene) => [scene.id, scene])),
    [scenes],
  );
  const [order, setOrder] = useState<LocationTask[]>(() => [...tasks]);
  const [index, setIndex] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [finished, setFinished] = useState(false);

  const task = order[index];
  const baseScene = task ? sceneMap.get(task.sceneId) : undefined;

  if (finished) {
    return (
      <section className="panel space-y-4 rounded-2xl p-6">
        <h2 className="font-display text-2xl font-semibold">Результат</h2>
        <p className="text-[var(--ink-soft)]">
          Верно с первой попытки: {firstTryCount} из {order.length}
        </p>
        <button
          type="button"
          className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          onClick={() => {
            const next = shuffleTasks(tasks);
            setOrder(next);
            setIndex(0);
            setCompleted(0);
            setFirstTryCount(0);
            setFinished(false);
          }}
        >
          Пройти ещё раз
        </button>
      </section>
    );
  }

  if (!task || !baseScene) {
    return null;
  }

  return (
    <TaskStep
      key={index}
      task={task}
      baseScene={baseScene}
      vocab={vocab}
      index={index}
      total={order.length}
      completed={completed}
      onSolved={(firstTry) => {
        if (firstTry) {
          setFirstTryCount((value) => value + 1);
        }
        setCompleted((value) => Math.max(value, index + 1));
      }}
      onNext={() => {
        if (index >= order.length - 1) {
          setFinished(true);
          return;
        }
        setIndex((value) => value + 1);
      }}
    />
  );
}
