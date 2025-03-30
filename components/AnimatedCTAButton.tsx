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
  const [isMounted, setIsMounted] = useState(false);
  const [showGlow, setShowGlow] = useState(false);

  // Initialize on client-side
  useEffect(() => {
    setIsMounted(true);
    
    // Delay showing the glow effect until after the button appears
    const timer = setTimeout(() => {
      setShowGlow(true);
    }, (delay + 1) * 1000); // Convert to milliseconds
    
    return () => clearTimeout(timer);
  }, [delay]);

  if (!isMounted) {
    return null; // Prevent SSR flash
  }

  return (
    <div className="relative inline-block mx-auto">
      {/* Glow effect */}
      {showGlow && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 opacity-70 blur-lg"
          style={{ 
            paddingInline: '15px',
            paddingBlock: '10px',
            marginInline: '-15px',
            marginBlock: '-10px',
            background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.8) 0%, rgba(236, 72, 153, 0.8) 50%, rgba(234, 88, 12, 0.8) 100%)'
          }}
          initial={{ opacity: 0}}
          animate={{ 
            opacity: [0.4, 0.7, 0.4],
            scale: [0.8, 1.05, 0.8]
          }}
          transition={{ 
            duration: 2.5, 
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse"
          }}
          // whileHover={{ opacity: 0.9, scale: 1.05 }}
        />
      )}
      
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
                x: isHovered ? 8 : 0
              }}
              transition={{ 
                duration: 0.2,
                ease: "easeOut"
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