"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface CallHintProps {
  text?: string;
  timeoutDuration?: number;
  onDismiss?: () => void;
  targetId?: string;
}

const CallHint = ({
  text = "Click CALL to start the interview",
  timeoutDuration = 5000,
  onDismiss,
  targetId,
}: CallHintProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set timeout to hide the hint after specified duration
    const timeout = setTimeout(() => {
      setIsVisible(false);
      if (onDismiss) onDismiss();
    }, timeoutDuration);

    // Add click event listener to the target button if targetId is provided
    if (targetId) {
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const clickHandler = () => {
          setIsVisible(false);
          if (onDismiss) onDismiss();
          clearTimeout(timeout);
        };
        
        targetElement.addEventListener("click", clickHandler);
        
        // Clean up event listener
        return () => {
          targetElement.removeEventListener("click", clickHandler);
          clearTimeout(timeout);
        };
      }
    }

    // Clean up timeout
    return () => clearTimeout(timeout);
  }, [timeoutDuration, onDismiss, targetId]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full mb-6 flex flex-col items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-dark-300/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg text-center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm font-medium">{text}</p>
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [0, 5, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              ease: "easeInOut" 
            }}
            className="text-primary-200 mt-1"
          >
            <ChevronDown size={24} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CallHint;