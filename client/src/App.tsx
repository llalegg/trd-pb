import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import Programs from "@/pages/programs";
import AddProgram from "@/pages/add-program";
import AthleteView from "@/pages/athlete-home";
import SessionView from "@/pages/session-view";
import ExecutionView from "@/pages/execution-view";
import FocusView from "@/pages/focus-view";
import NotFound from "@/pages/not-found";
import MessagesPage from "@/pages/messages";
import VaultPage from "@/pages/vault";
import MePage from "@/pages/me";
import ProgramPage from "@/pages/program-page";
import WeekPage from "@/pages/week-page";

// Route hierarchy for determining transition direction
const routeHierarchy: { [key: string]: number } = {
  '/': 0,
  '/home': 1,
  '/program-page': 1,
  '/session-view': 2,
  '/focus-view': 3,
  '/execution-view': 2,
  '/add-program': 1,
  '/messages': 1,
  '/vault': 1,
  '/me': 1,
  '/week-page': 1,
};

function AnimatedRouter() {
  const [location] = useLocation();
  const [prevLocation, setPrevLocation] = React.useState(location);
  const [direction, setDirection] = React.useState<'forward' | 'back'>('forward');

  React.useEffect(() => {
    const prevLevel = routeHierarchy[prevLocation] ?? 0;
    const currentLevel = routeHierarchy[location] ?? 0;

    if (currentLevel > prevLevel) {
      setDirection('forward');
    } else if (currentLevel < prevLevel) {
      setDirection('back');
    } else {
      if (
        (location.includes('focus') && !prevLocation.includes('focus')) ||
        (location.includes('session') && !prevLocation.includes('session') && !prevLocation.includes('focus'))
      ) {
        setDirection('forward');
      } else {
        setDirection('back');
      }
    }

    setPrevLocation(location);
  }, [location, prevLocation]);

  const variants = {
    initial: {
      opacity: 1,
      x: direction === 'forward' ? '100%' : '-100%',
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 1,
      x: direction === 'forward' ? '-100%' : '100%',
    },
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', overflowX: 'hidden' }}>
      <AnimatePresence initial={false}>
        <motion.div
          key={location}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants}
          transition={{
            type: "tween",
            ease: [0.25, 0.46, 0.45, 0.94], // iOS-like easing
            duration: 0.3,
          }}
          style={{ 
            width: '100%', 
            minHeight: '100vh',
            position: 'absolute',
            inset: 0,
          }}
        >
          <Switch>
            <Route path="/" component={Programs} />
            <Route path="/add-program" component={AddProgram} />
            <Route path="/home" component={AthleteView} />
            <Route path="/messages" component={MessagesPage} />
            <Route path="/vault" component={VaultPage} />
            <Route path="/me" component={MePage} />
            <Route path="/program-page" component={ProgramPage} />
            <Route path="/week-page" component={WeekPage} />
            <Route path="/session-view" component={SessionView} />
            <Route path="/execution-view" component={ExecutionView} />
            <Route path="/focus-view" component={FocusView} />
            <Route component={NotFound} />
          </Switch>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AnimatedRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
