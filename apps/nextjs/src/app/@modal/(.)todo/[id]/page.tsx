import { Suspense } from "react";
import {
  TodoModalContent,
  TodoModalFallback,
} from "./_components/todo-modal-content";

export default function TodoModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<TodoModalFallback />}>
      <TodoModalContent params={params} />
    </Suspense>
  );
}
