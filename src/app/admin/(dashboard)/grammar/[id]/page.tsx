import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CatalogSectionSkeleton } from "@/components/feedback";
import { deleteGrammarTopicAction } from "@/features/admin/actions/deleteGrammarTopicAction";
import { AdminBackLink } from "@/features/admin/components/AdminBackLink/AdminBackLink";
import { DeleteEntityButton } from "@/features/admin/components/DeleteEntityButton/DeleteEntityButton";
import { GrammarTopicForm } from "@/features/admin/components/GrammarTopicForm/GrammarTopicForm";
import ui from "@/features/admin/components/adminUi.module.css";
import {
  getGrammarTopicForAdmin,
  listUnitOptions,
} from "@/features/admin/data/adminContentRepository";

type AdminEditGrammarTopicPageProps = {
  params: Promise<{ id: string }>;
};

async function AdminEditGrammarTopicContent({ params }: AdminEditGrammarTopicPageProps) {
  const { id } = await params;
  const [topic, unitOptions] = await Promise.all([
    getGrammarTopicForAdmin(id),
    listUnitOptions(),
  ]);

  if (!topic) {
    notFound();
  }

  return (
    <div className={ui.page}>
      <div className={ui.toolbar}>
        <div className={ui.heading}>
          <AdminBackLink href="/admin/grammar" />
          <h1 className={ui.title}>Редактирование конструкции</h1>
        </div>
      </div>
      <GrammarTopicForm
        actionsExtra={
          <DeleteEntityButton
            action={deleteGrammarTopicAction}
            entityLabel="конструкцию"
            id={id}
          />
        }
        initialValues={topic}
        unitOptions={unitOptions}
      />
    </div>
  );
}

export default function AdminEditGrammarTopicPage(props: AdminEditGrammarTopicPageProps) {
  return (
    <Suspense fallback={<CatalogSectionSkeleton label="Загрузка конструкции…" />}>
      <AdminEditGrammarTopicContent {...props} />
    </Suspense>
  );
}
