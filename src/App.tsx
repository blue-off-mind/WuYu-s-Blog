import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { StoreProvider } from "@/contexts/StoreContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Home from "@/pages/Home";
import ArticleDetail from "@/pages/ArticleDetail";
import Login from "@/pages/admin/Login";
import Dashboard from "@/pages/admin/Dashboard";
import Editor from "@/pages/admin/Editor";
import Comments from "@/pages/admin/Comments";
import NotFound from "@/pages/NotFound";

// Use hash-based routing (/#/) to support opening index.html directly via file:// protocol
function AppRouter() {
  return (
    <Router hook={useHashLocation}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/article/:id" component={ArticleDetail} />
        <Route path="/admin/login" component={Login} />
        <Route path="/admin" component={Dashboard} />
        <Route path="/admin/comments" component={Comments} />
        <Route path="/admin/editor" component={Editor} />
        <Route path="/admin/editor/:id" component={Editor} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

// Note on theming:
// - Choose defaultTheme based on your design (light or dark background)
// - Update the color palette in index.css to match
// - If you want switchable themes, add `switchable` prop and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <StoreProvider>
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </StoreProvider>
    </ErrorBoundary>
  );
}

export default App;

