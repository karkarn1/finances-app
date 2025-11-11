/**
 * DataTable Component - Reusable table with loading, empty states, and row actions
 */

import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { ReactNode } from 'react';

/**
 * Column definition for DataTable.
 * @template T - Type of the data objects
 */
export interface DataTableColumn<T> {
  /** Column header label */
  label: string;
  /** Key to access value in data object */
  key?: keyof T;
  /** Custom render function for cell content */
  render?: (row: T) => ReactNode;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Column width (CSS value) */
  width?: string | number;
}

/**
 * Action definition for row actions.
 * @template T - Type of the data objects
 */
export interface DataTableAction<T> {
  /** Icon to display */
  icon: ReactNode;
  /** Click handler */
  onClick: (row: T) => void;
  /** Tooltip/aria-label */
  label: string;
  /** Color of the icon button */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'default';
}

/**
 * Props for DataTable component.
 * @template T - Type of the data objects
 */
export interface DataTableProps<T> {
  /** Array of data to display */
  data: T[];
  /** Column definitions */
  columns: DataTableColumn<T>[];
  /** Optional row actions (edit, delete, etc.) */
  actions?: DataTableAction<T>[];
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Optional title for the table */
  title?: string;
  /** Function to extract unique key from row */
  getRowKey: (row: T) => string | number;
  /** Optional row click handler for navigation */
  onRowClick?: (row: T) => void;
}

/**
 * Reusable DataTable component with loading, empty states, and row actions.
 *
 * @example
 * ```tsx
 * <DataTable
 *   data={currencies}
 *   columns={[
 *     { label: 'Code', key: 'code' },
 *     { label: 'Name', key: 'name' },
 *     {
 *       label: 'Status',
 *       render: (row) => <Chip label={row.isActive ? 'Active' : 'Inactive'} />,
 *       align: 'center'
 *     },
 *   ]}
 *   isLoading={isLoading}
 *   emptyMessage="No currencies found"
 *   onRowClick={(currency) => navigate(`/currencies/${currency.code}`)}
 * />
 * ```
 */
export const DataTable = <T extends Record<string, unknown>>({
  data,
  columns,
  actions,
  isLoading = false,
  emptyMessage = 'No data available',
  title,
  getRowKey,
  onRowClick,
}: DataTableProps<T>): JSX.Element => {
  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <Typography variant="body1" color="text.secondary">
              {emptyMessage}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Render table
  return (
    <Card>
      {title && (
        <CardContent>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
        </CardContent>
      )}
      <TableContainer>
        <Table data-testid="data-table">
          <TableHead>
            <TableRow>
              {columns.map((column, index) => (
                <TableCell
                  key={index}
                  align={column.align || 'left'}
                  sx={{ width: column.width, fontWeight: 'bold' }}
                >
                  {column.label}
                </TableCell>
              ))}
              {actions && actions.length > 0 && (
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={getRowKey(row)}
                hover
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                }}
                data-testid={`data-table-row-${getRowKey(row)}`}
              >
                {columns.map((column, columnIndex) => (
                  <TableCell key={columnIndex} align={column.align || 'left'}>
                    {column.render
                      ? column.render(row)
                      : column.key
                      ? String(row[column.key] ?? '')
                      : ''}
                  </TableCell>
                ))}
                {actions && actions.length > 0 && (
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      {actions.map((action, actionIndex) => (
                        <IconButton
                          key={actionIndex}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click when clicking action button
                            action.onClick(row);
                          }}
                          aria-label={action.label}
                          color={action.color || 'default'}
                          size="small"
                        >
                          {action.icon}
                        </IconButton>
                      ))}
                    </Box>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};
