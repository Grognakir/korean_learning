"use client";

import { useEffect } from "react";

import { RouteError } from "@/components/feedback";
import { PageContainer } from "@/wrappers";

type AppErrorProps = {
  readonly error: Error & { digest?: string };
  readonly retry: () => void;
};

export default function AppError({ error, retry }: AppErrorProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    console.error(error);
  }, [error]);

  return (
    <PageContainer className="page-section">
      <RouteError onRetry={retry} />
    </PageContainer>
  );
}
