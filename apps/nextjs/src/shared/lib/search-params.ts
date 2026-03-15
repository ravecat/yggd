type SearchParamValue = string | string[] | undefined;

export function toSearchParamsString(
  params: Readonly<Record<string, SearchParamValue>>,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item));
      continue;
    }

    searchParams.append(key, value);
  }

  return searchParams.toString();
}
