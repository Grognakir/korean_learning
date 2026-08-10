import { AdminBackLink } from "@/features/admin/components/AdminBackLink/AdminBackLink";
import { GrammarTopicForm } from "@/features/admin/components/GrammarTopicForm/GrammarTopicForm";
import ui from "@/features/admin/components/adminUi.module.css";
import { listUnitOptions } from "@/features/admin/data/adminContentRepository";

export default async function AdminNewGrammarTopicPage() {
  const unitOptions = await listUnitOptions();

  return (
    <div className={ui.page}>
      <div className={ui.toolbar}>
        <div className={ui.heading}>
          <AdminBackLink href="/admin/grammar" />
          <h1 className={ui.title}>Новая конструкция</h1>
        </div>
      </div>
      <GrammarTopicForm unitOptions={unitOptions} />
    </div>
  );
}
