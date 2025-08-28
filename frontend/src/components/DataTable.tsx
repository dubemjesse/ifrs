import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TablePagination,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import type { DbColumnMeta } from '../services/api';

const StyledTableContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: 'calc(100vh - 120px)',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e0e0e0',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    height: 'auto',
    maxHeight: '60vh',
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: '#f3f4f6',
  '& .MuiTableCell-head': {
    backgroundColor: '#f3f4f6',
    color: '#0f172a',
    fontWeight: 800,
    fontSize: '1rem',
    letterSpacing: '0.02em',
    padding: '18px 14px',
    lineHeight: 1.2,
    textTransform: 'uppercase',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: '#fafafa',
  },
  '&:hover': {
    backgroundColor: 'rgba(128, 0, 32, 0.04)',
  },
  '& .MuiTableCell-root': {
    padding: '12px',
    fontSize: '0.9rem',
    borderBottom: '1px solid #e0e0e0',
    color: '#111827',
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  padding: '6px',
  margin: '0 2px',
  '&:hover': {
    backgroundColor: 'rgba(128, 0, 32, 0.08)',
  },
}));

const ToolbarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  padding: '12px 16px',
  borderBottom: '1px solid #e0e0e0',
}));

interface DataTableProps {
  reportType: string;
  data: any[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  // Dynamic DB explorer props (optional)
  dynamicColumns?: DbColumnMeta[];
  total?: number;
  page?: number; // 1-based
  rowsPerPage?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  loading?: boolean;
  error?: string | null;
  onPageChange?: (page: number) => void; // 1-based
  onRowsPerPageChange?: (size: number) => void;
  onSortChange?: (field: string, order: 'asc' | 'desc') => void;
  onSearchChange?: (q: string) => void;
}

// Sample data for different report types
const getSampleData = (reportType: string) => {
  const commonData = {
    'balance-sheet': [
      { id: '1', account: 'Cash and Cash Equivalents', amount: 125000, category: 'Current Assets', status: 'Active' },
      { id: '2', account: 'Accounts Receivable', amount: 85000, category: 'Current Assets', status: 'Active' },
      { id: '3', account: 'Inventory', amount: 150000, category: 'Current Assets', status: 'Active' },
      { id: '4', account: 'Property, Plant & Equipment', amount: 500000, category: 'Non-Current Assets', status: 'Active' },
      { id: '5', account: 'Accounts Payable', amount: -75000, category: 'Current Liabilities', status: 'Active' },
    ],
    'income-statement': [
      { id: '1', account: 'Revenue', amount: 750000, period: 'Q4 2023', status: 'Finalized' },
      { id: '2', account: 'Cost of Goods Sold', amount: -450000, period: 'Q4 2023', status: 'Finalized' },
      { id: '3', account: 'Operating Expenses', amount: -180000, period: 'Q4 2023', status: 'Finalized' },
      { id: '4', account: 'Interest Income', amount: 5000, period: 'Q4 2023', status: 'Finalized' },
      { id: '5', account: 'Tax Expense', amount: -25000, period: 'Q4 2023', status: 'Finalized' },
    ],
    'cash-flow': [
      { id: '1', activity: 'Operating Activities', amount: 95000, category: 'Operating', status: 'Reviewed' },
      { id: '2', activity: 'Investing Activities', amount: -120000, category: 'Investing', status: 'Reviewed' },
      { id: '3', activity: 'Financing Activities', amount: 50000, category: 'Financing', status: 'Reviewed' },
      { id: '4', activity: 'Net Change in Cash', amount: 25000, category: 'Net Change', status: 'Reviewed' },
    ],
  };
  
  return commonData[reportType as keyof typeof commonData] || [];
};

const getColumns = (reportType: string) => {
  const columnConfig = {
    'balance-sheet': [
      { key: 'account', label: 'Account Name', width: '35%' },
      { key: 'category', label: 'Category', width: '25%' },
      { key: 'amount', label: 'Amount ($)', width: '20%' },
      { key: 'status', label: 'Status', width: '15%' },
      { key: 'actions', label: 'Actions', width: '5%' },
    ],
    'income-statement': [
      { key: 'account', label: 'Account Name', width: '35%' },
      { key: 'period', label: 'Period', width: '20%' },
      { key: 'amount', label: 'Amount ($)', width: '20%' },
      { key: 'status', label: 'Status', width: '20%' },
      { key: 'actions', label: 'Actions', width: '5%' },
    ],
    'cash-flow': [
      { key: 'activity', label: 'Activity', width: '35%' },
      { key: 'category', label: 'Category', width: '25%' },
      { key: 'amount', label: 'Amount ($)', width: '20%' },
      { key: 'status', label: 'Status', width: '15%' },
      { key: 'actions', label: 'Actions', width: '5%' },
    ],
  };
  
  return columnConfig[reportType as keyof typeof columnConfig] || columnConfig['balance-sheet'];
};

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(Math.abs(amount));
};

