import Link from "next/link";

import ui from "@/features/admin/components/adminUi.module.css";
import { listUnitsForAdmin } from "@/features/admin/data/adminContentRepository";
import { STATUS_LABELS } from "@/features/admin/domain/statusLabels";
import { formatUpdatedAt } from "@/features/admin/presentation/adminUiHelpers";

export default async function AdminUnitsPage() {
  const units = await listUnitsForAdmin();

  return (
    <div className={ui.page}>
      <div className={ui.toolbar}>
        <h1 className={ui.title}>Юниты</h1>
        <Link
          aria-label="Новый юнит"
          className={ui.toolbarLink}
          href="/admin/units/new"
        >
          <svg aria-hidden="true" className={ui.toolbarLinkPlus} viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      </div>

      {units.length === 0 ? (
        <p className={ui.empty}>Юнитов пока нет</p>
      ) : (
        <div className={ui.tableWrap}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th>Slug</th>
                <th>№</th>
                <th>Название (ru)</th>
                <th>Уровень</th>
                <th>Статус</th>
                <th>Версия</th>
                <th>Обновлено</th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id}>
                  <td>
                    <Link
                      aria-label={`Открыть юнит «${unit.titleRu}»`}
                      className={ui.rowStretchLink}
                      href={`/admin/units/${unit.id}`}
                    >
                      {unit.slug}
                    </Link>
                  </td>
                  <td>{unit.unitNumber ?? "—"}</td>
                  <td>{unit.titleRu}</td>
                  <td>{unit.level}</td>
                  <td>{STATUS_LABELS[unit.status] ?? unit.status}</td>
                  <td>{unit.contentVersion}</td>
                  <td>{formatUpdatedAt(unit.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
