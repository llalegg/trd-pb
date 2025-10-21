import React, { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Play, Pause, CheckCircle, Clock, ChevronLeft, ChevronRight, Camera, FileText, Info, Timer, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import EnterResultsBottomSheet from "@/components/EnterResultsBottomSheet";
import ExerciseDetailsSheet from "@/components/ExerciseDetailsSheet";
import FullScreenTimer from "@/components/FullScreenTimer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// For now reuse mock from execution-view idea
const mockExercise = {
  id: "3",
  name: "Velocity Development",
  sets: 4,
  reps: "5-6",
  restTime: "2 minutes",
  description: "Focus on developing throwing velocity with maximum intent",
  equipment: ["Baseball", "Radar Gun"],
  instructions: [
    "Throw with maximum intent",
    "Focus on velocity over accuracy",
    "Use full throwing motion",
    "Record each throw"
  ],
  formCues: [
    "Explosive leg drive",
    "Quick arm action",
    "Full follow-through",
    "Stay relaxed but powerful"
  ],
  loggedResults: [] as any[]
};

export default function FocusView() {
  const [, setLocation] = useLocation();
  const [showEnterResults, setShowEnterResults] = useState(false);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [showFullScreenTimer, setShowFullScreenTimer] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(120); // Start with 2:00 minutes
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState(0);
  const [totalSets] = useState(mockExercise.sets); // Total sets from exercise

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => seconds - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateProgress = () => {
    if (!totalSets || totalSets === 0) return 0;
    return Math.round((completedSets / totalSets) * 100);
  };

  const handleSetComplete = () => {
    if (completedSets < totalSets && totalSets > 0) {
      setCompletedSets(prev => prev + 1);
      console.log(`Set ${completedSets + 1} completed. Progress: ${completedSets + 1}/${totalSets}`);
    }
  };

  const handleExitAttempt = () => {
    console.log("Exit attempt triggered");
    setShowExitConfirmation(true);
  };

  const handleConfirmExit = () => {
    console.log("Confirm exit triggered");
    setShowExitConfirmation(false);
    setLocation("/session-view");
  };

  const handleCancelExit = () => {
    console.log("Cancel exit triggered");
    setShowExitConfirmation(false);
  };

  const handlePreviousExercise = () => {
    console.log("Previous exercise clicked, current index:", currentExerciseIndex);
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      console.log("Moved to exercise index:", currentExerciseIndex - 1);
    }
  };

  const handleNextExercise = () => {
    console.log("Next exercise clicked, current index:", currentExerciseIndex);
    // In a real app, this would check if there are more exercises
    setCurrentExerciseIndex(currentExerciseIndex + 1);
    console.log("Moved to exercise index:", currentExerciseIndex + 1);
  };

  const handleTimerToggle = () => {
    console.log("Timer toggle clicked, running:", timerRunning);
    setTimerRunning(!timerRunning);
  };

  const handleTimerReset = () => {
    console.log("Timer reset clicked");
    setTimerRunning(false);
    setTimerSeconds(120);
  };

  const handleEnterResults = () => {
    console.log("Enter results clicked");
    setShowEnterResults(true);
    // Also complete a set when entering results
    handleSetComplete();
  };

  const handleFullScreenTimer = () => {
    console.log("Full screen timer clicked");
    setShowFullScreenTimer(true);
  };

  try {
    return (
      <div className="bg-zinc-950 relative min-h-screen w-full">
      {/* Top Section - Record Video Button */}
      <div className="fixed top-4 left-4 z-[100]">
        <Button variant="secondary" size="icon" className="w-10 h-10">
          <Camera className="h-6 w-6" />
        </Button>
      </div>

      {/* Video Area with Training Video */}
      <div className="relative w-full h-[400px] bg-black">
        <iframe
          className="w-full h-full pointer-events-none"
          src="https://www.youtube.com/embed/9KQ1XJybq88?autoplay=0&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&fs=0&cc_load_policy=0&iv_load_policy=3"
          title="Exercise Training Video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen={false}
        />
        
        {/* Close Button Overlay */}
        <div className="absolute top-4 right-4 z-[100]">
          <Button 
            variant="secondary" 
            size="icon" 
            className="w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-200" 
            onClick={handleExitAttempt}
          >
            <X className="h-6 w-6 text-white" />
          </Button>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="w-full px-4 py-2">
        <div className="flex gap-1">
          {Array.from({ length: totalSets || 0 }, (_, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-sm transition-all duration-300 ${
                index < (completedSets || 0)
                  ? 'bg-primary' 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Timer Section - No background, full width, 0px from progress bar */}
      <div className="w-full p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-12 h-12 bg-primary/10 hover:bg-primary/20"
              onClick={handleTimerToggle}
            >
              {timerRunning ? (
                <Pause className="w-8 h-8 text-primary" />
              ) : (
                <Play className="w-8 h-8 text-primary" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-10 h-10 bg-muted/10 hover:bg-muted/20"
              onClick={handleTimerReset}
            >
              <RotateCcw className="w-8 h-8 text-muted-foreground" />
            </Button>
            <div>
              <p className="text-4xl font-bold text-foreground">
                {formatTime(timerSeconds)}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleFullScreenTimer}
          >
            <ChevronRight className="w-6 h-6 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 pb-20 space-y-6">

        {/* Exercise Details Section */}
        <div className="space-y-4">
          {/* Exercise Name and Chevron */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-foreground">{mockExercise.name}</h1>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowExerciseDetails(true)}
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>

          {/* Assigned Parameters - Combined card */}
          <Card className="p-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Assigned</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">50</p>
                  <p className="text-sm text-muted-foreground">Reps</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">50 kg</p>
                  <p className="text-sm text-muted-foreground">Weight</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">2:00</p>
                  <p className="text-sm text-muted-foreground">Rest after</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Results Card */}
          <Card className="p-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Results</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">—</p>
                  <p className="text-sm text-muted-foreground">Reps</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">—</p>
                  <p className="text-sm text-muted-foreground">Weight</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">—</p>
                  <p className="text-sm text-muted-foreground">Time</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons - Sticky to bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950 border-t border-border">
          <div className="p-4 space-y-4">
            {/* Enter Results Button */}
            <Button 
              className="w-full h-12 text-base font-medium"
              onClick={handleEnterResults}
            >
              Enter results
            </Button>

            {/* Previous and Next Buttons */}
            <div className="flex gap-4">
              <Button 
                variant="secondary" 
                className="flex-1 h-12 text-base font-medium"
                onClick={handlePreviousExercise}
                disabled={currentExerciseIndex === 0}
              >
                Previous
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1 h-12 text-base font-medium"
                onClick={handleNextExercise}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom sheet for results */}
      {showEnterResults && (
        <EnterResultsBottomSheet
          exerciseName={mockExercise.name}
          sets={mockExercise.sets}
          reps={mockExercise.reps}
          currentSetIndex={0}
          onSave={() => setShowEnterResults(false)}
          onCancel={() => setShowEnterResults(false)}
          existingResults={[]}
        />
      )}

      {/* Full Screen Timer */}
      <FullScreenTimer
        isOpen={showFullScreenTimer}
        onClose={() => setShowFullScreenTimer(false)}
        exerciseName={mockExercise.name}
        exerciseDetails={{
          sets: mockExercise.sets,
          reps: mockExercise.reps,
          restTime: mockExercise.restTime
        }}
      />

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitConfirmation} onOpenChange={setShowExitConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End exercise?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end exercise?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelExit}>
              No, go back
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmExit}>
              Yes, I sure
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exercise Details Bottom Sheet */}
      {showExerciseDetails && (
        <ExerciseDetailsSheet
          exercise={mockExercise}
          onClose={() => setShowExerciseDetails(false)}
        />
      )}
    </div>
  );
  } catch (error) {
    console.error('Focus view error:', error);
    return (
      <div className="bg-zinc-950 relative min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">Please refresh the page</p>
          <Button onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </div>
      </div>
    );
  }
}


