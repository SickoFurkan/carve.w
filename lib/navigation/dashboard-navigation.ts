// Navigation for non-authenticated users (only login link)
export const loginNavigationGroups = [
  {
    label: 'ACCOUNT',
    icon: { name: 'UserIcon' },
    items: [
      {
        title: "Login",
        href: "/dashboard/login",
        icon: { name: 'UserIcon' },
        description: "Sign in to your account"
      }
    ]
  }
];

// Full navigation for authenticated users
export const dashboardNavigationGroups = [
  {
    label: 'OVERVIEW',
    icon: { name: 'DashboardIcon' },
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: { name: 'DashboardIcon' },
        description: "Your dashboard home"
      }
    ]
  },
  {
    label: 'TRACKING',
    icon: { name: 'ChartIcon' },
    items: [
      {
        title: "Food",
        href: "/dashboard/food",
        icon: { name: 'AppleIcon' },
        description: "Nutrition tracking"
      },
      {
        title: "Workouts",
        href: "/dashboard/workouts",
        icon: { name: 'DumbbellIcon' },
        description: "Workout analytics"
      },
      {
        title: "Highscores",
        href: "/dashboard/highscores",
        icon: { name: 'ActivityIcon' },
        description: "PR's & leaderboards"
      }
    ]
  },
  {
    label: 'ACCOUNT',
    icon: { name: 'UserIcon' },
    items: [
      {
        title: "Profile",
        href: "/dashboard/profile",
        icon: { name: 'UserIcon' },
        description: "Your profile"
      },
      {
        title: "Settings",
        href: "/dashboard/settings",
        icon: { name: 'SettingsIcon' },
        description: "App settings"
      }
    ]
  }
];
