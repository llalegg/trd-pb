import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Programs from "@/pages/programs";
import AddProgram from "@/pages/add-program";
import AthleteView from "@/pages/athlete-view";
import SessionView from "@/pages/session-view";
import ExecutionView from "@/pages/execution-view";
import NotFound from "@/pages/not-found";
import MessagesPage from "@/pages/messages";
import VaultPage from "@/pages/vault";
import MePage from "@/pages/me";
import ProgramPage from "@/pages/program-page";
import WeekPage from "@/pages/week-page";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Programs} />
      <Route path="/add-program" component={AddProgram} />
      <Route path="/athlete-view" component={AthleteView} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/vault" component={VaultPage} />
      <Route path="/me" component={MePage} />
      <Route path="/program-page" component={ProgramPage} />
      <Route path="/week-page" component={WeekPage} />
      <Route path="/session-view" component={SessionView} />
      <Route path="/execution-view" component={ExecutionView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
