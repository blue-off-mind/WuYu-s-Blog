import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useState } from "react";

interface LikeButtonProps {
  likes: number;
  onClick: () => void;
  label: string;
}

export function LikeButton({ likes, onClick, label }: LikeButtonProps) {
  const [burstKey, setBurstKey] = useState(0);

  const handleClick = () => {
    onClick();
    // Force remount to reliably replay burst on rapid consecutive clicks.
    setBurstKey((prev) => prev + 1);
  };

  return (
    <button 
      onClick={handleClick}
      className="group flex flex-col items-center gap-2 cursor-pointer outline-none"
    >
      <div className="relative">
        <motion.div
          key={`heart-${burstKey}`}
          whileTap={{ scale: 0.8 }}
          animate={burstKey > 0 ? { scale: [1, 1.5, 1], rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="p-4 rounded-full bg-muted border border-border group-hover:border-primary/50 group-hover:bg-primary/5 transition-colors relative z-10"
        >
          <Heart 
            className="w-8 h-8 text-primary transition-colors duration-300 fill-primary/10 group-hover:fill-primary" 
          />
        </motion.div>
        
        {/* Particle Burst System */}
        <AnimatePresence mode="popLayout">
          {burstKey > 0 && Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30); // 360 / 12 = 30 degrees step
            const radius = 60; // Burst radius
            const radian = (angle * Math.PI) / 180;
            const x = Math.cos(radian) * radius;
            const y = Math.sin(radian) * radius;
            
            return (
              <motion.div
                key={`particle-${burstKey}-${i}`}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.2 }}
                animate={{ 
                  x, 
                  y, 
                  opacity: 0, 
                  scale: 0.5 + (i % 3) * 0.15
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-primary z-0 pointer-events-none"
                style={{ marginLeft: -4, marginTop: -4 }}
              />
            );
          })}
        </AnimatePresence>
      </div>
      
      <motion.span 
        key={likes} // Animate number change
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="font-serif text-lg font-medium text-muted-foreground group-hover:text-primary transition-colors"
      >
        {likes} {label}
      </motion.span>
    </button>
  );
}
