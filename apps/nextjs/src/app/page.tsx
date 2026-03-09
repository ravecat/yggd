import { ControlPanel } from "./_components/control-panel";
import { TodosList } from "./_components/todos-list";
import { TodosProvider } from "~/contexts/todos";
import { assigns } from "~/shared/lib/session";
import { fetchCurrentUserTodos } from "~/shared/lib/todos";

export default async function Index() {
  const { userId } = await assigns();

  if (!userId) {
    return (
      <div className="h-full overflow-hidden">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
          <p className="py-2 text-sm text-muted-foreground">
            Dynamic board grouped by status for daily task tracking (JSON:API)
          </p>
          <div className="flex min-h-80 flex-1 items-center justify-center px-6 text-center">
            <p className="text-sm font-medium text-foreground">
              Sign in to manage tasks.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { statuses, todos } = await fetchCurrentUserTodos();

  return (
    <div className="h-full overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col gap-2 px-4">
        <p className="py-2 text-sm text-muted-foreground">
          Dynamic board grouped by status for daily task tracking (JSON:API)
        </p>
        <TodosProvider statuses={statuses} todos={todos}>
          <ControlPanel canCreate />
          <TodosList />
        </TodosProvider>
      </div>
    </div>
  );
}
