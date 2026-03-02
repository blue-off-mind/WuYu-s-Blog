import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl font-bold tracking-tight hover:opacity-70 transition-opacity">
          SIE.
        </Link>
        
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hover:text-primary transition-colors">{t.nav.journal}</Link>
          <a href="https://user.qzone.qq.com/294951543/main" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{t.nav.about}</a>
          <Link href="/admin" className="text-xs uppercase tracking-widest border border-foreground px-3 py-1 hover:bg-foreground hover:text-background transition-colors">
            {t.nav.admin}
          </Link>
          
          <div className="w-px h-4 bg-border mx-2" />
          
          <button 
            onClick={() => setLanguage(language === "en" ? "zh" : "en")}
            className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors min-w-[32px] text-right"
          >
            {language === "en" ? "中文" : "EN"}
          </button>
        </nav>
      </div>
    </header>
  );
}
