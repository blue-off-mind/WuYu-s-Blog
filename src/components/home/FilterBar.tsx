import { Button } from "@/components/ui/button";
import type { Category, Mood } from "@/lib/types";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FilterBarProps {
  activeCategory: Category | "All";
  activeMood: Mood | "All";
  onCategoryChange: (c: Category | "All") => void;
  onMoodChange: (m: Mood | "All") => void;
}

const CATEGORIES: Category[] = ["Design", "Coding", "Life", "Music", "Tech"];
const MOODS: Mood[] = ["Deep Focus", "Sunday Morning", "Late Night", "Nostalgic", "Sharp", "Energetic"];

export function FilterBar({ activeCategory, activeMood, onCategoryChange, onMoodChange }: FilterBarProps) {
  const { t } = useLanguage();
  const isFiltering = activeCategory !== "All" || activeMood !== "All";

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur py-4 border-b border-border/10">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-hide">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2 shrink-0">
            {t.filter.label}
          </span>
          
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(activeCategory === cat ? "All" : cat)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full border transition-all shrink-0",
                activeCategory === cat 
                  ? "bg-foreground text-background border-foreground" 
                  : "bg-transparent text-muted-foreground border-transparent hover:border-border hover:text-foreground"
              )}
            >
              {t.filter.categories[cat]}
            </button>
          ))}
          
          <div className="w-px h-4 bg-border mx-2 shrink-0" />
          
          {MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => onMoodChange(activeMood === mood ? "All" : mood)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full border transition-all shrink-0",
                activeMood === mood 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-transparent text-muted-foreground border-transparent hover:border-border hover:text-foreground"
              )}
            >
              {t.filter.moods[mood]}
            </button>
          ))}
        </div>

        {isFiltering && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { onCategoryChange("All"); onMoodChange("All"); }}
            className="text-xs h-7 px-2 shrink-0"
          >
            {t.filter.all} <X className="ml-1 w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
