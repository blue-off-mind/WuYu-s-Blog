import { useState, useMemo } from "react";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/home/Hero";
import { FilterBar } from "@/components/home/FilterBar";
import { ArticleCard } from "@/components/article/ArticleCard";
import { useStore } from "@/contexts/StoreContext";
import type { Category, Mood } from "@/lib/types";

export default function Home() {
  const { articles } = useStore();
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [activeMood, setActiveMood] = useState<Mood | "All">("All");

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      if (activeCategory !== "All" && article.category !== activeCategory) return false;
      if (activeMood !== "All" && article.mood !== activeMood) return false;
      return true;
    });
  }, [articles, activeCategory, activeMood]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      <Header />
      <Hero />
      
      <FilterBar 
        activeCategory={activeCategory} 
        activeMood={activeMood}
        onCategoryChange={setActiveCategory}
        onMoodChange={setActiveMood}
      />

      <main className="container mx-auto px-6 py-12 md:py-20">
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {filteredArticles.map((article, index) => (
              <ArticleCard key={article.id} article={article} index={index} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <h3 className="font-serif text-2xl text-muted-foreground italic">No stories found matching your mood.</h3>
            <button 
              onClick={() => { setActiveCategory("All"); setActiveMood("All"); }}
              className="mt-4 text-sm font-bold uppercase tracking-widest underline decoration-2 underline-offset-4 hover:text-primary"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      <footer className="py-12 border-t border-border/10 text-center">
        <p className="font-serif text-2xl mb-4 italic">The Journal</p>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">© 2026 Digital Editorial. All rights reserved.</p>
      </footer>
    </div>
  );
}
