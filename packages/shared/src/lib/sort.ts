export type SortDirection = "asc" | "desc";
export type SortCycleStep = SortDirection | "off";

export type SortItem<TField extends string = string> = {
  direction: SortDirection;
  field: TField;
};

export type SortCodecOptions = {
  cycle?: readonly SortCycleStep[];
  descendingPrefix?: string;
  separator?: string;
};

export type SortFieldDefinition<TField extends string = string> = {
  field: TField;
};

export type SortModel<TField extends string = string> = {
  items: readonly SortItem<TField>[];
  getDirection: (field: TField) => SortDirection | null;
  toggle: (field: TField) => string | undefined;
};

export type BuiltSortField<
  TQueryParams extends { sort?: string },
  TField extends string = string,
> = {
  active: boolean;
  asc: boolean;
  desc: boolean;
  direction: SortDirection | null;
  field: TField;
  nextQuery: TQueryParams;
};

export type QuerySortPreset<
  TQueryParams extends { sort?: string },
  TField extends string = string,
> = {
  build: (query: TQueryParams) => BuiltSortField<TQueryParams, TField>[];
  fields: readonly SortFieldDefinition<TField>[];
};

export type QuerySortPresetOptions<TField extends string = string> = {
  fields: readonly SortFieldDefinition<TField>[];
  sort?: SortCodecOptions;
};

const DEFAULT_SORT_OPTIONS = {
  cycle: ["desc", "asc", "off"] as const,
  descendingPrefix: "-",
  separator: ",",
} satisfies Required<SortCodecOptions>;

function resolveOptions(options: SortCodecOptions = {}) {
  return {
    cycle:
      options.cycle && options.cycle.length > 0
        ? options.cycle
        : DEFAULT_SORT_OPTIONS.cycle,
    descendingPrefix:
      options.descendingPrefix ?? DEFAULT_SORT_OPTIONS.descendingPrefix,
    separator: options.separator ?? DEFAULT_SORT_OPTIONS.separator,
  };
}

export function parseSortValue<TField extends string = string>(
  value?: string,
  options?: SortCodecOptions,
): SortItem<TField>[] {
  if (!value) {
    return [];
  }

  const { descendingPrefix, separator } = resolveOptions(options);

  return value
    .split(separator)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .map((item) =>
      item.startsWith(descendingPrefix)
        ? {
            direction: "desc" as const,
            field: item.slice(descendingPrefix.length) as TField,
          }
        : { direction: "asc" as const, field: item as TField },
    );
}

export function formatSortValue<TField extends string = string>(
  items: readonly SortItem<TField>[],
  options?: SortCodecOptions,
): string | undefined {
  if (items.length === 0) {
    return undefined;
  }

  const { descendingPrefix, separator } = resolveOptions(options);

  return items
    .map((item) =>
      item.direction === "desc"
        ? `${descendingPrefix}${item.field}`
        : item.field,
    )
    .join(separator);
}

export function getSortDirection<TField extends string = string>(
  items: readonly SortItem<TField>[],
  field: TField,
): SortDirection | null {
  return items.find((item) => item.field === field)?.direction ?? null;
}

export function toggleSortField<TField extends string = string>(
  items: readonly SortItem<TField>[],
  field: TField,
  options?: SortCodecOptions,
): SortItem<TField>[] {
  const { cycle } = resolveOptions(options);
  const currentDirection = getSortDirection(items, field) ?? "off";
  const currentIndex = cycle.indexOf(currentDirection);
  const nextDirection =
    currentIndex === -1 || currentIndex === cycle.length - 1
      ? cycle[0]
      : cycle[currentIndex + 1];

  if (nextDirection === "off") {
    return items.filter((item) => item.field !== field);
  }

  const nextItem = { field, direction: nextDirection };

  if (currentDirection === "off") {
    return [...items, nextItem];
  }

  return items.map((item) => (item.field === field ? nextItem : item));
}

export function createSortModel<TField extends string = string>(
  value?: string,
  options?: SortCodecOptions,
): SortModel<TField> {
  const items = parseSortValue<TField>(value, options);

  return {
    items,
    getDirection: (field) => getSortDirection(items, field),
    toggle: (field) =>
      formatSortValue(toggleSortField(items, field, options), options),
  };
}

function withSort<TQueryParams extends { sort?: string }>(
  query: TQueryParams,
  sort: string | undefined,
): TQueryParams {
  return {
    ...query,
    sort,
  };
}

export function createQuerySortPreset<
  TQueryParams extends { sort?: string },
  TField extends string = string,
>({
  fields,
  sort: sortOptions,
}: QuerySortPresetOptions<TField>): QuerySortPreset<TQueryParams, TField> {
  return {
    fields,
    build: (query) => {
      const sort = createSortModel<TField>(query.sort, sortOptions);

      return fields.map((fieldDefinition) => {
        const direction = sort.getDirection(fieldDefinition.field);
        const nextSort = sort.toggle(fieldDefinition.field);
        const nextQuery = withSort(query, nextSort);

        return {
          field: fieldDefinition.field,
          direction,
          asc: direction === "asc",
          desc: direction === "desc",
          active: direction !== null,
          nextQuery,
        };
      });
    },
  };
}
