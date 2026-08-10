import Link from "next/link";

import { AdminGrammarFilters } from "@/features/admin/components/AdminGrammarFilters/AdminGrammarFilters";
import { AdminListPager } from "@/features/admin/components/AdminListPager/AdminListPager";
import ui from "@/features/admin/components/adminUi.module.css";
import {
  listGrammarTopicsForAdmin,
  listUnitOptions,
} from "@/features/admin/data/adminContentRepository";
import { STATUS_LABELS } from "@/features/admin/domain/statusLabels";
import { formatUpdatedAt } from "@/features/admin/presentation/adminUiHelpers";
import {
  buildAdminGrammarHref,
  paginateAdminGrammarTopics,
  parseAdminGrammarQuery,
} from "@/features/admin/presentation/parseAdminGrammarQuery";

type AdminGrammarPageProps = {
  searchParams?: Promise<{
    q?: string | string[];
    status?: string | string[];
    unit?: string | string[];
    page?: string | string[];
  }>;
};

export default async function AdminGrammarPage({
  searchParams = Promise.resolve({}),
}: AdminGrammarPageProps) {
  const query = parseAdminGrammarQuery(await searchParams);
  const [topics, units] = await Promise.all([
    listGrammarTopicsForAdmin(),
    listUnitOptions(),
  ]);
  const pageResult = paginateAdminGrammarTopics(topics, query);
  const unitOptions = units.map((unit) => ({
    value: unit.id,
    label: `${unit.slug} — ${unit.titleRu}`,
  }));
  const filterQuery = {
    q: query.q,
    status: query.status,
    unitId: query.unitId,
  };

  return (
    <div className={ui.page}>
      <div className={ui.toolbar}>
        <h1 className={ui.title}>Грамматика</h1>
        <Link
          aria-label="Новая конструкция"
          className={ui.toolbarLink}
          href="/admin/grammar/new"
        >
          <svg aria-hidden="true" className={ui.toolbarLinkPlus} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      </div>

      <AdminGrammarFilters
        q={query.q}
        status={query.status}
        unitId={query.unitId}
        unitOptions={unitOptions}
      />

      {pageResult.total === 0 ? (
        <p className={ui.empty}>
          {topics.length === 0 ? "Конструкций пока нет" : "Ничего не найдено по фильтрам"}
        </p>
      ) : (
        <>
          <p className={ui.listMeta}>
            Показано {pageResult.items.length} из {pageResult.total}
          </p>
          <div className={ui.tableWrap}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Pattern (ko)</th>
                  <th>Название (ru)</th>
                  <th>Статус</th>
                  <th>Обновлено</th>
                </tr>
              </thead>
              <tbody>
                {pageResult.items.map((topic) => (
                  <tr key={topic.id}>
                    <td>
                      <Link
                        aria-label={`Открыть конструкцию «${topic.titleRu}»`}
                        className={ui.rowStretchLink}
                        href={`/admin/grammar/${topic.id}`}
                      >
                        {topic.patternKo}
                      </Link>
                    </td>
                    <td>{topic.titleRu}</td>
                    <td>{STATUS_LABELS[topic.status] ?? topic.status}</td>
                    <td>{formatUpdatedAt(topic.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminListPager
            ariaLabel="Страницы грамматики"
            nextHref={
              pageResult.page < pageResult.totalPages
                ? buildAdminGrammarHref({ ...filterQuery, page: pageResult.page + 1 })
                : null
            }
            page={pageResult.page}
            prevHref={
              pageResult.page > 1
                ? buildAdminGrammarHref({ ...filterQuery, page: pageResult.page - 1 })
                : null
            }
            totalPages={pageResult.totalPages}
          />
        </>
      )}
    </div>
  );
}
