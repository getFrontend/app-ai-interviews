"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CircleArrowDown } from "lucide-react";

interface AllInterviewsListProps {
  renderedCards: React.ReactNode[];
}

export default function AllInterviewsList({ 
  renderedCards 
}: AllInterviewsListProps) {
  const interviewsPerPage = Number(process.env.NEXT_PUBLIC_INTERVIEWS_PER_PAGE) || 3;
  const [itemsToShow, setItemsToShow] = useState(interviewsPerPage);
  const incrementBy = 6;

  const handleLoadMore = () => {
    setItemsToShow(prev => prev + incrementBy);
  };

  const hasMoreItems = itemsToShow < renderedCards.length;

  if (renderedCards.length === 0) {
    return <div className="interviews-section">
      <p>There are no interviews available</p>
    </div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="interviews-section">
        <AnimatePresence>
          {renderedCards.slice(0, itemsToShow).map((card, index) => (
            <motion.div
              key={index}
              className="flex"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: index >= itemsToShow - incrementBy ? 0.1 * (index % incrementBy) : 0,
              }}
            >
              {card}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMoreItems && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleLoadMore}
            className="btn-secondary flex items-center gap-2"
          >
            <span>Load More</span>
            <CircleArrowDown />
          </button>
        </div>
      )}
    </div>
  );
}