// Icon references (must match keys in iconMap from sidebar-icons.tsx)
const TrophyIcon = { name: 'TrophyIcon' };
const TrendingUpIcon = { name: 'TrendingUpIcon' };
const ZapIcon = { name: 'ZapIcon' };
const DumbbellIcon = { name: 'DumbbellIcon' };
const HomeIcon = { name: 'HomeIcon' };

export const hiscoresNavigationGroups = [
  {
    label: 'HISCORES',
    icon: TrophyIcon,
    items: [
      {
        title: "Overview",
        href: "/hiscores",
        icon: TrophyIcon,
        description: "Leaderboard overview"
      },
      {
        title: "Total XP",
        href: "/hiscores?type=xp",
        icon: TrendingUpIcon,
        description: "Top XP earners"
      },
      {
        title: "Level",
        href: "/hiscores?type=level",
        icon: ZapIcon,
        description: "Highest levels"
      },
      {
        title: "Workouts",
        href: "/hiscores?type=workouts",
        icon: DumbbellIcon,
        description: "Most workouts"
      }
    ]
  },
  {
    label: 'QUICK LINKS',
    icon: HomeIcon,
    items: [
      {
        title: "Back to Home",
        href: "/",
        icon: HomeIcon,
        description: "Return to homepage"
      }
    ]
  }
];
