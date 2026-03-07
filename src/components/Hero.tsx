import { Button } from "@/components/ui/button";
import { MapPin, Phone } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import heroChicken from "@/assets/hero-chicken.jpg";

const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen bg-gradient-hero overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{ backgroundImage: `url(${heroChicken})`, y: bgY }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />

      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 container mx-auto px-4 h-screen flex items-center"
      >
        <div className="max-w-3xl text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Bahari Beach • Tegeta • Sinza</span>
          </motion.div>

          <motion.h1
            className="font-heading text-5xl md:text-7xl font-bold leading-tight mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
          >
            BOLD
            <span className="block text-accent">FLAVOR</span>
            <span className="block">AWAITS</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl leading-relaxed mb-8 text-white/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            Experience the most vibrant fried chicken and street food in Tanzania.
            Fresh, bold, and unapologetically delicious.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-heading font-bold text-lg px-8 py-6 shadow-glow"
              onClick={() => navigate("/menu")}
            >
              ORDER NOW
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary font-heading font-bold text-lg px-8 py-6"
            >
              <Phone className="w-5 h-5 mr-2" />
              CALL TO ORDER
            </Button>
          </motion.div>

          <motion.div
            className="mt-8 inline-block bg-accent text-accent-foreground px-6 py-3 rounded-xl font-bold"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, duration: 0.5, type: "spring" }}
          >
            🔥 NEW: Bomba Box - Only TSh 15,000!
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm font-medium">Scroll to Explore</span>
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <motion.div
              className="w-1 h-3 bg-white rounded-full mt-2"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
