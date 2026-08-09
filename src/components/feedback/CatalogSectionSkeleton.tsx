import { LoadingView } from "@/components/feedback";
import { PageContainer } from "@/wrappers";

export function CatalogSectionSkeleton({ label }: { readonly label: string }) {
  return (
    <PageContainer aria-busy="true">
      <LoadingView label={label} />
    </PageContainer>
  );
}
