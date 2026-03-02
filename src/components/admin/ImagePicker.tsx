import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Image as ImageIcon, Link as LinkIcon, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const CURATED_IMAGES = [
  // Minimalist Workspace
  { id: "mw1", url: "https://images.unsplash.com/photo-1622579521534-8252f7da47fd?auto=format&fit=crop&w=800&q=80", category: "Workspace", alt: "Minimal desk" },
  { id: "mw2", url: "https://images.unsplash.com/photo-1697742470246-dd10b2918bac?auto=format&fit=crop&w=800&q=80", category: "Workspace", alt: "Clean setup" },
  { id: "mw3", url: "https://images.unsplash.com/photo-1745910020846-3d4d0088d24d?auto=format&fit=crop&w=800&q=80", category: "Workspace", alt: "Bright office" },
  { id: "mw4", url: "https://images.unsplash.com/photo-1587522384446-64daf3e2689a?auto=format&fit=crop&w=800&q=80", category: "Workspace", alt: "Workspace details" },
  { id: "mw5", url: "https://images.unsplash.com/photo-1702047158651-59f0bdc0dafc?auto=format&fit=crop&w=800&q=80", category: "Workspace", alt: "Modern desk" },
  
  // Coding
  { id: "cs1", url: "https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?auto=format&fit=crop&w=800&q=80", category: "Tech", alt: "Code screen" },
  { id: "cs2", url: "https://images.unsplash.com/photo-1552308995-2baac1ad5490?auto=format&fit=crop&w=800&q=80", category: "Tech", alt: "Developer typing" },
  { id: "cs3", url: "https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=800&q=80", category: "Tech", alt: "Laptop code" },
  { id: "cs4", url: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?auto=format&fit=crop&w=800&q=80", category: "Tech", alt: "Circuit board" },
  { id: "cs5", url: "https://images.unsplash.com/photo-1642697318738-c74f8eac0bd0?auto=format&fit=crop&w=800&q=80", category: "Tech", alt: "Dark mode code" },

  // Coffee
  { id: "cf1", url: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80", category: "Life", alt: "Latte art" },
  { id: "cf2", url: "https://images.unsplash.com/photo-1525193612562-0ec53b0e5d7c?auto=format&fit=crop&w=800&q=80", category: "Life", alt: "Coffee shop vibe" },
  { id: "cf3", url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80", category: "Life", alt: "Pour over coffee" },
  { id: "cf4", url: "https://images.unsplash.com/photo-1508766917616-d22f3f1eea14?auto=format&fit=crop&w=800&q=80", category: "Life", alt: "Morning cup" },
  { id: "cf5", url: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=800&q=80", category: "Life", alt: "Espresso machine" },

  // Music
  { id: "vr1", url: "https://images.unsplash.com/photo-1602848597941-0d3d3a2c1241?auto=format&fit=crop&w=800&q=80", category: "Music", alt: "Vinyl record" },
  { id: "vr2", url: "https://images.unsplash.com/photo-1602848596140-33c2b48c6ade?auto=format&fit=crop&w=800&q=80", category: "Music", alt: "Turntable needle" },
  { id: "vr3", url: "https://images.unsplash.com/photo-1620831450720-de4a2a539e61?auto=format&fit=crop&w=800&q=80", category: "Music", alt: "Headphones" },
  { id: "vr4", url: "https://images.unsplash.com/photo-1616714108212-fb526152dbf9?auto=format&fit=crop&w=800&q=80", category: "Music", alt: "Record collection" },
  { id: "vr5", url: "https://images.unsplash.com/photo-1580656449278-e8381933522c?auto=format&fit=crop&w=800&q=80", category: "Music", alt: "Audio waves" },
];

interface ImagePickerProps {
  onSelect: (url: string) => void;
  currentUrl?: string;
}

export function ImagePicker({ onSelect, currentUrl }: ImagePickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  const filteredImages = CURATED_IMAGES.filter(img => 
    img.category.toLowerCase().includes(searchQuery.toLowerCase()) || 
    img.alt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExternalSearch = () => {
    if (!searchQuery) return;
    window.open(`https://unsplash.com/s/photos/${encodeURIComponent(searchQuery)}`, '_blank');
  };

  return (
    <div className="w-full bg-background border border-border rounded-lg overflow-hidden shadow-sm">
      <Tabs defaultValue="popular" className="w-full">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Select Cover Image</h3>
          <TabsList className="h-8">
            <TabsTrigger value="popular" className="text-xs">Popular</TabsTrigger>
            <TabsTrigger value="link" className="text-xs">Direct Link</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="popular" className="p-0 m-0">
          <div className="p-4 border-b border-border space-y-3">
             <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter popular images or search Unsplash..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            {searchQuery && filteredImages.length === 0 && (
              <Button 
                variant="outline" 
                className="w-full text-xs h-8 justify-between"
                onClick={handleExternalSearch}
              >
                <span>Search "{searchQuery}" on Unsplash</span>
                <ExternalLink className="h-3 w-3 opacity-50" />
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-[300px]">
            <div className="p-4 grid grid-cols-3 gap-3">
              {filteredImages.map((img) => (
                <button
                  key={img.id}
                  onClick={() => onSelect(img.url)}
                  className={cn(
                    "group relative aspect-[4/5] rounded-md overflow-hidden border-2 transition-all",
                    currentUrl === img.url ? "border-primary" : "border-transparent hover:border-border"
                  )}
                >
                  <img 
                    src={img.url} 
                    alt={img.alt} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Select</span>
                  </div>
                  {currentUrl === img.url && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
                  )}
                </button>
              ))}
              {filteredImages.length === 0 && !searchQuery && (
                <p className="col-span-3 text-center text-xs text-muted-foreground py-8">
                  No images found. Try a different search.
                </p>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="link" className="p-4 m-0 space-y-4 h-[350px]">
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Paste image URL here..."
                value={customUrl}
                onChange={(e) => {
                  setCustomUrl(e.target.value);
                  if (e.target.value) onSelect(e.target.value);
                }}
                className="font-mono text-xs"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              Paste any URL from Unsplash, Pexels, or your own hosting.
            </p>
          </div>
          
          {customUrl && (
            <div className="relative aspect-video rounded-md border border-border overflow-hidden bg-muted">
              <img 
                src={customUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded">Preview</div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
