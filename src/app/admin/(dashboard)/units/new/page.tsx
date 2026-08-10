import { AdminBackLink } from "@/features/admin/components/AdminBackLink/AdminBackLink";
import { UnitForm } from "@/features/admin/components/UnitForm/UnitForm";
import ui from "@/features/admin/components/adminUi.module.css";

export default function AdminNewUnitPage() {
  return (
    <div className={ui.page}>
      <div className={ui.toolbar}>
        <div className={ui.heading}>
          <AdminBackLink href="/admin/units" />
          <h1 className={ui.title}>Новый юнит</h1>
        </div>
      </div>
      <UnitForm />
    </div>
  );
}
