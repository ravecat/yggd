export const TODOS_CONFIG = {
  page: {
    limit: {
      default: 10,
      min: 1,
      max: 100,
    },
    offset: {
      default: 0,
      min: 0,
    },
  },
  sort: {
    default: "-created_at",
    options: [
      {
        field: "created_at" as const,
        label: "Creation date",
      },
      {
        field: "title" as const,
        label: "Title",
      },
    ],
  },
  filter: {},
  include: {},
  fields: {},
} as const;

export type TodoSortOption = (typeof TODOS_CONFIG.sort.options)[number];
export type TodoSortField = TodoSortOption["field"];
export type TodoSortConfig = typeof TODOS_CONFIG.sort;
