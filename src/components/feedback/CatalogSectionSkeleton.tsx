import { LoadingView } from "@/components/feedback";
import { PageContainer } from "@/wrappers";

export function CatalogSectionSkeleton({ label }: { readonly label: string }) {
  return (
    <PageContainer aria-busy="true" className="page-section">
      <LoadingView label={label} />
    </PageContainer>
  );
}
