import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import { deleteDictionaryEntryAction } from "@/features/admin/actions/deleteDictionaryEntryAction";
import { AdminBackLink } from "@/features/admin/components/AdminBackLink/AdminBackLink";
import { DeleteEntityButton } from "@/features/admin/components/DeleteEntityButton/DeleteEntityButton";
import { DictionaryEntryForm } from "@/features/admin/components/DictionaryEntryForm/DictionaryEntryForm";
import ui from "@/features/admin/components/adminUi.module.css";
import {
  getDictionaryEntryForAdmin,
  listUnitOptions,
} from "@/features/admin/data/adminContentRepository";

type AdminEditDictionaryEntryPageProps = {
  params: Promise<{ id: string }>;
};

async function AdminEditDictionaryEntryContent({ params }: AdminEditDictionaryEntryPageProps) {
  const { id } = await params;
  const [entry, unitOptions] = await Promise.all([
    getDictionaryEntryForAdmin(id),
    listUnitOptions(),
  ]);

  if (!entry) {
    notFound();
  }

  return (
    <div className={ui.page}>
      <div className={ui.toolbar}>
        <div className={ui.heading}>
          <AdminBackLink href="/admin/dictionary" />
          <h1 className={ui.title}>Редактирование статьи</h1>
        </div>
      </div>
      <DictionaryEntryForm
        actionsExtra={
          <DeleteEntityButton
            action={deleteDictionaryEntryAction}
            entityLabel="словарную статью"
            id={id}
          />
        }
        initialValues={entry}
        unitOptions={unitOptions}
      />
    </div>
  );
}

export default function AdminEditDictionaryEntryPage(props: AdminEditDictionaryEntryPageProps) {
  return (
    <Suspense fallback={<CatalogSectionSkeleton label="Загрузка статьи…" />}>
      <AdminEditDictionaryEntryContent {...props} />
    </Suspense>
  );
}
