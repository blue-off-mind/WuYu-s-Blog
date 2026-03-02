import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type Language = "en" | "zh";

export const TRANSLATIONS = {
  en: {
    title: "Digital\nEditorial\nJournal",
    subtitle: "Curated perspectives on design, technology, and the quiet moments in between.",
    est: "Est. 2026 • Vol. 01",
    nav: {
      journal: "Journal",
      about: "About",
      admin: "Admin",
      login: "Login",
      logout: "Logout",
    },
    filter: {
      label: "Filter By:",
      all: "All",
      reset: "Reset Filters",
      empty: "No stories found matching your mood.",
      categories: {
        Design: "Design",
        Coding: "Coding",
        Life: "Life",
        Music: "Music",
        Tech: "Tech",
      },
      moods: {
        "Deep Focus": "Deep Focus",
        "Sunday Morning": "Sunday Morning",
        "Late Night": "Late Night",
        "Nostalgic": "Nostalgic",
        "Sharp": "Sharp",
        "Energetic": "Energetic",
      },
    },
    article: {
      readStory: "Read Story",
      back: "Back",
      by: "By",
      editorNote: "Editor's Note",
      likes: "Likes",
      published: "Published",
    },
    comments: {
      title: "Discussion",
      empty: "No thoughts yet. Be the first to reflect.",
      formTitle: "Share your perspective",
      namePlaceholder: "Your Name (Optional)",
      commentPlaceholder: "Write a thought...",
      submit: "Publish Thought",
      success: "Thought shared.",
      delete: "Delete this comment?",
      deleted: "Comment deleted",
    },
    admin: {
      loginTitle: "Editor Access",
      loginSubtitle: "Enter your credentials to continue.",
      loginButton: "Enter Journal CMS",
      dashboard: "CMS Dashboard",
      manage: "Manage your editorial content",
      newArticle: "New Article",
      initDb: "Initialize DB",
      edit: "Edit Article",
      save: "Save & Publish",
      cancel: "Cancel",
      preview: "Live Preview",
      cover: "Cover Image",
      title: "Title",
      author: "Author",
      category: "Category",
      mood: "Mood",
      context: "Best Context",
      pullQuote: "Pull Quote",
      content: "Content",
      published: "Published",
      actions: "Actions",
      searchPlaceholder: "Search articles...",
      commentsDashboard: {
        title: "Comment Moderation",
        subtitle: "Review and manage discussion across all articles",
        article: "Article",
        author: "Author",
        comment: "Comment",
        date: "Date",
        actions: "Actions",
        delete: "Delete",
        empty: "No comments found.",
      },
      moderationLog: {
        title: "Moderation Log",
        subtitle: "Audit trail of deleted comments",
        action: "Action",
        content: "Content Snapshot",
        moderator: "Moderator",
        time: "Time",
        empty: "No moderation history recorded for this article."
      }
    }
  },
  zh: {
    title: "数字\n编辑\n日志",
    subtitle: "关于设计、科技与生活间隙的精选视角。",
    est: "创刊于 2026 • 第一卷",
    nav: {
      journal: "期刊",
      about: "关于",
      admin: "管理",
      login: "登录",
      logout: "登出",
    },
    filter: {
      label: "筛选：",
      all: "全部",
      reset: "重置筛选",
      empty: "没有找到符合当前心境的文章。",
      categories: {
        Design: "设计",
        Coding: "代码",
        Life: "生活",
        Music: "音乐",
        Tech: "科技",
      },
      moods: {
        "Deep Focus": "深度聚焦",
        "Sunday Morning": "周日清晨",
        "Late Night": "深夜",
        "Nostalgic": "怀旧",
        "Sharp": "犀利",
        "Energetic": "活力",
      },
    },
    article: {
      readStory: "阅读全文",
      back: "返回",
      by: "作者",
      editorNote: "编者按",
      likes: "人点赞",
      published: "发布于",
    },
    comments: {
      title: "讨论区",
      empty: "暂无评论。期待您的第一条见解。",
      formTitle: "分享您的观点",
      namePlaceholder: "您的昵称（可选）",
      commentPlaceholder: "写下您的想法...",
      submit: "发布观点",
      success: "评论已发布。",
      delete: "确定删除这条评论吗？",
      deleted: "评论已删除",
    },
    admin: {
      loginTitle: "编辑入口",
      loginSubtitle: "请输入凭证以继续。",
      loginButton: "进入内容管理系统",
      dashboard: "CMS 仪表盘",
      manage: "管理您的编辑内容",
      newArticle: "新建文章",
      initDb: "初始化数据库",
      edit: "编辑文章",
      save: "保存并发布",
      cancel: "取消",
      preview: "实时预览",
      cover: "封面图片",
      title: "标题",
      author: "作者",
      category: "分类",
      mood: "心境",
      context: "最佳阅读场景",
      pullQuote: "金句",
      content: "内容",
      published: "发布时间",
      actions: "操作",
      searchPlaceholder: "搜索文章...",
      commentsDashboard: {
        title: "评论审核",
        subtitle: "集中管理所有文章的讨论内容",
        article: "所属文章",
        author: "发布者",
        comment: "评论内容",
        date: "日期",
        actions: "操作",
        delete: "删除",
        empty: "暂无评论。",
      },
      moderationLog: {
        title: "审核历史",
        subtitle: "已删除评论的审计追踪",
        action: "操作",
        content: "内容快照",
        moderator: "操作人",
        time: "时间",
        empty: "本文暂无审核记录。"
      }
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof TRANSLATIONS["en"];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  // Update CSS variables for fonts when language changes
  useEffect(() => {
    const root = document.documentElement;
    if (language === "zh") {
      root.style.setProperty("--font-serif", '"Zen Old Mincho", "Noto Serif SC", serif');
      root.style.setProperty("--font-sans", '"Noto Sans SC", sans-serif');
    } else {
      root.style.setProperty("--font-serif", '"Playfair Display", serif');
      root.style.setProperty("--font-sans", '"Inter", sans-serif');
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: TRANSLATIONS[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}
