// Simple icon components
const BookIcon = () => null;
const AppleIcon = () => null;
const DumbbellIcon = () => null;
const HeartIcon = () => null;
const BeakerIcon = () => null;

export const wikiNavigationGroups = [
  {
    label: 'WIKI',
    icon: BookIcon,
    items: [
      {
        title: "Overview",
        href: "/wiki",
        icon: BookIcon,
        description: "Browse all categories"
      },
      {
        title: "Nutrition",
        href: "/wiki/nutrition",
        icon: AppleIcon,
        description: "Diet & meal planning"
      },
      {
        title: "Fitness",
        href: "/wiki/fitness",
        icon: DumbbellIcon,
        description: "Workouts & training"
      },
      {
        title: "Health",
        href: "/wiki/health",
        icon: HeartIcon,
        description: "Wellness & recovery"
      },
      {
        title: "Science",
        href: "/wiki/science",
        icon: BeakerIcon,
        description: "Research & studies"
      }
    ]
  }
];
