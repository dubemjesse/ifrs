import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const SidebarContainer = styled(Box)(({ theme }) => ({
  width: '20%',
  minWidth: '250px',
  height: '100%',
  backgroundColor: '#ffffff',
  borderRight: '1px solid #e0e0e0',
  boxShadow: '2px 0 4px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    minWidth: 'unset',
    height: 'auto',
    borderRight: 'none',
    borderBottom: '1px solid #e0e0e0',
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: '12px 20px',
  margin: '4px 8px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: 'rgba(128, 0, 32, 0.08)',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(128, 0, 32, 0.12)',
    '&:hover': {
      backgroundColor: 'rgba(128, 0, 32, 0.16)',
    },
  },
}));

interface SidebarProps {
  selectedReport: string;
  onReportSelect: (reportId: string) => void;
}

const reportItems = [
  { id: 'balance-sheet', title: 'Balance Sheet', description: 'Statement of Financial Position' },
  { id: 'income-statement', title: 'Income Statement', description: 'Profit & Loss Statement' },
  { id: 'cash-flow', title: 'Cash Flow Statement', description: 'Statement of Cash Flows' },
  { id: 'equity-changes', title: 'Statement of Changes in Equity', description: 'Equity Movement Report' },
  { id: 'notes-disclosure', title: 'Notes to Financial Statements', description: 'Disclosure Notes' },
  { id: 'segment-reporting', title: 'Segment Reporting', description: 'Business Segment Analysis' },
  { id: 'related-party', title: 'Related Party Transactions', description: 'Related Party Disclosures' },
  { id: 'fair-value', title: 'Fair Value Measurements', description: 'Fair Value Hierarchy' },
];

const Sidebar: React.FC<SidebarProps> = ({ selectedReport, onReportSelect }) => {
  return (
    <SidebarContainer>
      <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            color: '#800020',
            fontSize: '1.1rem'
          }}
        >
          IFRS Reports
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#666',
            mt: 0.5
          }}
        >
          Select a report to view data
        </Typography>
      </Box>
      
      <List sx={{ flex: 1, py: 1 }}>
        {reportItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <StyledListItemButton
              selected={selectedReport === item.id}
              onClick={() => onReportSelect(item.id)}
            >
              <ListItemText
                primary={
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: selectedReport === item.id ? 600 : 500,
                      color: selectedReport === item.id ? '#800020' : '#333',
                      fontSize: '0.9rem'
                    }}
                  >
                    {item.title}
                  </Typography>
                }
                secondary={
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: '#666',
                      fontSize: '0.75rem'
                    }}
                  >
                    {item.description}
                  </Typography>
                }
              />
            </StyledListItemButton>
          </ListItem>
        ))}
      </List>
    </SidebarContainer>
  );
};

export default Sidebar;