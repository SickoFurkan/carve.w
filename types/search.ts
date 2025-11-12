export type SearchResult = {
  id: string;
  type: "wiki" | "user" | "hiscore";
  title: string;
  description?: string;
  href: string;
};
