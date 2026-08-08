import { LoadingView } from "@/components/feedback";
import { PageContainer } from "@/wrappers";

export default function SessionLoading() {
  return (
    <PageContainer width="narrow">
      <LoadingView label="Загрузка сессии…" />
    </PageContainer>
  );
}