const getStatusColor = (status: string) => {
  const statusColors = {
    'Active': 'success',
    'Finalized': 'primary',
    'Reviewed': 'info',
    'Draft': 'warning',
    'Inactive': 'error',
  };
  return statusColors[status as keyof typeof statusColors] || 'default';
};

const DataTable: React.FC<DataTableProps> = ({ 
  reportType, 
  data, 
  onView, 
  onEdit, 
  onDelete,
  dynamicColumns = [],
  total = 0,
  page = 1,
  rowsPerPage = 25,
  sort = '',
  order = 'asc',
  search = '',
  loading = false,
  error = null,
  onPageChange,
  onRowsPerPageChange,
  onSortChange,
  onSearchChange,
}) => {
  const isDynamic = dynamicColumns.length > 0;
  const tableData = data.length > 0 ? data : (isDynamic ? [] : getSampleData(reportType));
  
  // Build base columns
  let columns = isDynamic
    ? dynamicColumns.map((c) => ({ key: c.name, label: c.name }))
    : getColumns(reportType);

  // For IFRS Trial Balance, enforce a curated column order (when available from API)
  if (isDynamic && reportType === 'ifrs-trial-balance') {
    const ifrsOrder = [
      'PositionAsAt',
      'BankName',
      'LedgerTypeCode',
      'LedgerTypeDesc',
      'LedgerGroupCode',
      'LedgerGroupDesc',
      'AccountType',
      'AccountTypeDesc',
      'AccountNo',
      'AccountDesc',
      'BookBal',
      'LastMonthBookBalIFRS',
      'DebitsIFRS',
      'CreditsIFRS',
      'BookBalIFRS',
    ];
    const orderSet = new Set(ifrsOrder);
    const pickByKey = (k: string) => columns.find((c: any) => (c.key || c.name) === k);
    const inOrder = ifrsOrder.map(pickByKey).filter(Boolean) as any[];
    const rest = columns.filter((c: any) => !orderSet.has((c.key || c.name) as string));
    columns = [...inOrder, ...rest];
  }

  // If dynamic and we have no explicit labels, derive user-friendly labels from column names; override for IFRS TB
  const normalizeLabel = (label: string) => label
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase());

  const ifrsHeaderMap: Record<string, string> = reportType === 'ifrs-trial-balance' ? {
    PositionAsAt: 'Position As At',
    BankName: 'Bank Name',
    LedgerTypeCode: 'Ledger Type Code',
    LedgerTypeDesc: 'Ledger Type',
    LedgerGroupCode: 'Ledger Group Code',
    LedgerGroupDesc: 'Ledger Group',
    AccountType: 'Account Type (Bool)',
    AccountTypeDesc: 'Account Type',
    AccountNo: 'Account No',
    AccountDesc: 'Account Description',
    BookBal: 'Book Balance',
    LastMonthBookBalIFRS: 'Last Month Book Balance (IFRS)',
    DebitsIFRS: 'Debits (IFRS)',
    CreditsIFRS: 'Credits (IFRS)',
    BookBalIFRS: 'Book Balance (IFRS)'
  } : {};

  const resolvedColumns = columns.map((c: any) => ({
    ...c,
    label: (ifrsHeaderMap[c.key] || ifrsHeaderMap[c.name]) || c.label || normalizeLabel((c.key || c.name) as string),
  }));

  const handleHeaderSort = (key: string) => {
    if (!isDynamic) return; // sorting only for dynamic mode
    const isAsc = sort === key && order === 'asc';
    onSortChange?.(key, isAsc ? 'desc' : 'asc');
  };

  const renderCellContent = (row: any, column: any) => {
    if (!isDynamic && column.key === 'actions') {
      return (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View Details">
            <ActionButton 
              size="small" 
              onClick={() => onView?.(row.id)}
              sx={{ color: '#800020' }}
            >
              <VisibilityIcon fontSize="small" />
            </ActionButton>
          </Tooltip>
          <Tooltip title="Edit">
            <ActionButton 
              size="small" 
              onClick={() => onEdit?.(row.id)}
              sx={{ color: '#666' }}
            >
              <EditIcon fontSize="small" />
            </ActionButton>
          </Tooltip>
          <Tooltip title="Delete">
            <ActionButton 
              size="small" 
              onClick={() => onDelete?.(row.id)}
              sx={{ color: '#d32f2f' }}
            >
              <DeleteIcon fontSize="small" />
            </ActionButton>
          </Tooltip>
        </Box>
      );
    }
    
    if (!isDynamic && column.key === 'amount') {
      const amount = row[column.key];
      return (
        <Typography 
          variant="body2" 
          sx={{ 
            color: amount < 0 ? '#d32f2f' : '#2e7d32',
            fontWeight: 500
          }}
        >
          {amount < 0 ? '-' : ''}{formatAmount(amount)}
        </Typography>
      );
    }
    
    if (!isDynamic && column.key === 'status') {
      return (
        <Chip 
          label={row[column.key]} 
          size="small" 
          color={getStatusColor(row[column.key]) as any}
          variant="outlined"
        />
      );
    }
    
    if (isDynamic && reportType === 'ifrs-trial-balance' && (column.key === 'PositionAsAt' || column.name === 'PositionAsAt')) {
      const raw = row[column.key] ?? row[column.name];
      let date: Date | null = null;
      if (raw instanceof Date) {
        date = raw;
      } else if (typeof raw === 'string' || typeof raw === 'number') {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) date = d;
      } else if (raw && typeof raw === 'object') {
        const s = typeof (raw as any).toISOString === 'function' ? (raw as any).toISOString() : (raw as any).toString?.();
        if (s) {
          const d = new Date(s);
          if (!isNaN(d.getTime())) date = d;
        }
      }
      const formatted = date
        ? `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
        : (raw ?? '');
      return (
        <Typography variant="body2" sx={{ color: '#333' }}>
          {formatted}
        </Typography>
      );
    }
    return (
      <Typography variant="body2" sx={{ color: '#333' }}>
        {row[column.key] ?? row[column.key?.replace('account', 'activity')] ?? ''}
      </Typography>
    );
  };
  
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <StyledTableContainer>
        {isDynamic && (
          <ToolbarContainer>
            <TextField
              value={search}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search..."
              size="small"
              sx={{ maxWidth: 360 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#800020' }} />
                  </InputAdornment>
                ),
              }}
            />
            {loading && <CircularProgress size={20} />}
            {error && (
              <Typography variant="caption" sx={{ color: '#d32f2f' }}>
                {error}
              </Typography>
            )}
          </ToolbarContainer>
        )}
        <TableContainer sx={{ flex: 1 }}>
          <Table stickyHeader>
          <StyledTableHead>
            <TableRow>
              {resolvedColumns.map((column: any) => (
                <TableCell 
                  key={column.key} 
                  sx={{ width: column.width }}
                  sortDirection={isDynamic && sort === column.key ? order : false}
                >
                  {isDynamic ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#0f172a', minWidth: 0 }}>
                      <Typography component="span" variant="subtitle2" sx={{ color: '#0f172a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', maxWidth: '100%' }}>
                        {column.label}
                      </Typography>
                      <Tooltip title={sort === column.key ? `Sort ${order === 'asc' ? 'descending' : 'ascending'}` : 'Sort'}>
                        <IconButton
                          size="small"
                          onClick={() => handleHeaderSort(column.key)}
                          sx={{ color: '#0f172a', p: 0.25 }}
                          aria-label={`sort by ${column.label}`}
                        >
                          {sort === column.key ? (
                            order === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                          ) : (
                            <SwapVertIcon fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
              {!isDynamic && (
                <TableCell sx={{ width: '5%' }}>Actions</TableCell>
              )}
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {tableData.map((row, idx) => (
              <StyledTableRow key={idx}>
                {resolvedColumns.map((column: any) => (
                  <TableCell key={column.key}>
                    {renderCellContent(row, column)}
                  </TableCell>
                ))}
                {!isDynamic && (
                  <TableCell>
                    {renderCellContent(row, { key: 'actions' })}
                  </TableCell>
                )}
              </StyledTableRow>
            ))}
            {tableData.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={resolvedColumns.length + (!isDynamic ? 1 : 0)} 
                  sx={{ textAlign: 'center', py: 4 }}
                >
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    No data available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          </Table>
        </TableContainer>
        {isDynamic && (
          <TablePagination
            component="div"
            count={total}
            page={page - 1}
            onPageChange={(_, newPage) => onPageChange?.(newPage + 1)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => onRowsPerPageChange?.(parseInt(e.target.value, 10))}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        )}
      </StyledTableContainer>
    </Box>
  );
};

export default DataTable;