// Simple icon components
const DashboardIcon = () => null;
const ChartIcon = () => null;
const ActivityIcon = () => null;
const UserIcon = () => null;
const SettingsIcon = () => null;

export const dashboardNavigationGroups = [
  {
    label: 'DASHBOARD',
    icon: DashboardIcon,
    items: [
      {
        title: "Overview",
        href: "/dashboard",
        icon: DashboardIcon,
        description: "Your dashboard home"
      },
      {
        title: "Stats",
        href: "/dashboard/stats",
        icon: ChartIcon,
        description: "Health metrics"
      },
      {
        title: "Activity",
        href: "/dashboard/activity",
        icon: ActivityIcon,
        description: "Workout history"
      },
      {
        title: "Profile",
        href: "/dashboard/profile",
        icon: UserIcon,
        description: "Your profile"
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: SettingsIcon,
        description: "App settings"
      }
    ]
  }
];
