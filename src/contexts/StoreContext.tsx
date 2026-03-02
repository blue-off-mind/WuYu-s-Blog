import { createContext, useContext, useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";
import type { Article, Comment, ModerationLog } from "@/lib/types";
import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

import { SEED_ARTICLES } from "@/lib/seed";

interface StoreContextType {
  articles: Article[];
  comments: Comment[];
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
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  
  const likeTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingLikes = useRef<Record<string, number>>({});

  // Use Supabase if client is initialized
  const isSupabaseEnabled = !!supabase;

  // --- INITIALIZATION ---
  useEffect(() => {
    console.log("StoreProvider Init: Checking Supabase connection...");
    console.log("Supabase Enabled:", isSupabaseEnabled);

    if (isSupabaseEnabled) {
      // Supabase Mode
      const fetchSupabaseData = async () => {
        const { data: dbArticles, error: artError } = await supabase!.from("articles").select("*").order("publishedAt", { ascending: false });
        const { data: dbComments, error: comError } = await supabase!.from("comments").select("*").order("createdAt", { ascending: false });
        const { data: dbLogs } = await supabase!.from("moderation_logs").select("*").order("createdAt", { ascending: false });
        
        if (artError) {
          console.error("Error fetching articles:", artError);
          setConnectionStatus('error');
          // Detect missing table error specifically
          if (artError.code === "PGRST205") {
            toast.error("Database tables not found. Please run the SQL schema in Supabase.");
          } else {
            toast.error("Failed to sync with database.");
          }
        } else {
          setConnectionStatus('connected');
        }
        if (comError) console.error("Error fetching comments:", comError);

        if (dbArticles) setArticles(dbArticles as Article[]);
        if (dbComments) setComments(dbComments as Comment[]);
        if (dbLogs) setModerationLogs(dbLogs as ModerationLog[]);
      };

      fetchSupabaseData();

      // Realtime Subscriptions
      const articlesSub = supabase!
        .channel('public:articles')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'articles' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setArticles(prev => [payload.new as Article, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setArticles(prev => prev.map(a => a.id === payload.new.id ? payload.new as Article : a));
          } else if (payload.eventType === 'DELETE') {
            setArticles(prev => prev.filter(a => a.id !== payload.old.id));
          }
        })
        .subscribe();

      const commentsSub = supabase!
        .channel('public:comments')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setComments(prev => [payload.new as Comment, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => prev.filter(c => c.id !== payload.old.id));
          }
        })
        .subscribe();

      const logsSub = supabase!
        .channel('public:moderation_logs')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'moderation_logs' }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setModerationLogs(prev => [payload.new as ModerationLog, ...prev]);
          }
        })
        .subscribe();

      return () => {
        supabase!.removeChannel(articlesSub);
        supabase!.removeChannel(commentsSub);
        supabase!.removeChannel(logsSub);
      };

    } else {
      // LocalStorage Mode
      const storedArticles = localStorage.getItem("dej_articles");
      if (storedArticles) {
        try {
          const parsed = JSON.parse(storedArticles);
          setArticles(parsed.map((a: any) => ({ ...a, likes: a.likes || 0 })));
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
    }
  }, [isSupabaseEnabled]);

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
    // 1. Optimistic Update (Immediate)
    setArticles((prev) =>
      prev.map((art) => (art.id === id ? { ...art, likes: (art.likes || 0) + 1 } : art))
    );

    // 2. Track accumulated clicks
    pendingLikes.current[id] = (pendingLikes.current[id] || 0) + 1;

    // 3. Debounce Network Request
    if (likeTimeouts.current[id]) {
      clearTimeout(likeTimeouts.current[id]);
    }

    likeTimeouts.current[id] = setTimeout(async () => {
      const count = pendingLikes.current[id];
      pendingLikes.current[id] = 0; // Reset pending
      
      console.log('Syncing to Supabase:', id, 'Count:', count);

      if (!isSupabaseEnabled) {
        console.warn("Supabase sync skipped: Client not enabled");
        return; 
      }

      try {
        // Fetch latest to ensure atomic-like consistency
        const { data: currentArt, error: fetchError } = await supabase!
          .from("articles")
          .select("likes")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;

        const newLikes = (currentArt?.likes || 0) + count;

        const { error: updateError } = await supabase!
          .from("articles")
          .update({ likes: newLikes })
          .eq("id", id);

        if (updateError) throw updateError;
        
        console.log("Supabase sync success for article:", id);
      } catch (err) {
        console.error("Failed to sync likes:", err);
        toast.error("Failed to save like. Reverting.");
        // Revert local state
        setArticles((prev) =>
          prev.map((art) => (art.id === id ? { ...art, likes: (art.likes || 0) - count } : art))
        );
      } finally {
        delete likeTimeouts.current[id];
      }
    }, 1000); 
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
      await supabase!.from("comments").insert(newComment);
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
      await supabase!.from("comments").delete().eq("id", id);
      await supabase!.from("moderation_logs").insert(logEntry);
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
