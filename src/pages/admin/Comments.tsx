import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function Comments() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { comments, articles, deleteComment } = useStore();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      setLocation("/admin/login");
    }
  }, [isAuthenticated, isAdmin, isLoading, setLocation]);

  const handleDelete = async (id: string) => {
    if (confirm(t.comments.delete)) {
      await deleteComment(id);
      toast.success(t.comments.deleted);
    }
  };

  const getArticleTitle = (articleId: string) => {
    const article = articles.find(a => a.id === articleId);
    return article ? article.title : "Unknown Article";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Checking admin session...
      </div>
    );
  }
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Redirecting to login...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="ghost" size="sm" className="h-6 px-2 -ml-2 text-muted-foreground" onClick={() => setLocation("/admin")}>
                <ArrowLeft className="w-4 h-4 mr-1" /> {t.article.back}
              </Button>
            </div>
            <h1 className="font-serif text-3xl font-bold">{t.admin.commentsDashboard.title}</h1>
            <p className="text-muted-foreground">{t.admin.commentsDashboard.subtitle}</p>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.commentsDashboard.article}</TableHead>
                <TableHead>{t.admin.commentsDashboard.author}</TableHead>
                <TableHead className="w-[40%]">{t.admin.commentsDashboard.comment}</TableHead>
                <TableHead>{t.admin.commentsDashboard.date}</TableHead>
                <TableHead className="text-right">{t.admin.commentsDashboard.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="font-medium font-serif">{getArticleTitle(comment.articleId)}</TableCell>
                  <TableCell>{comment.author}</TableCell>
                  <TableCell className="truncate max-w-[300px]" title={comment.content}>
                    {comment.content}
                  </TableCell>
                  <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {comments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t.admin.commentsDashboard.empty}
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
