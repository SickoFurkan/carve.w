export const travelNavigationGroups = [
  {
    label: 'CARVE TRAVEL',
    icon: { name: 'PlaneIcon' },
    items: [
      {
        title: "Dashboard",
        href: "/dashboard/travel",
        icon: { name: 'DashboardIcon' },
        description: "Travel overview"
      },
      {
        title: "Trips",
        href: "/dashboard/travel/trips",
        icon: { name: 'PlaneIcon' },
        description: "Your trips"
      },
      {
        title: "Map",
        href: "/dashboard/travel/map",
        icon: { name: 'MapIcon' },
        description: "Trip map"
      },
      {
        title: "Budget",
        href: "/dashboard/travel/budget",
        icon: { name: 'WalletIcon' },
        description: "Travel budget"
      },
      {
        title: "Settings",
        href: "/dashboard/travel/settings",
        icon: { name: 'SettingsIcon' },
        description: "Travel settings"
      },
    ]
  },
];
