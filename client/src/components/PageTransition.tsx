import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

// Route hierarchy for determining transition direction
const routeHierarchy: { [key: string]: number } = {
  '/': 0,
  '/home': 1,
  '/program-page': 1,
  '/session-view': 2,
  '/focus-view': 3,
  '/execution-view': 2,
  '/messages': 1,
  '/vault': 1,
  '/me': 1,
  '/week-page': 1,
};

export default function PageTransition({ children }: PageTransitionProps) {
  const [location] = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const prevLocationRef = useRef(location);

  useEffect(() => {
    const prevLocation = prevLocationRef.current;
    const prevLevel = routeHierarchy[prevLocation] ?? 0;
    const currentLevel = routeHierarchy[location] ?? 0;

    // Determine direction based on hierarchy
    if (currentLevel > prevLevel) {
      setDirection('forward');
    } else if (currentLevel < prevLevel) {
      setDirection('back');
    } else {
      // Same level - use heuristics based on common navigation patterns
      if (
        (location.includes('focus') && !prevLocation.includes('focus')) ||
        (location.includes('session') && !prevLocation.includes('session') && !prevLocation.includes('focus'))
      ) {
        setDirection('forward');
      } else {
        setDirection('back');
      }
    }

    prevLocationRef.current = location;
    
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setDisplayLocation(location);
    }, 10);

    return () => clearTimeout(timer);
  }, [location]);

  const variants = {
    initial: {
      opacity: 0,
      x: direction === 'forward' ? 20 : -20,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: direction === 'forward' ? -20 : 20,
    },
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={displayLocation}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{
          type: "tween",
          ease: [0.4, 0.0, 0.2, 1], // Material Design easing
          duration: 0.25,
        }}
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative',
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

