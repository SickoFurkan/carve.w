// Simple icon components
const DashboardIcon = () => null;
const ChartIcon = () => null;
const ActivityIcon = () => null;
const AppleIcon = () => null;
const DumbbellIcon = () => null;
const UserIcon = () => null;
const SettingsIcon = () => null;

export const dashboardNavigationGroups = [
  {
    label: 'OVERVIEW',
    icon: DashboardIcon,
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: DashboardIcon,
        description: "Your dashboard home"
      }
    ]
  },
  {
    label: 'TRACKING',
    icon: ChartIcon,
    items: [
      {
        title: "Food",
        href: "/dashboard/food",
        icon: AppleIcon,
        description: "Nutrition tracking"
      },
      {
        title: "Workouts",
        href: "/dashboard/workouts",
        icon: DumbbellIcon,
        description: "Workout analytics"
      },
      {
        title: "Highscores",
        href: "/dashboard/highscores",
        icon: ActivityIcon,
        description: "PR's & leaderboards"
      }
    ]
  },
  {
    label: 'ACCOUNT',
    icon: UserIcon,
    items: [
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
