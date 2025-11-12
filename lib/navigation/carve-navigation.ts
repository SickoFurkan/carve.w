import {
  Smartphone,
  MapIcon,
  Newspaper,
  Lightbulb,
  User,
  MessageCircleQuestion,
  GitPullRequest
} from 'lucide-react';

export const carveNavigationGroups = [
  {
    label: 'CARVE',
    icon: Smartphone,
    items: [
      {
        title: "App",
        href: "/carve",
        icon: Smartphone,
        description: "About the Carve app"
      },
      {
        title: "Roadmap",
        href: "/carve/roadmap",
        icon: MapIcon,
        description: "Development roadmap"
      },
      {
        title: "Updates",
        href: "/carve/updates",
        icon: Newspaper,
        description: "Latest changes and news"
      },
      {
        title: "Vision",
        href: "/carve/vision",
        icon: Lightbulb,
        description: "Our long-term vision"
      },
      {
        title: "Developer",
        href: "/carve/developer",
        icon: User,
        description: "About the developer"
      },
      {
        title: "FAQ",
        href: "/carve/faq",
        icon: MessageCircleQuestion,
        description: "Frequently asked questions"
      },
      {
        title: "Contributing",
        href: "/carve/contributing",
        icon: GitPullRequest,
        description: "How to contribute"
      }
    ]
  }
];
