import { LoadingView } from "@/components/feedback";
import { PageContainer } from "@/wrappers";

export default function ModuleLoading() {
  return (
    <PageContainer>
      <LoadingView label="Загрузка модуля…" />
    </PageContainer>
  );
}
