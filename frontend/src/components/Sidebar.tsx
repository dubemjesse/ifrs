import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TableChartIcon from "@mui/icons-material/TableChart";
import ViewModuleIcon from "@mui/icons-material/ViewModule";

interface SidebarProps {
  selectedReport: string;
  onReportSelect: (reportId: string) => void;
  // DB Explorer
  dbObjects?: { id: string; schema: string; name: string; type: "TABLE" | "VIEW" }[];
  selectedTableId?: string | null;
  onSelectTable?: (tableId: string) => void;
}

const reports = [
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
  dbObjects = [],
  selectedTableId,
  onSelectTable,
}) => {
  return (
    <Box
      sx={{
        width: 300,
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
          {reports.map((r) => (
            <ListItem key={r.id} disablePadding>
              <ListItemButton
                selected={selectedReport === r.id}
                onClick={() => onReportSelect(r.id)}
              >
                <ListItemIcon>
                  <AssessmentIcon sx={{ color: selectedReport === r.id ? "#800020" : undefined }} />
                </ListItemIcon>
                <ListItemText primary={r.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" sx={{ color: "#800020", mb: 1 }}>
          Database Explorer
        </Typography>
        <List dense>
          {dbObjects.length === 0 ? (
            <Typography variant="body2" sx={{ color: "#999", px: 2, py: 1 }}>
              No tables or views found.
            </Typography>
          ) : (
            dbObjects.map((obj) => (
              <ListItem key={obj.id} disablePadding>
                <ListItemButton
                  selected={selectedTableId === obj.id}
                  onClick={() => onSelectTable && onSelectTable(obj.id)}
                >
                  <ListItemIcon>
                    {obj.type === "VIEW" ? (
                      <ViewModuleIcon sx={{ color: selectedTableId === obj.id ? "#800020" : undefined }} />
                    ) : (
                      <TableChartIcon sx={{ color: selectedTableId === obj.id ? "#800020" : undefined }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${obj.schema}.${obj.name}`}
                    secondary={obj.type}
                    primaryTypographyProps={{ noWrap: true }}
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;
