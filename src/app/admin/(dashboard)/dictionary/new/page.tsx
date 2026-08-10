import { AdminBackLink } from "@/features/admin/components/AdminBackLink/AdminBackLink";
import { DictionaryEntryForm } from "@/features/admin/components/DictionaryEntryForm/DictionaryEntryForm";
import ui from "@/features/admin/components/adminUi.module.css";
import { listUnitOptions } from "@/features/admin/data/adminContentRepository";

export default async function AdminNewDictionaryEntryPage() {
  const unitOptions = await listUnitOptions();

  return (
    <div className={ui.page}>
      <div className={ui.toolbar}>
        <div className={ui.heading}>
          <AdminBackLink href="/admin/dictionary" />
          <h1 className={ui.title}>Новая статья</h1>
        </div>
      </div>
      <DictionaryEntryForm unitOptions={unitOptions} />
    </div>
  );
}
