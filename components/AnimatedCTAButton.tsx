"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface AnimatedCTAButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const AnimatedCTAButton = ({ 
  href, 
  children, 
  className = "",
  delay = 0.2
}: AnimatedCTAButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Initialize on client-side
  useEffect(() => {
    setIsMounted(true);
    
    // Initial pulse to draw attention
    setTimeout(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1200);
    }, 1000);
    
    // Periodic pulse effect
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1200);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isMounted) {
    return null; // Prevent SSR flash
  }

  return (
    <div className="relative inline-block mx-auto">
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 opacity-70 blur-lg"
        style={{ 
          padding: '8px',
          margin: '-8px',
          background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.8) 0%, rgba(236, 72, 153, 0.8) 50%, rgba(234, 88, 12, 0.8) 100%)'
        }}
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isPulsing ? [0.6, 0.9, 0.6] : 0.6,
        }}
        transition={{ 
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        whileHover={{ opacity: 0.9 }}
      />
      
      {/* Button */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5,
          ease: "easeOut",
          delay: delay
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={href}>
          <motion.button 
            className={`relative px-5 py-2.5 bg-white dark:bg-orange-300 text-black dark:text-black rounded-full font-medium text-lg flex items-center gap-2 cursor-pointer ${className}`}
          >
            <span>{children}</span>
            
            <motion.div
              animate={{ 
                x: isHovered ? 8 : [0, 4, 0]
              }}
              transition={{ 
                x: {
                  duration: isHovered ? 0.2 : 2,
                  ease: isHovered ? "easeOut" : "easeInOut",
                  repeat: isHovered ? 0 : Infinity,
                  repeatType: "reverse"
                }
              }}
            >
              <ArrowRight size={18} />
            </motion.div>
            
            {/* Subtle shine effect */}
            {isHovered && (
              <motion.div 
                className="absolute inset-0 overflow-hidden rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="w-20 h-full bg-white/50 blur-md absolute -skew-x-12"
                  initial={{ left: "-20%" }}
                  animate={{ left: "120%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
              </motion.div>
            )}
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
};

export default AnimatedCTAButton;