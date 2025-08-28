export type SidebarTableConfig = {
  /** Unique id used in routing/selection */
  id: string;
  /** Display name to show in the sidebar and title */
  label: string;
  /** Fully qualified table name to query from backend */
  tableId: string;
};

// Edit this list to control which backend tables appear in the sidebar
// and the exact display names you want for each.
export const DB_SIDEBAR_TABLES: SidebarTableConfig[] = [
  {
    id: "ifrs-trial-balance-2025",
    label: "IFRS Trial Balance 2025",
    tableId: "dbo.ifrs_trial_balance",
  },
  // Example: add more tables here as needed
  // { id: 'ifrs-loans-portfolio', label: 'IFRS Loans Portfolio', tableId: 'dbo.ifrs_loans_portfolio' },
];
