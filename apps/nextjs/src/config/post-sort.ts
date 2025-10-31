export const POST_SORT_OPTIONS = [
  {
    field: "created_at" as const,
    label: "Creation date",
  },
  {
    field: "title" as const,
    label: "Title",
  },
] as const;

export type PostSortField = (typeof POST_SORT_OPTIONS)[number]["field"];
