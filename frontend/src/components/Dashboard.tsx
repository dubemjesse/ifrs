import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import Sidebar from './Sidebar';
import DataTable from './DataTable';

const DashboardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  backgroundColor: '#f5f5f5',
  overflow: 'hidden',
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const ContentArea = styled(Box)(({ theme }) => ({
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const TableContainer = styled(Box)(({ theme }) => ({
  width: '80%',
  padding: '20px',
  overflow: 'auto',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    padding: '16px',
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#800020',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  zIndex: theme.zIndex.drawer + 1,
}));

interface DashboardProps {
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [selectedReport, setSelectedReport] = useState('balance-sheet');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleReportSelect = (reportId: string) => {
    setSelectedReport(reportId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  const handleLogout = () => {
    handleProfileMenuClose();
    onLogout?.();
  };
  
  const sidebarContent = (
    <Sidebar 
      selectedReport={selectedReport} 
      onReportSelect={handleReportSelect} 
    />
  );
  
  return (
    <DashboardContainer>
      <StyledAppBar position="fixed">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 600,
              fontSize: '1.2rem'
            }}
          >
            IFRS Reporting Dashboard
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                display: { xs: 'none', sm: 'block' },
                mr: 1
              }}
            >
              Welcome, Admin
            </Typography>
            
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <AccountCircleIcon />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </StyledAppBar>
      
      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <SettingsIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
          Logout
        </MenuItem>
      </Menu>
      
      <MainContent>
        <Toolbar /> {/* Spacer for fixed AppBar */}
        
        <ContentArea>
          {isMobile ? (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
              sx={{
                '& .MuiDrawer-paper': {
                  width: '280px',
                  boxSizing: 'border-box',
                  top: '64px',
                  height: 'calc(100% - 64px)',
                },
              }}
            >
              {sidebarContent}
            </Drawer>
          ) : (
            sidebarContent
          )}
          
          <TableContainer>
            <Box sx={{ mb: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  color: '#800020',
                  mb: 1
                }}
              >
                {getReportTitle(selectedReport)}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ color: '#666' }}
              >
                {getReportDescription(selectedReport)}
              </Typography>
            </Box>
            
            <DataTable 
              reportType={selectedReport}
              data={[]}
              onView={(id) => console.log('View:', id)}
              onEdit={(id) => console.log('Edit:', id)}
              onDelete={(id) => console.log('Delete:', id)}
            />
          </TableContainer>
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  );
};

const getReportTitle = (reportId: string): string => {
  const titles = {
    'balance-sheet': 'Balance Sheet',
    'income-statement': 'Income Statement',
    'cash-flow': 'Cash Flow Statement',
    'equity-changes': 'Statement of Changes in Equity',
    'notes-disclosure': 'Notes to Financial Statements',
    'segment-reporting': 'Segment Reporting',
    'related-party': 'Related Party Transactions',
    'fair-value': 'Fair Value Measurements',
  };
  return titles[reportId as keyof typeof titles] || 'Financial Report';
};

const getReportDescription = (reportId: string): string => {
  const descriptions = {
    'balance-sheet': 'Statement of Financial Position as of the reporting date',
    'income-statement': 'Comprehensive income and expenses for the reporting period',
    'cash-flow': 'Cash receipts and payments during the reporting period',
    'equity-changes': 'Changes in equity components during the reporting period',
    'notes-disclosure': 'Additional information and disclosures to financial statements',
    'segment-reporting': 'Financial information by business segments',
    'related-party': 'Transactions and balances with related parties',
    'fair-value': 'Fair value measurements and disclosures',
  };
  return descriptions[reportId as keyof typeof descriptions] || 'Financial reporting data and analysis';
};

export default Dashboard;