import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import Home from "@/pages/home";
import Programs from "@/pages/programs";
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
import CoachSessionView from "@/pages/coach-session-view";
import TemplatesPage from "@/pages/templates";
import AthleteProgramPage from "@/pages/athlete-program";

// Web-view routes (coach views) - no animations
const webViewRoutes = [
  '/',
  '/programs',
  '/programs/', // ensure nested athlete route recognized
  '/program-page',
  '/coach-session-view',
  '/athletes',
  '/templates',
];

// Route hierarchy for determining transition direction (athlete mobile views only)
const routeHierarchy: { [key: string]: number } = {
  '/home': 1,
  '/session-view': 2,
  '/focus-view': 3,
  '/execution-view': 2,
  '/messages': 1,
  '/vault': 1,
  '/me': 1,
  '/week-page': 1,
};

function AnimatedRouter() {
  const [location] = useLocation();
  const [prevLocation, setPrevLocation] = React.useState(location);
  const [direction, setDirection] = React.useState<'forward' | 'back'>('forward');
  
  // Coach layout wrapper (sidebar removed)
  const CoachLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <div className="min-h-screen bg-surface-base">{children}</div>
    );
  };
  
  // Helper to wrap a page with the CoachLayout
  const withCoachLayout = (Component: React.ComponentType<any>) => () => (
    <CoachLayout>
      <Component />
    </CoachLayout>
  );
  
  // Check if route starts with any web-view route (handles query params)
  const isWebView = webViewRoutes.some(route => location === route || location.startsWith(route + '/') || location.startsWith(route + '?'));
  const wasWebView = webViewRoutes.some(route => prevLocation === route || prevLocation.startsWith(route + '/') || prevLocation.startsWith(route + '?'));

  React.useEffect(() => {
    // Only calculate direction for athlete mobile views
    if (!isWebView && !wasWebView) {
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
    }

    setPrevLocation(location);
  }, [location, prevLocation, isWebView, wasWebView]);

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

  const routes = (
    <Switch>
      <Route path="/" component={withCoachLayout(Home)} />
      <Route path="/programs/:athleteId" component={withCoachLayout(AthleteProgramPage)} />
      <Route path="/programs" component={withCoachLayout(Programs)} />
      <Route path="/templates" component={withCoachLayout(TemplatesPage)} />
      <Route path="/home" component={AthleteView} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/vault" component={VaultPage} />
      <Route path="/me" component={MePage} />
      <Route path="/program-page" component={withCoachLayout(ProgramPage)} />
      <Route path="/coach-session-view" component={CoachSessionView} />
      <Route path="/week-page" component={WeekPage} />
      <Route path="/session-view" component={SessionView} />
      <Route path="/execution-view" component={ExecutionView} />
      <Route path="/focus-view" component={FocusView} />
      <Route component={NotFound} />
    </Switch>
  );

  // No animations for web-view routes
  if (isWebView) {
    return routes;
  }

  // Animations for athlete mobile views
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
          {routes}
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
