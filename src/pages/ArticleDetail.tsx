import { useRoute, useLocation } from "wouter";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Header } from "@/components/layout/Header";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Tag, Heart } from "lucide-react";
import { CommentSection } from "@/components/article/CommentSection";
import { LikeButton } from "@/components/article/LikeButton";
import { ModerationHistory } from "@/components/admin/ModerationHistory";
import { useEffect } from "react";

function processContent(content: string) {
  // If content looks like HTML (has tags), return as is
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return content;
  }
  // Otherwise, treat as plain text: double newline = paragraph, single newline = br
  return content
    .split(/\n\s*\n/)
    .filter((para) => para.trim().length > 0)
    .map((para) => `<p>${para.trim().replace(/\n/g, "<br />")}</p>`)
    .join("");
}

export default function ArticleDetail() {
  const [match, params] = useRoute("/article/:id");
  const [, setLocation] = useLocation();
  const { getArticle, likeArticle } = useStore();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  
  const article = params?.id ? getArticle(params.id) : undefined;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl mb-4">404</h1>
          <p className="mb-8">Article not found</p>
          <button onClick={() => setLocation("/")} className="underline">{t.article.back}</button>
        </div>
      </div>
    );
  }

  const displayCategory = t.filter.categories[article.category] || article.category;
  const displayMood = t.filter.moods[article.mood] || article.mood;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <motion.article 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pb-20"
      >
        {/* Hero Image */}
        <div className="relative h-[60vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-black/20 z-10" />
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-6 max-w-3xl relative z-20 -mt-20">
          <div className="bg-background p-8 md:p-12 shadow-xl border border-border/10">
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
              <button onClick={() => setLocation("/")} className="hover:text-foreground flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3 h-3" /> {t.article.back}
              </button>
              <span className="w-px h-3 bg-border" />
              <span className="text-primary">{displayCategory}</span>
              <span className="w-px h-3 bg-border" />
              <span>{displayMood}</span>
              <span className="w-px h-3 bg-border" />
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.bestContext}</span>
            </div>

            {/* Title */}
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-[1.1] font-medium mb-6 text-foreground">
              {article.title}
            </h1>

            <div className="flex items-center justify-between border-y border-border py-4 mb-8">
              <span className="text-sm font-medium">{t.article.by} {article.author}</span>
              <span className="text-sm text-muted-foreground">{new Date(article.publishedAt).toLocaleDateString()}</span>
            </div>

            {/* Pull Quote */}
            <blockquote className="my-10 border-l-2 border-primary pl-6 py-2">
              <p className="font-serif text-2xl md:text-3xl italic text-foreground leading-tight">
                "{article.pullQuote}"
              </p>
            </blockquote>

            {/* Body */}
            <div 
              className="prose prose-lg prose-neutral dark:prose-invert max-w-none 
                prose-headings:font-serif prose-headings:font-normal
                prose-p:font-light prose-p:leading-loose
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-0.2em]"
              dangerouslySetInnerHTML={{ __html: processContent(article.content) }} 
            />

            {/* Like Section */}
            <div className="flex justify-center my-12">
              <LikeButton 
                likes={article.likes} 
                onClick={() => likeArticle(article.id)} 
                label={t.article.likes} 
              />
            </div>
            
            {/* Editor's Note Footer */}
            <div className="mt-12 p-6 bg-muted/30 rounded-none border border-border">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{t.article.editorNote}</p>
              <p className="font-serif italic text-lg">{article.editorNote}</p>
            </div>

            <CommentSection articleId={article.id} />
            
            {isAuthenticated && <ModerationHistory articleId={article.id} />}
          </div>
        </div>
      </motion.article>
    </div>
  );
}
