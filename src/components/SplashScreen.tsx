import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState<"burst" | "text" | "exit">("burst");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 600);
    const t2 = setTimeout(() => setPhase("exit"), 2200);
    const t3 = setTimeout(onComplete, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "exit" ? null : null}
      <motion.div
        key="splash"
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{ background: "hsl(24, 100%, 51%)" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "exit" ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        {/* Radiating burst rings */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2 border-white/20"
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ 
              width: [0, 800 + i * 200], 
              height: [0, 800 + i * 200], 
              opacity: [0.6, 0] 
            }}
            transition={{ 
              duration: 1.2, 
              delay: i * 0.15, 
              ease: "easeOut" 
            }}
          />
        ))}

        {/* Center glow */}
        <motion.div
          className="absolute w-32 h-32 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(45, 100%, 64%) 0%, transparent 70%)" }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 3, 2], opacity: [0, 0.8, 0.4] }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Logo text */}
        <motion.div
          className="relative z-10 text-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: phase === "text" || phase === "exit" ? 1 : 0.5, 
            opacity: phase === "text" || phase === "exit" ? 1 : 0 
          }}
          transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <h1 
            className="text-7xl md:text-9xl font-bold tracking-tighter text-white"
            style={{ fontFamily: "'Montserrat', system-ui, sans-serif" }}
          >
            KOOKOOS
          </h1>
          <motion.p
            className="text-lg md:text-xl text-white/80 mt-2 tracking-[0.3em] uppercase"
            style={{ fontFamily: "'Poppins', system-ui, sans-serif" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            Bold Tanzanian Flavor
          </motion.p>
        </motion.div>

        {/* Fire emoji accents */}
        {[
          { x: -120, y: -80, delay: 0.8 },
          { x: 130, y: -60, delay: 0.9 },
          { x: -90, y: 70, delay: 1.0 },
          { x: 110, y: 80, delay: 1.1 },
        ].map((pos, i) => (
          <motion.span
            key={i}
            className="absolute text-3xl"
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1.2, 0.8],
              x: pos.x,
              y: pos.y
            }}
            transition={{ delay: pos.delay, duration: 0.8, ease: "easeOut" }}
          >
            🔥
          </motion.span>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;
