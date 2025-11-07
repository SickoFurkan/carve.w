// Simple icon components
const HomeIcon = () => null;
const InfoIcon = () => null;
const RocketIcon = () => null;
const UsersIcon = () => null;

export const carveNavigationGroups = [
  {
    label: 'CARVE',
    icon: HomeIcon,
    items: [
      {
        title: "Home",
        href: "/",
        icon: HomeIcon,
        description: "Welcome to Carve"
      },
      {
        title: "Features",
        href: "/#features",
        icon: RocketIcon,
        description: "What we offer"
      },
      {
        title: "About",
        href: "/about",
        icon: InfoIcon,
        description: "Learn about Carve"
      },
      {
        title: "Contact",
        href: "/contact",
        icon: UsersIcon,
        description: "Get in touch"
      }
    ]
  }
];
