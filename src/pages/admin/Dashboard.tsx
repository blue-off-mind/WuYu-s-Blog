import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation, Link } from "wouter";
import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit2, Trash2, LogOut, Search, MessageSquare } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function Dashboard() {
  const { isAuthenticated, logout } = useAuth();
  const { articles, deleteArticle, isSupabaseEnabled, seedDatabase, connectionStatus } = useStore();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "All" || article.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, setLocation]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      deleteArticle(id);
      toast.success("Article deleted");
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold">{t.admin.dashboard}</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">{t.admin.manage}</p>
              {isSupabaseEnabled && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  connectionStatus === 'connected' ? 'bg-green-100 text-green-700 border-green-200' :
                  connectionStatus === 'error' ? 'bg-red-100 text-red-700 border-red-200' :
                  'bg-yellow-100 text-yellow-700 border-yellow-200'
                }`}>
                  {connectionStatus === 'connected' ? 'DB Connected' : connectionStatus === 'error' ? 'DB Error' : 'Connecting...'}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            {isSupabaseEnabled && articles.length === 0 && (
              <Button variant="secondary" onClick={() => { seedDatabase(); toast.success("Database seeded!"); }}>
                {t.admin.initDb}
              </Button>
            )}
            <Button variant="outline" onClick={() => setLocation("/admin/comments")}>
              <MessageSquare className="mr-2 w-4 h-4" /> {t.admin.commentsDashboard.title}
            </Button>
             <Button variant="outline" onClick={() => { logout(); setLocation("/"); }}>
              <LogOut className="mr-2 w-4 h-4" /> {t.nav.logout}
            </Button>
            <Button onClick={() => setLocation("/admin/editor")}>
              <Plus className="mr-2 w-4 h-4" /> {t.admin.newArticle}
            </Button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.admin.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="All">{t.filter.all}</option>
            {["Design", "Coding", "Life", "Music", "Tech"].map(c => (
              <option key={c} value={c}>{t.filter.categories[c as any] || c}</option>
            ))}
          </select>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.title}</TableHead>
                <TableHead>{t.admin.category}</TableHead>
                <TableHead>{t.admin.mood}</TableHead>
                <TableHead>{t.admin.published}</TableHead>
                <TableHead className="text-right">{t.admin.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium font-serif">{article.title}</TableCell>
                  <TableCell>{t.filter.categories[article.category] || article.category}</TableCell>
                  <TableCell>{t.filter.moods[article.mood] || article.mood}</TableCell>
                  <TableCell>{new Date(article.publishedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => setLocation(`/admin/editor/${article.id}`)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(article.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredArticles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No articles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
