"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface AnimatedCTAButtonProps {
  href: string;
  children: React.ReactNode;
}

const AnimatedCTAButton = ({ href, children }: AnimatedCTAButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const particlesRef = useRef<Array<{top: string, left: string}>>([]);

  // Initialize particle positions once on client
  useEffect(() => {
    setIsMounted(true);
    
    // Pre-calculate particle positions
    particlesRef.current = Array(5).fill(0).map(() => ({
      top: `${Math.floor(Math.random() * 100)}%`,
      left: `${Math.floor(Math.random() * 100)}%`
    }));
  }, []);

  // Create a pulsing effect every few seconds to draw attention
  useEffect(() => {
    if (!isMounted) return;
    
    const pulseInterval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }, 5000);
    
    return () => clearInterval(pulseInterval);
  }, [isMounted]);

  return (
    <div className="relative group w-fit">
      {/* Animated background glow effect */}
      <div 
        className={`absolute -inset-0.5 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-lg blur-[8px] 
        opacity-70 group-hover:opacity-100 transition-all duration-300
        ${isPulsing && isMounted ? 'animate-pulse' : ''}`}
      ></div>
      
      {/* Subtle particles effect (dots) - only rendered client-side */}
      {isMounted && (
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          {particlesRef.current.map((pos, i) => (
            <div 
              key={i}
              className={`absolute w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-70 animate-float-${i+1}`}
              style={{
                top: pos.top,
                left: pos.left,
                animationDelay: `${i * 0.2}s`
              }}
            ></div>
          ))}
        </div>
      )}
      
      <Button 
        asChild 
        className={`relative text-lg max-sm:w-full transition-all duration-300 ease-in-out 
        transform group-hover:scale-105 group-hover:shadow-lg
        ${isPulsing && isMounted ? 'scale-[1.03]' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={href} className="flex items-center gap-2">
          {children}
          <ArrowRight 
            className={`transition-all duration-300 
            ${isHovered ? 'translate-x-1' : ''} 
            ${isPulsing && isMounted ? 'animate-bounce-x' : ''}`} 
            size={20} 
          />
        </Link>
      </Button>
    </div>
  );
};

export default AnimatedCTAButton;