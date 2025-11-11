# DataTable Component

Reusable table component with built-in loading states, empty states, and row actions.

## Features

- ✅ Type-safe with TypeScript generics
- ✅ Loading state with spinner
- ✅ Empty state with custom message
- ✅ Customizable columns with render functions
- ✅ Row actions (edit, delete, custom)
- ✅ Optional row click handler for navigation
- ✅ Material-UI styling
- ✅ Responsive design
- ✅ Accessible (ARIA labels, keyboard navigation)

## Usage

### Basic Table

```typescript
import { DataTable } from '@/components/DataTable';

<DataTable
  data={items}
  columns={[
    { label: 'Name', key: 'name' },
    { label: 'Value', key: 'value', align: 'right' },
  ]}
  isLoading={isLoading}
  emptyMessage="No items found"
/>
```

### Table with Custom Rendering

```typescript
import { DataTable } from '@/components/DataTable';
import { Chip } from '@mui/material';

<DataTable
  data={currencies}
  columns={[
    { label: 'Code', key: 'code' },
    { label: 'Name', key: 'name' },
    {
      label: 'Status',
      render: (row) => (
        <Chip
          label={row.isActive ? 'Active' : 'Inactive'}
          color={row.isActive ? 'success' : 'default'}
          size="small"
        />
      ),
      align: 'center',
    },
  ]}
/>
```

### Clickable Rows

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

<DataTable
  data={currencies}
  columns={columns}
  onRowClick={(currency) => navigate(`/currencies/${currency.code}`)}
/>
```

### Table with Actions

```typescript
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

<DataTable
  data={accounts}
  columns={columns}
  actions={[
    {
      icon: <EditIcon />,
      onClick: handleEdit,
      label: 'Edit account',
      color: 'primary',
    },
    {
      icon: <DeleteIcon />,
      onClick: handleDelete,
      label: 'Delete account',
      color: 'error',
    },
  ]}
/>
```

### Complete Example

See `/src/pages/Currencies/index.tsx` for a full implementation example.

## API

### DataTableProps<T>

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `data` | `T[]` | Yes | - | Array of data to display |
| `columns` | `DataTableColumn<T>[]` | Yes | - | Column definitions |
| `actions` | `DataTableAction<T>[]` | No | `undefined` | Row action buttons |
| `isLoading` | `boolean` | No | `false` | Loading state |
| `emptyMessage` | `string` | No | `'No data available'` | Empty state message |
| `title` | `string` | No | `undefined` | Optional table title |
| `getRowKey` | `(row: T) => string \| number` | Yes | - | Extract unique key |
| `onRowClick` | `(row: T) => void` | No | `undefined` | Row click handler |

### DataTableColumn<T>

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `label` | `string` | Yes | Column header text |
| `key` | `keyof T` | No | Property key for data access |
| `render` | `(row: T) => ReactNode` | No | Custom render function |
| `align` | `'left' \| 'center' \| 'right'` | No | Cell alignment |
| `width` | `string \| number` | No | Column width |

**Note:** Either `key` or `render` must be provided for each column.

### DataTableAction<T>

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `icon` | `ReactNode` | Yes | Icon to display |
| `onClick` | `(row: T) => void` | Yes | Click handler |
| `label` | `string` | Yes | Accessibility label |
| `color` | `'primary' \| 'secondary' \| 'error' \| ...` | No | Button color |

## Accessibility

- All action buttons have `aria-label` attributes
- Table rows are keyboard accessible when `onRowClick` is provided
- Empty and loading states use semantic HTML
- Proper heading hierarchy with optional `title` prop

## Best Practices

1. **Type Safety**: Always specify the generic type parameter:
   ```typescript
   interface Currency { code: string; name: string; }
   <DataTable<Currency> data={currencies} columns={...} />
   ```

2. **Performance**: For large datasets, consider implementing pagination or virtualization

3. **Custom Rendering**: Use `render` function for complex cell content (chips, buttons, formatted values)

4. **Row Actions**: Keep actions minimal (2-3 max) for better UX

5. **Loading States**: Always provide `isLoading` prop during data fetching

## Migration Guide

### Before (Manual Table Implementation)

```typescript
{loading ? (
  <Box display="flex" justifyContent="center">
    <CircularProgress />
  </Box>
) : data.length === 0 ? (
  <Typography>No data found</Typography>
) : (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Value</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)}
```

### After (Using DataTable)

```typescript
<DataTable
  data={data}
  columns={[
    { label: 'Name', key: 'name' },
    { label: 'Value', key: 'value' },
  ]}
  isLoading={loading}
  emptyMessage="No data found"
/>
```

**Lines saved**: ~40-60 per table implementation

---

**Created**: November 10, 2025
**Version**: 1.0.0
**Status**: Production Ready
