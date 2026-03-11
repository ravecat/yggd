import { Suspense } from "react";
import {
  IndexPageContent,
  IndexPageFallback,
} from "./_components/index-page-content";

export default function Index() {
  return (
    <Suspense fallback={<IndexPageFallback />}>
      <IndexPageContent />
    </Suspense>
  );
}
