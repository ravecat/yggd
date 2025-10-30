/**
 * Generates an array of page numbers for pagination display.
 * Maximum 5 visible page numbers following the algorithm:
 * - If totalPages <= 5: show all pages
 * - If currentPage <= 3: show [1, 2, 3, 4, 5]
 * - If currentPage >= totalPages - 2: show last 5 pages
 * - Otherwise: show [currentPage-2, currentPage-1, currentPage, currentPage+1, currentPage+2]
 *
 * @param currentPage - The current active page (1-indexed)
 * @param totalPages - Total number of pages available
 * @returns Array of page numbers to display
 *
 * @example
 * generatePageNumbers(1, 10) // [1, 2, 3, 4, 5]
 * generatePageNumbers(5, 10) // [3, 4, 5, 6, 7]
 * generatePageNumbers(10, 10) // [6, 7, 8, 9, 10]
 * generatePageNumbers(2, 3) // [1, 2, 3]
 */
export function generatePageNumbers(
  currentPage: number,
  totalPages: number
): number[] {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5];
  }

  if (currentPage >= totalPages - 2) {
    return [
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    currentPage - 2,
    currentPage - 1,
    currentPage,
    currentPage + 1,
    currentPage + 2,
  ];
}
