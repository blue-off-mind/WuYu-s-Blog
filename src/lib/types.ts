export type Category = "Design" | "Coding" | "Life" | "Music" | "Tech";
export type Mood = "Nostalgic" | "Deep Focus" | "Sharp" | "Sunday Morning" | "Late Night" | "Energetic";

export interface Article {
  id: string;
  title: string;
  author: string;
  category: Category;
  mood: Mood;
  publishedAt: string; // ISO date string
  imageUrl: string;
  editorNote: string;
  bestContext: string;
  pullQuote: string;
  content: string; // HTML or Markdown
  isFeatured?: boolean;
  likes: number;
}

export interface Comment {
  id: string;
  articleId: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface ModerationLog {
  id: string;
  articleId: string;
  action: "DELETE_COMMENT";
  targetContent: string;
  moderator: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  role: "admin" | "user";
}
