import Link from "next/link";

import ui from "@/features/admin/components/adminUi.module.css";
import { listDictionaryEntriesForAdmin } from "@/features/admin/data/adminContentRepository";
import { STATUS_LABELS } from "@/features/admin/domain/statusLabels";
import { formatUpdatedAt } from "@/features/admin/presentation/adminUiHelpers";

export default async function AdminDictionaryPage() {
  const entries = await listDictionaryEntriesForAdmin();

  return (
    <div className={ui.page}>
      <div className={ui.toolbar}>
        <h1 className={ui.title}>Словарь</h1>
        <Link
          aria-label="Новая статья"
          className={ui.toolbarLink}
          href="/admin/dictionary/new"
        >
          <svg aria-hidden="true" className={ui.toolbarLinkPlus} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className={ui.empty}>Статей пока нет</p>
      ) : (
        <div className={ui.tableWrap}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th>Lemma (ko)</th>
                <th>Часть речи</th>
                <th>Статус</th>
                <th>Версия</th>
                <th>Обновлено</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <Link
                      aria-label={`Открыть статью «${entry.lemmaKo}»`}
                      className={ui.rowStretchLink}
                      href={`/admin/dictionary/${entry.id}`}
                    >
                      {entry.lemmaKo}
                    </Link>
                  </td>
                  <td>{entry.partOfSpeech}</td>
                  <td>{STATUS_LABELS[entry.status] ?? entry.status}</td>
                  <td>{entry.contentVersion}</td>
                  <td>{formatUpdatedAt(entry.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
