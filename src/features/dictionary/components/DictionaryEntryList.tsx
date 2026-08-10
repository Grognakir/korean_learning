import Link from "next/link";

import type { PublicDictionaryEntry } from "../domain/types";
import { getPartOfSpeechLabel, getUnitLabels } from "../presentation/dictionaryLabels";
import { buildDictionaryHref } from "../presentation/parseDictionaryQuery";
import { withHomonymLabels } from "../presentation/homonymLabels";

import styles from "./DictionaryEntryList.module.css";

type DictionaryEntryListProps = {
  readonly items: readonly PublicDictionaryEntry[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly unitSlug: string | null;
  readonly pos: string | null;
  readonly homonymLemmas: readonly string[];
};

export function DictionaryEntryList({
  items,
  total,
  page,
  pageSize,
  unitSlug,
  pos,
  homonymLemmas,
}: DictionaryEntryListProps) {
  const labeled = withHomonymLabels(items, homonymLemmas);
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);

  return (
    <div className={styles.root}>
      <p className={styles.meta}>
        Показано {items.length} из {total}
      </p>

      <ul className={styles.list}>
        {labeled.map((entry) => (
          <li key={entry.logicalId} className={styles.card}>
            <div className={styles.head}>
              <p className={styles.lemma} lang="ko">
                {entry.lemma}
              </p>
              {entry.showSenseLabel ? (
                <span className={styles.sense}>значение: {entry.senseKey}</span>
              ) : null}
            </div>
            <p className={styles.gloss}>{entry.gloss.ru}</p>
            <div className={styles.metaRow}>
              {entry.pos ? <span>{getPartOfSpeechLabel(entry.pos)}</span> : null}
              {entry.unitSlugs.length > 0 ? <span>{getUnitLabels(entry.unitSlugs)}</span> : null}
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 ? (
        <nav aria-label="Страницы словаря" className={styles.pager}>
          {page > 1 ? (
            <Link
              className={styles.pageLink}
              href={buildDictionaryHref({ unitSlug, pos, page: page - 1 })}
              prefetch
            >
              Назад
            </Link>
          ) : (
            <span className={styles.pageDisabled}>Назад</span>
          )}
          <span className={styles.pageStatus}>
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              className={styles.pageLink}
              href={buildDictionaryHref({ unitSlug, pos, page: page + 1 })}
              prefetch
            >
              Дальше
            </Link>
          ) : (
            <span className={styles.pageDisabled}>Дальше</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}
