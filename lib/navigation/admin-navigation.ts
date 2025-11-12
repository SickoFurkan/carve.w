// Simple icon components
const DashboardIcon = () => null;
const UsersIcon = () => null;
const ContentIcon = () => null;
const FeedbackIcon = () => null;
const SettingsIcon = () => null;
const DatabaseIcon = () => null;

export const adminNavigationGroups = [
  {
    label: 'OVERVIEW',
    icon: DashboardIcon,
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: DashboardIcon,
        description: "Analytics & insights"
      }
    ]
  },
  {
    label: 'MANAGEMENT',
    icon: UsersIcon,
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: UsersIcon,
        description: "User management"
      },
      {
        title: "Content",
        href: "/admin/content",
        icon: ContentIcon,
        description: "Wiki & content moderation"
      },
      {
        title: "Feedback",
        href: "/admin/feedback",
        icon: FeedbackIcon,
        description: "User feedback"
      }
    ]
  },
  {
    label: 'CONFIGURATION',
    icon: SettingsIcon,
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        icon: SettingsIcon,
        description: "Site configuration"
      },
      {
        title: "Database",
        href: "/admin/database",
        icon: DatabaseIcon,
        description: "Database tools"
      }
    ]
  }
];
