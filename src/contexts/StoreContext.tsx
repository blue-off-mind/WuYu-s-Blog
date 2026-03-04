import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { Article, Comment, ModerationLog } from "@/lib/types";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { supabase, supabasePublic } from "@/lib/supabase";
import { toast } from "sonner";

import { SEED_ARTICLES } from "@/lib/seed";

interface StoreContextType {
  articles: Article[];
  comments: Comment[];
  isInitialized: boolean;
  addArticle: (article: Omit<Article, "id" | "publishedAt">) => Promise<void>;
  updateArticle: (id: string, article: Partial<Article>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;
  getArticle: (id: string) => Article | undefined;
  addComment: (comment: Omit<Comment, "id" | "createdAt">) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  getCommentsByArticle: (articleId: string) => Comment[];
  likeArticle: (id: string) => Promise<void>;
  isSupabaseEnabled: boolean;
  connectionStatus: 'checking' | 'connected' | 'error';
  seedDatabase: () => Promise<void>;
  moderationLogs: ModerationLog[];
  getModerationLogsByArticle: (articleId: string) => ModerationLog[];
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}



export function StoreProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  
  const normalizeArticle = (article: Partial<Article>): Partial<Article> => ({
    ...article,
    likes: typeof article.likes === "number" ? article.likes : Number(article.likes ?? 0),
  });

