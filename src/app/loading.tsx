import { LoadingView } from "@/components/feedback";
import { PageContainer } from "@/wrappers";

export default function Loading() {
  return (
    <PageContainer>
      <LoadingView label="Загрузка страницы…" />
    </PageContainer>
  );
}
