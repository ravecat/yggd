import type { GetTodosQueryParamsSortEnumKey } from "@rvct/shared";

export const todoSortFields = [
  "priority",
  "updated_at",
  "created_at",
  "title",
] as const;

export type TodoSortField = (typeof todoSortFields)[number];
export type TodoSortDirection = "asc" | "desc";
export type TodoSortRule = {
  field: TodoSortField;
  direction: TodoSortDirection;
};

export const todoSortFieldLabels: Record<TodoSortField, string> = {
  priority: "Priority",
  updated_at: "Last updated",
  created_at: "Created",
  title: "Title",
};

const todoSortFieldSet = new Set<TodoSortField>(todoSortFields);

const defaultDirections: Record<TodoSortField, TodoSortDirection> = {
  priority: "desc",
  updated_at: "desc",
  created_at: "desc",
  title: "asc",
};

function isTodoSortField(value: string): value is TodoSortField {
  return todoSortFieldSet.has(value as TodoSortField);
}

export function decodeTodoSortRule(
  value: string | GetTodosQueryParamsSortEnumKey,
): TodoSortRule | null {
  const field = value.startsWith("-") ? value.slice(1) : value;

  if (!isTodoSortField(field)) {
    return null;
  }

  return {
    field,
    direction: value.startsWith("-") ? "desc" : "asc",
  };
}

export function parseTodoSortRules(
  value?: string | string[] | GetTodosQueryParamsSortEnumKey[],
): TodoSortRule[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];

  return values
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((item) => {
      const rule = decodeTodoSortRule(item);

      return rule ? [rule] : [];
    });
}

export function encodeTodoSortRule(
  rule: TodoSortRule,
): GetTodosQueryParamsSortEnumKey {
  return `${rule.direction === "desc" ? "-" : ""}${rule.field}` as GetTodosQueryParamsSortEnumKey;
}

export function encodeTodoSortRules(rules: TodoSortRule[]): string {
  return rules.map(encodeTodoSortRule).join(",");
}

export function getDefaultTodoSortRule(
  selectedFields: TodoSortField[] = [],
): TodoSortRule {
  const field =
    todoSortFields.find((candidate) => !selectedFields.includes(candidate)) ??
    todoSortFields[0];

  return {
    field,
    direction: defaultDirections[field],
  };
}
