import React from 'react';
import { cn } from '../utils';
import { MinimalCard } from '../cards/minimal-card';

export interface Column<T = any> {
  key: string;
  header: string | React.ReactNode;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  sortable?: boolean;
  pagination?: PaginationConfig;
  onRowClick?: (row: T, index: number) => void;
  actions?: (row: T, index: number) => React.ReactNode;
  emptyState?: React.ReactNode;
  stickyHeader?: boolean;
  className?: string;
}

/**
 * DataTable - Professional table component
 * Supports sorting, pagination, row actions, and mobile responsive cards
 */
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  sortable = false,
  pagination,
  onRowClick,
  actions,
  emptyState,
  stickyHeader = true,
  className,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);

  // Handle sort
  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    setSortConfig((current) => {
      if (current?.key === columnKey) {
        return {
          key: columnKey,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue > bValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  // Empty state
  if (data.length === 0 && emptyState) {
    return <div>{emptyState}</div>;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className={cn(stickyHeader && 'sticky top-0 z-10 bg-white')}>
            <tr className="border-b border-slate-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider',
                    column.sortable && sortable && 'cursor-pointer hover:text-slate-700 select-none'
                  )}
                  onClick={() => column.sortable && sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && sortable && (
                      <span className="text-slate-400">
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : (
                          '↕'
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row, rowIndex)}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-slate-50'
                )}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-4 text-sm text-slate-900">
                    {column.render
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-4 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      {actions(row, rowIndex)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {sortedData.map((row, rowIndex) => (
          <MinimalCard
            key={rowIndex}
            padding="md"
            hover={!!onRowClick}
            onClick={() => onRowClick?.(row, rowIndex)}
          >
            {columns.map((column) => (
              <div key={column.key} className="flex justify-between items-start py-2">
                <span className="text-xs font-medium text-slate-500 uppercase">
                  {typeof column.header === 'string' ? column.header : column.key}
                </span>
                <span className="text-sm text-slate-900 text-right ml-4">
                  {column.render
                    ? column.render(row[column.key], row, rowIndex)
                    : row[column.key]}
                </span>
              </div>
            ))}
            {actions && (
              <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-slate-100">
                {actions(row, rowIndex)}
              </div>
            )}
          </MinimalCard>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-slate-600">
            Showing {((pagination.currentPage - 1) * pagination.pageSize) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {[...Array(pagination.totalPages)].map((_, i) => {
              const page = i + 1;
              // Show first, last, current, and adjacent pages
              if (
                page === 1 ||
                page === pagination.totalPages ||
                Math.abs(page - pagination.currentPage) <= 1
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => pagination.onPageChange(page)}
                    className={cn(
                      'px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                      page === pagination.currentPage
                        ? 'bg-primary text-white'
                        : 'text-slate-700 bg-white border border-slate-200 hover:bg-slate-50'
                    )}
                  >
                    {page}
                  </button>
                );
              } else if (Math.abs(page - pagination.currentPage) === 2) {
                return <span key={page} className="px-2 text-slate-400">...</span>;
              }
              return null;
            })}
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
