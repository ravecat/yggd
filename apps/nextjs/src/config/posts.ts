export const POSTS_DEFAULT_PARAMS = {
  limit: 10,
  offset: 0,
  sort: "-created_at",
} as const;

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
