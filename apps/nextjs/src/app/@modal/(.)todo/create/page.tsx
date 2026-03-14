"use client";

import {
  attributesPriorityEnum2,
  type AttributesPriorityEnum2Key,
  attributesStatusEnum2,
  type AttributesStatusEnum2Key,
} from "@rvct/shared";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useActionState, useState } from "react";
import { createTodo } from "~/features/todos/mutations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/shared/ui/dialog";
import { Button } from "~/shared/ui/button";
import { Input } from "~/shared/ui/input";
import { Label } from "~/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/shared/ui/select";
import { Textarea } from "~/shared/ui/textarea";

function CreateTodoModalFallback() {
  return (
    <Dialog open>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Todo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-16 rounded bg-muted" />
            <div className="h-10 rounded-md bg-muted" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="min-h-[200px] rounded-md bg-muted" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-10 rounded-md bg-muted" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-14 rounded bg-muted" />
              <div className="h-10 rounded-md bg-muted" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <div className="h-10 w-20 rounded-md bg-muted" />
            <div className="h-10 w-24 rounded-md bg-muted" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateTodoModalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const boardId = searchParams.get("boardId");
  const [state, submit, pending] = useActionState(createTodo, {
    errors: {},
    message: "",
  });
  const [priority, setPriority] = useState<AttributesPriorityEnum2Key>(
    attributesPriorityEnum2.medium,
  );
  const [status, setStatus] = useState<AttributesStatusEnum2Key>(
    attributesStatusEnum2.backlog,
  );

  return (
    <Dialog open onOpenChange={(open) => !open && router.back()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Todo</DialogTitle>
        </DialogHeader>

        <form action={submit} className="space-y-4">
          <input type="hidden" name="boardId" value={boardId ?? ""} />
          <input type="hidden" name="priority" value={priority} />
          <input type="hidden" name="status" value={status} />

          <div>
            <Label htmlFor="title" className="mb-2">
              Title *
            </Label>
            <Input
              id="title"
              name="title"
              disabled={pending}
              placeholder="Enter todo title"
              aria-describedby={state.errors?.title ? "title-error" : undefined}
            />
            {state.errors?.title && (
              <p id="title-error" className="mt-1 text-sm text-red-600">
                {state.errors.title.join(", ")}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="content" className="mb-2">
              Content *
            </Label>
            <Textarea
              id="content"
              name="content"
              className="min-h-[200px]"
              disabled={pending}
              placeholder="Describe your todo..."
              aria-describedby={
                state.errors?.content ? "content-error" : undefined
              }
            />
            {state.errors?.content && (
              <p id="content-error" className="mt-1 text-sm text-red-600">
                {state.errors.content.join(", ")}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="priority" className="mb-2">
                Priority
              </Label>
              <Select
                value={priority}
                onValueChange={(value) =>
                  setPriority(value as AttributesPriorityEnum2Key)
                }
                disabled={pending}
              >
                <SelectTrigger
                  id="priority"
                  aria-describedby={
                    state.errors?.priority ? "priority-error" : undefined
                  }
                >
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.values(
                      attributesPriorityEnum2,
                    ) as AttributesPriorityEnum2Key[]
                  ).map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.priority && (
                <p id="priority-error" className="mt-1 text-sm text-red-600">
                  {state.errors.priority.join(", ")}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="status" className="mb-2">
                Status
              </Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setStatus(value as AttributesStatusEnum2Key)
                }
                disabled={pending}
              >
                <SelectTrigger
                  id="status"
                  aria-describedby={
                    state.errors?.status ? "status-error" : undefined
                  }
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.values(
                      attributesStatusEnum2,
                    ) as AttributesStatusEnum2Key[]
                  ).map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.status && (
                <p id="status-error" className="mt-1 text-sm text-red-600">
                  {state.errors.status.join(", ")}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Todo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function CreateTodoModal() {
  return (
    <Suspense fallback={<CreateTodoModalFallback />}>
      <CreateTodoModalContent />
    </Suspense>
  );
}
