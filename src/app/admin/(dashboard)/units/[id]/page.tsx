import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import { deleteUnitAction } from "@/features/admin/actions/deleteUnitAction";
import { AdminBackLink } from "@/features/admin/components/AdminBackLink/AdminBackLink";
import { DeleteEntityButton } from "@/features/admin/components/DeleteEntityButton/DeleteEntityButton";
import { UnitForm } from "@/features/admin/components/UnitForm/UnitForm";
import ui from "@/features/admin/components/adminUi.module.css";
import { getUnitForAdmin } from "@/features/admin/data/adminContentRepository";

type AdminEditUnitPageProps = {
  params: Promise<{ id: string }>;
};

async function AdminEditUnitContent({ params }: AdminEditUnitPageProps) {
  const { id } = await params;
  const unit = await getUnitForAdmin(id);
  if (!unit) {
    notFound();
  }

  return (
    <div className={ui.page}>
      <div className={ui.toolbar}>
        <div className={ui.heading}>
          <AdminBackLink href="/admin/units" />
          <h1 className={ui.title}>Редактирование юнита</h1>
        </div>
      </div>
      <UnitForm
        actionsExtra={
          <DeleteEntityButton action={deleteUnitAction} entityLabel="юнит" id={id} />
        }
        initialValues={unit}
      />
    </div>
  );
}

export default function AdminEditUnitPage(props: AdminEditUnitPageProps) {
  return (
    <Suspense fallback={<CatalogSectionSkeleton label="Загрузка юнита…" />}>
      <AdminEditUnitContent {...props} />
    </Suspense>
  );
}
