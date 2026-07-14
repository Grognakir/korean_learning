"use client";

import { useState } from "react";
import { SkinSwitcher } from "@/components/scene/SkinSwitcher";
import { RhythmGame } from "@/components/topics/location/RhythmGame";
import { TaskRunner } from "@/components/topics/location/TaskRunner";
import type { LocationTask, VocabWord } from "@/content/topics/location";
import type { Scene } from "@/lib/scene/types";

type LocationTopicProps = {
  tasks: LocationTask[];
  scenes: Scene[];
  vocab: VocabWord[];
};

type TabId = "tasks" | "words";

export function LocationTopic({ tasks, scenes, vocab }: LocationTopicProps) {
  const [tab, setTab] = useState<TabId>("tasks");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("tasks")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            tab === "tasks"
              ? "bg-[var(--accent)] text-white"
              : "border border-[var(--line)] bg-white/70 text-[var(--ink)] hover:border-[var(--accent)]"
          }`}
        >
          Задания
        </button>
        <button
          type="button"
          onClick={() => setTab("words")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            tab === "words"
              ? "bg-[var(--accent)] text-white"
              : "border border-[var(--line)] bg-white/70 text-[var(--ink)] hover:border-[var(--accent)]"
          }`}
        >
          Слова
        </button>
      </div>

      {tab === "tasks" ? (
        <TaskRunner tasks={tasks} scenes={scenes} vocab={vocab} />
      ) : (
        <RhythmGame vocab={vocab} />
      )}
      <SkinSwitcher />
    </div>
  );
}
