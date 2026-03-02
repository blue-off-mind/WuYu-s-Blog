import type { Article } from "@/lib/types";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ArticleCardProps {
  article: Article;
  index: number;
}

export function ArticleCard({ article, index }: ArticleCardProps) {
  const { t } = useLanguage();
  const displayCategory = t.filter.categories[article.category] || article.category;
  const displayMood = t.filter.moods[article.mood] || article.mood;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative flex flex-col gap-4"
    >
      <Link href={`/article/${article.id}`} className="block overflow-hidden bg-muted aspect-[4/5] relative">
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors z-10" />
        <motion.img 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          src={article.imageUrl} 
          alt={article.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-background/90 backdrop-blur text-[10px] font-bold uppercase tracking-widest px-2 py-1">
            {displayCategory}
          </span>
        </div>
      </Link>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider">
          <span>{displayMood}</span>
          <span>{new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        </div>
        
        <Link href={`/article/${article.id}`} className="group-hover:text-primary transition-colors">
          <h3 className="font-serif text-2xl leading-tight font-medium">
            {article.title}
          </h3>
        </Link>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {article.editorNote}
        </p>

        <div className="pt-2">
           <Link href={`/article/${article.id}`} className="inline-flex items-center text-xs font-bold uppercase tracking-widest border-b border-foreground/20 pb-0.5 hover:border-foreground transition-colors">
            {t.article.readStory} <ArrowUpRight className="ml-1 w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
