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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const StyledTableContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  height: 'calc(100vh - 120px)',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e0e0e0',
  overflow: 'auto',
  [theme.breakpoints.down('md')]: {
    height: 'auto',
    maxHeight: '60vh',
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: '#800020',
  '& .MuiTableCell-head': {
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.9rem',
    padding: '16px 12px',
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
    fontSize: '0.85rem',
    borderBottom: '1px solid #e0e0e0',
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  padding: '6px',
  margin: '0 2px',
  '&:hover': {
    backgroundColor: 'rgba(128, 0, 32, 0.08)',
  },
}));

interface DataTableProps {
  reportType: string;
  data: any[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
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
  onDelete 
}) => {
  const tableData = data.length > 0 ? data : getSampleData(reportType);
  const columns = getColumns(reportType);
  
  const renderCellContent = (row: any, column: any) => {
    if (column.key === 'actions') {
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
    
    if (column.key === 'amount') {
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
    
    if (column.key === 'status') {
      return (
        <Chip 
          label={row[column.key]} 
          size="small" 
          color={getStatusColor(row[column.key]) as any}
          variant="outlined"
        />
      );
    }
    
    return (
      <Typography variant="body2" sx={{ color: '#333' }}>
        {row[column.key] || row[column.key.replace('account', 'activity')]}
      </Typography>
    );
  };
  
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <StyledTableContainer>
        <TableContainer>
          <Table stickyHeader>
          <StyledTableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.key} 
                  sx={{ width: column.width }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {tableData.map((row) => (
              <StyledTableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {renderCellContent(row, column)}
                  </TableCell>
                ))}
              </StyledTableRow>
            ))}
            {tableData.length === 0 && (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  sx={{ textAlign: 'center', py: 4 }}
                >
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    No data available for this report
                  </Typography>
                </TableCell>
              </TableRow>
          )}
          </TableBody>
          </Table>
        </TableContainer>
      </StyledTableContainer>
    </Box>
  );
};

export default DataTable;