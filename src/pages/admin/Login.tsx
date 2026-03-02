import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";

export default function Login() {
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      toast.success("Welcome back, Editor.");
      setLocation("/admin");
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-bold">{t.admin.loginTitle}</h1>
            <p className="text-muted-foreground mt-2">{t.admin.loginSubtitle}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder={language === "en" ? "Password" : "密码"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-serif tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full">
              {t.admin.loginButton}
            </Button>
          </form>
          
          {/* Hint removed */}
        </div>
      </div>
    </div>
  );
}
