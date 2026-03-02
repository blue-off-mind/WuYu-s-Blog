import { motion, AnimatePresence } from "framer-motion";
import heroBg from "@/assets/hero_bg.jpeg";
import { useLanguage } from "@/contexts/LanguageContext";

export function Hero() {
  const { t, language } = useLanguage();

  return (
    <section className="relative py-20 md:py-32 px-6 border-b border-border/10 overflow-hidden">
      {/* Background with texture and fade */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img 
          src={heroBg} 
          alt="" 
          className="w-full h-full object-cover opacity-50 grayscale contrast-125" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      </div>

      <div className="container mx-auto max-w-6xl text-center relative z-10">
        <AnimatePresence mode="wait">
          <motion.span 
            key={`est-${language}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="inline-block mb-4 text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground"
          >
            {t.est}
          </motion.span>
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          <motion.h1 
            key={`title-${language}`}
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="font-serif text-6xl md:text-8xl lg:text-9xl font-normal leading-[0.9] tracking-tighter mb-8 text-foreground whitespace-pre-line"
          >
            {t.title}
          </motion.h1>
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          <motion.p 
            key={`sub-${language}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="max-w-xl mx-auto text-lg md:text-xl text-muted-foreground font-light leading-relaxed"
          >
            {t.subtitle}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}
