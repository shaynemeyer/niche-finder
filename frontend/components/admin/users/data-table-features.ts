import {
  createSortedRowModel,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from '@tanstack/react-table';

/**
 * v9 registers only the features a table uses, rather than including
 * everything by default - see docs/tanstack-table.md. Sorting is the only
 * table-owned behaviour here; the search box filters users-section.tsx's
 * data before it reaches the table, so column filtering isn't registered.
 */
export const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
});

export type DataTableFeatures = typeof features;
