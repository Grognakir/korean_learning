import type { ContentVersion, LocalizedText } from "@/types";

export type PublicDictionaryEntry = {
  readonly id: string;
  readonly logicalId: string;
  readonly lemma: string;
  readonly senseKey: string;
  readonly gloss: LocalizedText;
  readonly transliteration: string | null;
  readonly pos: string | null;
  readonly level: string | null;
  readonly unitSlugs: readonly string[];
  readonly contentVersion: ContentVersion;
  readonly language: { readonly lemma: "ko"; readonly gloss: "ru" };
};