  const isAbortLikeError = (error: unknown) => {
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message?: unknown }).message ?? "")
        : String(error ?? "");
    return message.toLowerCase().includes("abort");
  };

  const hydrateArticleById = useCallback(async (id: string) => {
    const client = supabasePublic ?? supabase;
    if (!client) return;
    const { data, error } = await client.from("articles").select("*").eq("id", id).single();
    if (error || !data) return;
    const hydrated = normalizeArticle(data as Partial<Article>) as Article;
    setArticles((prev) => prev.map((article) => (article.id === id ? hydrated : article)));
  }, []);

  // Use Supabase if client is initialized
  const isSupabaseEnabled = !!(supabasePublic ?? supabase);

  // --- INITIALIZATION ---
  useEffect(() => {
    console.log("StoreProvider Init: Checking Supabase connection...");
    console.log("Supabase Enabled:", isSupabaseEnabled);

    if (isSupabaseEnabled) {
      let active = true;
      const readClient = supabasePublic ?? supabase;
      if (!readClient) return;
      // Supabase Mode
      const fetchSupabaseData = async () => {
        const [articlesResult, commentsResult] = await Promise.all([
          readClient.from("articles").select("*").order("publishedAt", { ascending: false }),
          readClient.from("comments").select("*").order("createdAt", { ascending: false }),
        ]);

        const { data: dbArticles, error: artError } = articlesResult;
        const { data: dbComments, error: comError } = commentsResult;

        if (!active) return;

        if (artError && !isAbortLikeError(artError)) {
          console.error("Error fetching articles:", artError);
          setConnectionStatus('error');
          // Detect missing table error specifically
          if (artError.code === "PGRST205") {
            toast.error("Database tables not found. Please run the SQL schema in Supabase.");
          } else {
            toast.error("Failed to sync with database.");
          }
        } else if (!artError) {
          setConnectionStatus('connected');
        }
        if (comError && !isAbortLikeError(comError)) {
          console.error("Error fetching comments:", comError);
        }

        if (dbArticles) {
          setArticles((dbArticles as Article[]).map((article) => normalizeArticle(article) as Article));
        }
        if (dbComments) setComments(dbComments as Comment[]);
        setIsInitialized(true);

        // Moderation logs are admin-only and must never block public/app initialization.
        void (async () => {
          try {
            const { data: dbLogs, error: logsError } = await supabase!
              .from("moderation_logs")
              .select("*")
              .order("createdAt", { ascending: false });
            if (!active) return;
            if (logsError) {
              if (!isAbortLikeError(logsError)) {
                console.warn("Moderation logs unavailable:", logsError.message);
              }
              return;
            }
            if (dbLogs) setModerationLogs(dbLogs as ModerationLog[]);
          } catch (error) {
            if (!isAbortLikeError(error)) {
              console.warn("Moderation logs fetch failed:", error);
            }
          }
        })();
      };

      fetchSupabaseData();

      // Realtime Subscriptions
      const articlesSub = readClient
        .channel('public:articles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            const incoming = normalizeArticle(payload.new as Partial<Article>) as Article;
            setArticles(prev => [incoming, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const rowId = String(payload.new.id ?? "");
            const incomingLikes = Number((payload.new as Partial<Article>).likes ?? NaN);
            setArticles((prev) =>
              prev.map((article) => {
                if (article.id !== rowId) return article;
                // Only trust likes from realtime payload; then hydrate full row from DB.
                return {
                  ...article,
                  likes: Number.isFinite(incomingLikes) ? incomingLikes : (article.likes || 0),
                };
              }),
            );
            if (rowId) void hydrateArticleById(rowId);
          } else if (payload.eventType === 'DELETE') {
            setArticles(prev => prev.filter(a => a.id !== payload.old.id));
          }
        })
        .subscribe();

      const commentsSub = readClient
        .channel('public:comments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setComments(prev => [payload.new as Comment, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => prev.filter(c => c.id !== payload.old.id));
          }
        })
        .subscribe();

        let logsSub: RealtimeChannel | null = null;
        void (async () => {
          try {
            const { error } = await supabase!.from("moderation_logs").select("id").limit(1);
            if (error) return;
            logsSub = supabase!
              .channel('public:moderation_logs')
              .on('postgres_changes', { event: '*', schema: 'public', table: 'moderation_logs' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                  setModerationLogs(prev => [payload.new as ModerationLog, ...prev]);
                }
              })
              .subscribe();
          } catch (error) {
            if (!isAbortLikeError(error)) {
              console.warn("Moderation logs probe failed:", error);
            }
          }
        })();

      return () => {
        active = false;
        readClient.removeChannel(articlesSub);
        readClient.removeChannel(commentsSub);
        if (logsSub) supabase!.removeChannel(logsSub);
      };

    } else {
      // LocalStorage Mode
      const storedArticles = localStorage.getItem("dej_articles");
      if (storedArticles) {
        try {
          const parsed = JSON.parse(storedArticles) as Partial<Article>[];
          setArticles(parsed.map((a) => ({ ...(a as Article), likes: Number(a.likes ?? 0) })));
        } catch { setArticles(SEED_ARTICLES); }
      } else {
        setArticles(SEED_ARTICLES);
        localStorage.setItem("dej_articles", JSON.stringify(SEED_ARTICLES));
      }

      const storedComments = localStorage.getItem("dej_comments");
      if (storedComments) {
        try {
          setComments(JSON.parse(storedComments));
        } catch { setComments([]); }
      }

      const storedLogs = localStorage.getItem("dej_moderation_logs");
      if (storedLogs) {
        try {
          setModerationLogs(JSON.parse(storedLogs));
        } catch { setModerationLogs([]); }
      }
      setConnectionStatus('connected');
      setIsInitialized(true);
    }
  }, [isSupabaseEnabled, hydrateArticleById]);

  // Sync to LocalStorage (Only in Local Mode)
  useEffect(() => {
    if (!isSupabaseEnabled && articles.length > 0) {
      localStorage.setItem("dej_articles", JSON.stringify(articles));
    }
  }, [articles, isSupabaseEnabled]);

  useEffect(() => {
    if (!isSupabaseEnabled) {
      localStorage.setItem("dej_comments", JSON.stringify(comments));
    }
  }, [comments, isSupabaseEnabled]);

  useEffect(() => {
    if (!isSupabaseEnabled) {
      localStorage.setItem("dej_moderation_logs", JSON.stringify(moderationLogs));
    }
  }, [moderationLogs, isSupabaseEnabled]);


  // --- ACTIONS ---

  const addArticle = async (articleData: Omit<Article, "id" | "publishedAt">) => {
    const newArticle = {
      ...articleData,
      id: nanoid(),
      publishedAt: new Date().toISOString(),
      likes: 0,
    };

    if (isSupabaseEnabled) {
      const { error } = await supabase!.from("articles").insert(newArticle);
      if (error) throw error;
    } else {
      setArticles((prev) => [newArticle, ...prev]);
    }
  };

  const updateArticle = async (id: string, data: Partial<Article>) => {
    if (isSupabaseEnabled) {
      const { error } = await supabase!.from("articles").update(data).eq("id", id);
      if (error) throw error;
    } else {
      setArticles((prev) => prev.map((art) => (art.id === id ? { ...art, ...data } : art)));
    }
  };

  const deleteArticle = async (id: string) => {
    if (isSupabaseEnabled) {
      const { error } = await supabase!.from("articles").delete().eq("id", id);
      if (error) throw error;
    } else {
      setArticles((prev) => prev.filter((art) => art.id !== id));
    }
  };

  const likeArticle = async (id: string) => {
    setArticles((prev) =>
      prev.map((art) => (art.id === id ? { ...art, likes: (art.likes || 0) + 1 } : art))
    );

    const rpcClient = supabasePublic ?? supabase;
    if (!rpcClient) return;

    try {
      const { error } = await rpcClient.rpc("increment_article_likes", {
        p_article_id: id,
      });
      if (error) throw error;
    } catch (err) {
      console.error("Failed to sync likes:", err);
      toast.error("Failed to save like. Reverting.");
      setArticles((prev) =>
        prev.map((art) => (art.id === id ? { ...art, likes: Math.max((art.likes || 1) - 1, 0) } : art))
      );
    }
  };

  const seedDatabase = async () => {
    if (!isSupabaseEnabled) return;
    // Only seed if empty to avoid duplicates
    const { count } = await supabase!.from("articles").select("*", { count: 'exact', head: true });
    if (count === 0) {
       const { error } = await supabase!.from("articles").insert(SEED_ARTICLES);
       if (error) console.error("Error seeding database:", error);
    }
  };

  const addComment = async (commentData: Omit<Comment, "id" | "createdAt">) => {
    const newComment = {
      ...commentData,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseEnabled) {
      const { error } = await supabase!.from("comments").insert(newComment);
      if (error) throw error;
    } else {
      setComments((prev) => [newComment, ...prev]);
    }
  };

  const deleteComment = async (id: string) => {
    const commentToDelete = comments.find(c => c.id === id);
    if (!commentToDelete) return;

    const logEntry: ModerationLog = {
      id: nanoid(),
      articleId: commentToDelete.articleId,
      action: "DELETE_COMMENT",
      targetContent: commentToDelete.content,
      moderator: "Admin", // In a real app, get from auth context
      createdAt: new Date().toISOString(),
    };

    if (isSupabaseEnabled) {
      const { error } = await supabase!.rpc("delete_comment_with_log", {
        p_comment_id: id,
        p_log_id: logEntry.id,
        p_moderator: logEntry.moderator,
      });
      if (error) throw error;
    } else {
      setComments((prev) => prev.filter((c) => c.id !== id));
      setModerationLogs((prev) => [logEntry, ...prev]);
    }
  };

  const getArticle = (id: string) => articles.find((a) => a.id === id);

  const getCommentsByArticle = (articleId: string) => 
    comments.filter((c) => c.articleId === articleId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getModerationLogsByArticle = (articleId: string) => 
    moderationLogs.filter((l) => l.articleId === articleId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <StoreContext.Provider
      value={{ 
        articles, 
        comments, 
        isInitialized,
        addArticle, 
        updateArticle, 
        deleteArticle, 
        getArticle,
        addComment,
        deleteComment,
        getCommentsByArticle,
        likeArticle,
        isSupabaseEnabled,
        connectionStatus,
        seedDatabase,
        moderationLogs,
        getModerationLogsByArticle
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
