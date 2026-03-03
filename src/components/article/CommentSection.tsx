import { useState } from "react";
import { useStore } from "@/contexts/StoreContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface CommentSectionProps {
  articleId: string;
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const { addComment, deleteComment, getCommentsByArticle } = useStore();
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const comments = getCommentsByArticle(articleId);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await addComment({
        articleId,
        author: author.trim() || "Anonymous Reader",
        content: content.trim(),
      });
      setContent("");
      setAuthor("");
      toast.success(t.comments.success);
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to post comment");
    }
  };

  return (
    <div className="border-t border-border mt-16 pt-12 max-w-2xl mx-auto">
      <h3 className="font-serif text-2xl mb-8">{t.comments.title} ({comments.length})</h3>

      <div className="space-y-8 mb-12">
        {comments.length === 0 ? (
          <p className="text-muted-foreground italic text-sm">{t.comments.empty}</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="group border-b border-border/40 pb-6 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs uppercase tracking-widest">{comment.author}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - {new Date(comment.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={async () => {
                        if (confirm(t.comments.delete)) {
                          try {
                            await deleteComment(comment.id);
                            toast.success(t.comments.deleted);
                          } catch (error) {
                            console.error("Failed to delete comment:", error);
                            toast.error("Failed to delete comment");
                          }
                        }
                      }}
                      className="text-destructive hover:text-destructive/80 transition-colors p-1 ml-2"
                      title="Delete Comment"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-foreground/90 font-serif leading-relaxed">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-muted/30 p-6 border border-border/50">
        <h4 className="font-bold text-xs uppercase tracking-widest mb-4 text-muted-foreground">{t.comments.formTitle}</h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="author" className="sr-only">Name</Label>
            <Input
              id="author"
              placeholder={t.comments.namePlaceholder}
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="bg-background border-border focus-visible:ring-1"
            />
          </div>
          <div>
            <Label htmlFor="comment" className="sr-only">Comment</Label>
            <Textarea
              id="comment"
              placeholder={t.comments.commentPlaceholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] bg-background border-border font-serif resize-none focus-visible:ring-1"
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="uppercase text-xs font-bold tracking-widest">
              {t.comments.submit}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
