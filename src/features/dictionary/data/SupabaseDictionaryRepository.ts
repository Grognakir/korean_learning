import { unstable_cache } from "next/cache";

import { createServerSupabaseClient } from "@/lib/supabase/serverClient";

import type { DictionaryQuery, DictionaryRepository } from "./DictionaryRepository";
import type { PublicDictionaryEntry } from "../domain/types";

async function loadPublishedDictionary(): Promise<readonly PublicDictionaryEntry[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("dictionary_entries")
    .select(
      "id, logical_id, lemma_ko, sense_key, meanings_ru, transliteration, part_of_speech, level, content_version",
    )
    .eq("status", "published")
    .order("lemma_ko", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => {
    const meanings = Array.isArray(row.meanings_ru) ? row.meanings_ru : [];
    const firstMeaning = typeof meanings[0] === "string" ? meanings[0] : row.lemma_ko;
    return {
      id: row.id,
      logicalId: row.logical_id,
      lemma: row.lemma_ko,
      senseKey: row.sense_key,
      gloss: { ko: row.lemma_ko, ru: String(firstMeaning) },
      transliteration: row.transliteration,
      pos: row.part_of_speech,
      level: row.level,
      unitSlugs: [],
      contentVersion: row.content_version as PublicDictionaryEntry["contentVersion"],
      language: { lemma: "ko" as const, gloss: "ru" as const },
    };
  });
}

const getCachedDictionary = unstable_cache(loadPublishedDictionary, ["curriculum-dictionary"], {
  tags: ["curriculum-dictionary"],
  revalidate: 3600,
});

export class SupabaseDictionaryRepository implements DictionaryRepository {
  async list(query: DictionaryQuery = {}): Promise<readonly PublicDictionaryEntry[]> {
    let items = await getCachedDictionary();
    if (query.lemma) {
      items = items.filter((entry) => entry.lemma === query.lemma);
    }
    if (query.unitSlug) {
      items = items.filter((entry) => entry.unitSlugs.includes(query.unitSlug!));
    }
    return items;
  }

  async getByLogicalId(logicalId: string): Promise<PublicDictionaryEntry | undefined> {
    const items = await this.list();
    return items.find((entry) => entry.logicalId === logicalId);
  }
}
