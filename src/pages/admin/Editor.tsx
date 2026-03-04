import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStore } from "@/contexts/StoreContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation, useRoute } from "wouter";
import { Header } from "@/components/layout/Header";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Article, Category, Mood } from "@/lib/types";

export default function Editor() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const { getArticle, addArticle, updateArticle } = useStore();
  const { t } = useLanguage();
  const [, params] = useRoute("/admin/editor/:id?");
  const [, setLocation] = useLocation();
  const isEditing = !!params?.id;

  const [formData, setFormData] = useState<Partial<Article>>({
    title: "",
    author: "",
    category: "Design",
    mood: "Deep Focus",
    imageUrl: "",
    editorNote: "",
    bestContext: "",
    pullQuote: "",
    content: "<p>Start writing...</p>",
  });

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      setLocation("/admin/login");
      return;
    }
    if (isEditing && params?.id) {
      const art = getArticle(params.id);
      if (art) {
        setFormData(art);
      } else {
        toast.error("Article not found");
        setLocation("/admin");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin, isLoading, isEditing, params?.id, setLocation]);

  const handleChange = (field: keyof Article, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && params?.id) {
        await updateArticle(params.id, formData);
        toast.success("Article updated");
      } else {
        await addArticle(formData as Omit<Article, "id" | "publishedAt">);
        toast.success("Article published");
      }
      setLocation("/admin");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save article");
    }
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
    <div className="min-h-screen bg-background pb-20">
      <Header />
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-bold">{isEditing ? t.admin.edit : t.admin.newArticle}</h1>
          <Button variant="outline" onClick={() => setLocation("/admin")}>{t.admin.cancel}</Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>{t.admin.title}</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => handleChange("title", e.target.value)} 
                required 
                className="font-serif text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>{t.admin.author}</Label>
              <Input 
                value={formData.author} 
                onChange={(e) => handleChange("author", e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>{t.admin.category}</Label>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value as Category)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {["Design", "Coding", "Life", "Music", "Tech"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>{t.admin.mood}</Label>
              <select
                value={formData.mood}
                onChange={(e) => handleChange("mood", e.target.value as Mood)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {["Deep Focus", "Sunday Morning", "Late Night", "Nostalgic", "Sharp", "Energetic"].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{t.admin.cover}</Label>
              <ImagePicker 
                currentUrl={formData.imageUrl}
                onSelect={(url) => handleChange("imageUrl", url)}
              />
            </div>
          </div>

          <div className="space-y-4 border-t border-border pt-6">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Editorial Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label>{t.admin.context}</Label>
                <Input value={formData.bestContext} onChange={(e) => handleChange("bestContext", e.target.value)} />
              </div>
               <div className="space-y-2">
                <Label>{t.article.editorNote}</Label>
                <Input value={formData.editorNote} onChange={(e) => handleChange("editorNote", e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{t.admin.pullQuote}</Label>
                <Input value={formData.pullQuote} onChange={(e) => handleChange("pullQuote", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t.admin.content}</Label>
            <Textarea 
              value={formData.content} 
              onChange={(e) => handleChange("content", e.target.value)} 
              className="min-h-[300px] font-serif"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="ghost" onClick={() => setLocation("/admin")}>{t.admin.cancel}</Button>
            <Button type="submit">{t.admin.save}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
