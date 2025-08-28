import React, { useEffect, useMemo, useState } from "react";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import Sidebar from "./Sidebar";
import DataTable from "./DataTable";
import type { User } from "../services/api";
import { DbService, /* type DbObject, */ type DbColumnMeta } from "../services/api";
import { DB_SIDEBAR_TABLES } from "../config/sidebarTables";

const DashboardContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  height: "100vh",
  width: "100vw",
  backgroundColor: "#f5f5f5",
  overflow: "hidden",
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  minWidth: 0,
}));

const ContentArea = styled(Box)(({ theme }) => ({
  display: "flex",
  flex: 1,
  overflow: "hidden",
  minWidth: 0,
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
  },
}));

const TableContainer = styled(Box)(({ theme }) => ({
  flex: "1 1 auto",
  minWidth: 0,
  width: "auto",
  padding: "20px",
  overflow: "auto",
  [theme.breakpoints.down("md")]: {
    flex: "1 1 100%",
    width: "100%",
    padding: "16px",
  },
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: "linear-gradient(90deg,rgb(207, 197, 199) 0%,rgb(122, 16, 16) 100%)",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  zIndex: theme.zIndex.drawer + 1,
}));

interface DashboardProps {
  onLogout?: () => void;
  user?: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, user }) => {
  const [selectedReport, setSelectedReport] = useState("balance-sheet");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // IFRS Trial Balance dynamic state
  const [columns, setColumns] = useState<DbColumnMeta[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25); // dashboard-fitting default
  const [sort, setSort] = useState<string>("");
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Map IFRS report ids to DB tables (curated list)
  const reportDbMap = useMemo(() => {
    const m: Record<string, { label: string; tableId: string }> = {};
    DB_SIDEBAR_TABLES.forEach((t) => { m[t.id] = { label: t.label, tableId: t.tableId }; });
    return m;
  }, []);

  // Prepare sidebar reports from config
  const sidebarReports = useMemo(() => (
    DB_SIDEBAR_TABLES.map(t => ({ id: t.id, label: t.label }))
  ), []);

  // If current selection is not in config-driven sidebar, auto-switch to first configured item
  React.useEffect(() => {
    if (sidebarReports.length && !sidebarReports.some(r => r.id === selectedReport)) {
      setSelectedReport(sidebarReports[0].id);
    }
  }, [sidebarReports, selectedReport]);

  // Derive selected tableId if current report is DB-backed
  const selectedTableId = useMemo(() => {
    const entry = (reportDbMap as any)[selectedReport];
    return entry ? (entry.tableId as string) : null;
  }, [selectedReport, reportDbMap]);

  // Reset pagination and filters when switching reports
  useEffect(() => {
    setPage(1);
    setSort("");
    setOrder('asc');
    setSearch("");
    setError(null);
  }, [selectedReport]);

  // Fetch data only for DB-backed reports
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedTableId) {
        // Not a DB-backed report; clear dynamic state
        setColumns([]);
        setRows([]);
        setTotal(0);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [colsRes, rowsRes] = await Promise.all([
          DbService.getColumns(selectedTableId),
          DbService.getRows({ tableId: selectedTableId, page, pageSize, sort, order, search }),
        ]);
        if (colsRes.success && Array.isArray(colsRes.data)) {
          setColumns(colsRes.data);
        } else {
          setColumns([]);
        }
        if (rowsRes.success && rowsRes.data) {
          setRows(rowsRes.data.rows || []);
          setTotal(rowsRes.data.total || 0);
        } else {
          setRows([]);
          setTotal(0);
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTableId, page, pageSize, sort, order, search]);

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
      reports={sidebarReports}
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

          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <img
              src="/KMFB.png"
              alt="Icon"
              style={{
                height: "65px",
                width: "auto",
                objectFit: "contain",
              }}
            />
          </Box>
           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                display: { xs: "none", sm: "block" },
                mr: 1,
              }}
            >
              Welcome, {user?.firstName || "User"}
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
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
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
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <SettingsIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 1, fontSize: "1.2rem" }} />
          Logout
        </MenuItem>
      </Menu>

      <MainContent>
        <Toolbar />
        <ContentArea>
          {isMobile ? (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                "& .MuiDrawer-paper": {
                  width: "280px",
                  boxSizing: "border-box",
                  top: "64px",
                  height: "calc(100% - 64px)",
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
                  color: "#800020",
                  mb: 1,
                }}
              >
                {(reportDbMap as any)[selectedReport]?.label || getReportTitle(selectedReport)}
              </Typography>
              <Typography variant="body2" sx={{ color: "#666" }}>
                {getReportDescription(selectedReport)}
              </Typography>
            </Box>

            <DataTable
              reportType={selectedReport}
              data={rows}
              dynamicColumns={columns}
              total={total}
              page={page}
              rowsPerPage={pageSize}
              sort={sort}
              order={order}
              search={search}
              loading={loading}
              error={error}
              onPageChange={(p) => setPage(p)}
              onRowsPerPageChange={(size) => {
                setPage(1);
                setPageSize(size);
              }}
              onSortChange={(field, ord) => {
                setSort(field);
                setOrder(ord);
              }}
              onSearchChange={(q) => {
                setPage(1);
                setSearch(q);
              }}
              onView={(id) => console.log("View:", id)}
              onEdit={(id) => console.log("Edit:", id)}
              onDelete={(id) => console.log("Delete:", id)}
            />
          </TableContainer>
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  );
};

const getReportTitle = (reportId: string): string => {
  const titles = {
    "balance-sheet": "Balance Sheet",
    "income-statement": "Income Statement",
    "cash-flow": "Cash Flow Statement",
    "equity-changes": "Statement of Changes in Equity",
    "notes-disclosure": "Notes to Financial Statements",
    "segment-reporting": "Segment Reporting",
    "related-party": "Related Party Transactions",
    "fair-value": "Fair Value Measurements",
    "ifrs-trial-balance": "IFRS Trial Balance",
  };
  return titles[reportId as keyof typeof titles] || "Financial Report";
};

const getReportDescription = (reportId: string): string => {
  const descriptions = {
    "balance-sheet": "Statement of Financial Position as of the reporting date",
    "income-statement":
      "Comprehensive income and expenses for the reporting period",
    "cash-flow": "Cash receipts and payments during the reporting period",
    "equity-changes":
      "Changes in equity components during the reporting period",
    "notes-disclosure":
      "Additional information and disclosures to financial statements",
    "segment-reporting": "Financial information by business segments",
    "related-party": "Transactions and balances with related parties",
    "fair-value": "Fair value measurements and disclosures",
    "ifrs-trial-balance": "Trial balance data sourced directly from the curated IFRS table",
  };
  return (
    descriptions[reportId as keyof typeof descriptions] ||
    "Financial reporting data and analysis"
  );
};

export default Dashboard;
