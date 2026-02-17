export const moneyNavigationGroups = [
  {
    label: 'CARVE MONEY',
    icon: { name: 'WalletIcon' },
    items: [
      {
        title: "Dashboard",
        href: "/dashboard/money",
        icon: { name: 'DashboardIcon' },
        description: "Money overview"
      },
      {
        title: "Analytics",
        href: "/dashboard/money/analytics",
        icon: { name: 'ChartIcon' },
        description: "Spending breakdown"
      },
      {
        title: "Subscriptions",
        href: "/dashboard/money/subscriptions",
        icon: { name: 'CreditCardIcon' },
        description: "Manage subscriptions"
      },
      {
        title: "Transactions",
        href: "/dashboard/money/transactions",
        icon: { name: 'ReceiptIcon' },
        description: "Transaction history"
      },
    ]
  },
  {
    label: 'MANAGE',
    icon: { name: 'SettingsIcon' },
    items: [
      {
        title: "Budgeting",
        href: "/dashboard/money/budgeting",
        icon: { name: 'PieChartIcon' },
        description: "Budget management"
      },
      {
        title: "Insights",
        href: "/dashboard/money/insights",
        icon: { name: 'LightbulbIcon' },
        description: "Savings insights"
      },
      {
        title: "Settings",
        href: "/dashboard/money/settings",
        icon: { name: 'SettingsIcon' },
        description: "Money settings"
      }
    ]
  }
];
