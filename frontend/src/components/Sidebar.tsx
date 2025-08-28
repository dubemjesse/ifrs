import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Tooltip,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";

interface SidebarProps {
  selectedReport: string;
  onReportSelect: (reportId: string) => void;
  // Optional custom reports list to display
  reports?: { id: string; label: string }[];
}

const defaultReports = [
  { id: "balance-sheet", label: "Balance Sheet" },
  { id: "income-statement", label: "Income Statement" },
  { id: "cash-flow", label: "Cash Flow" },
  { id: "equity-changes", label: "Changes in Equity" },
  { id: "notes-disclosure", label: "Notes & Disclosures" },
  { id: "segment-reporting", label: "Segment Reporting" },
  { id: "related-party", label: "Related Party" },
  { id: "fair-value", label: "Fair Value" },
];

const Sidebar: React.FC<SidebarProps> = ({
  selectedReport,
  onReportSelect,
  reports,
}) => {
  const finalReports = reports && reports.length > 0 ? reports : defaultReports;

  return (
    <Box
      sx={{
        width: 300,
        flex: '0 0 300px',
        flexShrink: 0,
        borderRight: "1px solid #eee",
        height: "100%",
        overflowY: "auto",
        backgroundColor: "#fff",
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ color: "#800020", mb: 1 }}>
          IFRS Reports
        </Typography>
        <List>
          {finalReports.map((r) => (
            <ListItem key={r.id} disablePadding>
              <ListItemButton
                selected={selectedReport === r.id}
                onClick={() => onReportSelect(r.id)}
                sx={{ overflow: 'hidden', alignItems: 'center' }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <AssessmentIcon sx={{ color: selectedReport === r.id ? "#800020" : undefined }} />
                </ListItemIcon>
                <ListItemText
                  sx={{ m: 0, flex: '1 1 auto', minWidth: 0 }}
                  primary={
                    <Tooltip title={r.label} placement="right">
                      <Typography
                        noWrap
                        sx={{
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '100%',
                        }}
                      >
                        {r.label}
                      </Typography>
                    </Tooltip>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;
