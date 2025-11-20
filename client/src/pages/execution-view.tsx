import React, { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Play, CheckCircle, Clock, Dumbbell, Target, Zap, Timer, Camera, FileText, Check, ChevronRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import EnterResultsBottomSheet from "@/components/EnterResultsBottomSheet";
import ExerciseDetailsSheet from "@/components/ExerciseDetailsSheet";

// Mock data for execution view
const mockRoutine = {
  type: "throwing",
  name: "Throwing Session",
  exerciseCount: 6,
  estimatedTime: "45 min",
  exercises: [
    {
      id: "1",
      name: "Dynamic Warm-up Throws",
      sets: 2,
      reps: "10-15",
      weight: undefined,
      status: "not-started",
      restTime: "60 seconds",
      equipment: ["Baseball", "Glove"],
      instructions: [
        "Start with easy throwing motion",
        "Gradually increase intensity",
        "Focus on smooth arm action",
        "Maintain proper throwing mechanics"
      ],
      formCues: [
        "Keep throwing arm loose and relaxed",
        "Follow through completely",
        "Stay balanced throughout motion",
        "Use legs for power generation"
      ],
      commonMistakes: [
        "Overthrowing too early",
        "Poor follow-through",
        "Rushing the motion",
        "Not using legs properly"
      ],
      loggedResults: []
    },
    {
      id: "2", 
      name: "Mechanics Drill - Balance Point",
      sets: 3,
      reps: "8-10",
      weight: undefined,
      status: "not-started",
      restTime: "90 seconds",
      equipment: ["Baseball"],
      instructions: [
        "Focus on balance point position",
        "Hold position for 2-3 seconds",
        "Maintain proper posture",
        "Complete throwing motion"
      ],
      formCues: [
        "Keep front leg straight",
        "Hold glove at target",
        "Stay balanced on back leg",
        "Smooth transition to throw"
      ],
      commonMistakes: [
        "Rushing the balance point",
        "Poor posture",
        "Not holding position",
        "Imbalanced stance"
      ],
      loggedResults: []
    },
    {
      id: "3",
      name: "Velocity Development",
      sets: 4,
      reps: "5-6",
      weight: undefined,
      status: "in-progress",
      restTime: "2 minutes",
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
      commonMistakes: [
        "Overthrowing and losing control",
        "Poor mechanics for speed",
        "Not using legs properly",
        "Tensing up"
      ],
      loggedResults: [
        { reps: "5", weight: undefined, notes: "Good velocity" }
      ]
    },
    {
      id: "4",
      name: "Change-up Practice",
      sets: 3,
      reps: "8-10",
      weight: undefined,
      status: "not-started",
      restTime: "90 seconds",
      equipment: ["Baseball"],
      instructions: [
        "Focus on off-speed mechanics",
        "Maintain same arm speed",
        "Practice grip variations",
        "Aim for consistent location"
      ],
      formCues: [
        "Same arm speed as fastball",
        "Relaxed grip pressure",
        "Full follow-through",
        "Keep mechanics consistent"
      ],
      commonMistakes: [
        "Slowing down arm motion",
        "Grip too tight",
        "Inconsistent release point",
        "Poor location"
      ],
      loggedResults: []
    },
    {
      id: "5",
      name: "Cool-down Throws",
      sets: 2,
      reps: "10-12",
      weight: undefined,
      status: "not-started",
      restTime: "45 seconds",
      equipment: ["Baseball"],
      instructions: [
        "Easy, relaxed throwing",
        "Focus on smooth motion",
        "Reduce intensity gradually",
        "Prepare for stretching"
      ],
      formCues: [
        "Relaxed arm action",
        "Smooth throwing motion",
        "Easy follow-through",
        "Stay loose and comfortable"
      ],
      commonMistakes: [
        "Throwing too hard",
        "Poor mechanics",
        "Not cooling down properly",
        "Rushing through"
      ],
      loggedResults: []
    },
    {
      id: "6",
      name: "Recovery Stretching",
      sets: 1,
      reps: "5 min",
      weight: undefined,
      status: "not-started",
      restTime: "No rest needed",
      equipment: ["Yoga Mat"],
      instructions: [
        "Static stretching routine",
        "Focus on shoulder and arm",
        "Hold each stretch 30 seconds",
        "Include hip and leg stretches"
      ],
      formCues: [
        "Hold stretches without bouncing",
        "Breathe deeply during stretches",
        "Feel gentle tension, not pain",
        "Relax into each position"
      ],
      commonMistakes: [
        "Bouncing during stretches",
        "Holding stretches too briefly",
        "Overstretching",
        "Not breathing properly"
      ],
      loggedResults: []
    }
  ]
};

const routineTypeIcons = {
  throwing: Target,
  movement: Zap,
  lifting: Dumbbell,
};

export default function ExecutionView() {
  const [, setLocation] = useLocation();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(2); // Start at exercise 3 (in-progress)
  const [showEnterResults, setShowEnterResults] = useState(false);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<SetResult[]>([]);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());
  const DEFAULT_TIMER_SECONDS = 300; // 5 minutes in seconds
  const [timerSeconds, setTimerSeconds] = useState(DEFAULT_TIMER_SECONDS);
  const [timerRunning, setTimerRunning] = useState(false);

  const currentExercise = mockRoutine.exercises[currentExerciseIndex];
  const completedExercises = mockRoutine.exercises.filter(ex => ex.status === "complete").length;
  const progressPercentage = (completedExercises / mockRoutine.exercises.length) * 100;

  const getStatusIcon = (status: string): React.ReactElement => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Play className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "complete":
        return "Complete";
      case "in-progress":
        return "In Progress";
      default:
        return "Not Started";
    }
  };


  interface SetResult {
    reps?: string;
    weight?: string;
    time?: string;
    rpe?: string;
    notes?: string;
  }

  const handleSaveResults = (_setIndex: number, result: SetResult): void => {
    setExerciseResults([result]);
    setShowEnterResults(false);
    // TODO: Update exercise status to complete
  };

  const handleFinishRoutine = (): void => {
    // TODO: Mark routine as complete and navigate back
    setLocation("/session-view");
  };

  const toggleExerciseExpansion = (exerciseId: string): void => {
    setExpandedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const handleEnterResultsForExercise = (exerciseId: string): void => {
    const exerciseIndex = mockRoutine.exercises.findIndex(ex => ex.id === exerciseId);
    setCurrentExerciseIndex(exerciseIndex);
    setShowEnterResults(true);
  };

  const handleViewDetailsForExercise = (exerciseId: string): void => {
    const exerciseIndex = mockRoutine.exercises.findIndex(ex => ex.id === exerciseId);
    setCurrentExerciseIndex(exerciseIndex);
    setShowExerciseDetails(true);
  };

  const toggleTimer = (): void => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = (): void => {
    setTimerRunning(false);
    setTimerSeconds(DEFAULT_TIMER_SECONDS);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effect
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

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/session-view")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-semibold">{mockRoutine.name}</h1>
            <p className="text-sm text-muted-foreground">
              Exercise {currentExerciseIndex + 1} of {mockRoutine.exercises.length}
            </p>
          </div>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress</span>
          <span>{completedExercises} / {mockRoutine.exercises.length}</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>


      {/* Exercise List */}
      <div className="px-4 pb-20">
        <h3 className="text-lg font-semibold mb-3">Exercises</h3>
        <div className="space-y-2">
          {mockRoutine.exercises.map((exercise, index) => {
            const isExpanded = expandedExercises.has(exercise.id);
            return (
              <Card 
                key={exercise.id}
                className={cn(
                  "transition-all duration-200",
                  exercise.status === "complete" && "opacity-60"
                )}
              >
                <CardContent className="p-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExerciseExpansion(exercise.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(exercise.status)}
                        <span className="text-sm font-medium">
                          {index + 1}. {exercise.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {exercise.sets} sets × {exercise.reps}
                          {exercise.weight && ` × ${exercise.weight} lbs`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Rest: {exercise.restTime}
                        </p>
                      </div>
                      <ChevronRight className={cn(
                        "h-4 w-4 transition-transform text-muted-foreground",
                        isExpanded && "rotate-90"
                      )} />
                    </div>
                  </div>
                  
                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border space-y-3">
                      <div className="flex gap-2">
          <Button 
            className="flex-1"
            onClick={() => handleEnterResultsForExercise(exercise.id)}
            data-testid={`enter-results-button-${exercise.id}`}
          >
                          <Check className="h-4 w-4 mr-2" />
                          Enter results
                        </Button>
                        <Button 
                          variant="secondary"
                          onClick={() => handleViewDetailsForExercise(exercise.id)}
                          data-testid={`view-details-button-${exercise.id}`}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
        <div className="flex gap-2">
          <Button
            className={cn(timerRunning ? "bg-primary text-primary-foreground" : "")}
            size="sm"
            onClick={toggleTimer}
          >
            <PlayCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {/* TODO: Open camera */}}
          >
            <Camera className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {/* TODO: Open notes */}}
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleFinishRoutine}
            className="ml-auto"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Floating Timer */}
      {timerRunning && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40">
          <Card className="shadow-lg border-2 border-primary">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="text-2xl font-mono font-bold text-primary mb-1">
                  {formatTime(timerSeconds)}
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={toggleTimer}
                    className="h-6 px-2 text-xs"
                  >
                    Pause
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={resetTimer}
                    className="h-6 px-2 text-xs"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Enter Results Bottom Sheet */}
      {showEnterResults && (
        <EnterResultsBottomSheet
          exerciseName={currentExercise.name}
          sets={currentExercise.sets}
          reps={currentExercise.reps}
          currentSetIndex={0}
          onSave={handleSaveResults}
          onCancel={() => setShowEnterResults(false)}
          existingResults={currentExercise.loggedResults}
        />
      )}

      {/* Exercise Details Sheet */}
      {showExerciseDetails && (
        <ExerciseDetailsSheet
          exercise={{
            ...currentExercise,
            routineType: mockRoutine.type
          }}
          onClose={() => setShowExerciseDetails(false)}
        />
      )}
    </div>
  );
}
