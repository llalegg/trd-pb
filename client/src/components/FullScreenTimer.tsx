import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, RotateCcw, Settings, X, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TimerPhase {
  name: string;
  duration: number; // in seconds
  color: string;
  isWork: boolean;
}

interface FullScreenTimerProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName?: string;
  exerciseDetails?: {
    sets: number;
    reps: string;
    restTime: string;
  };
}

// Default HIIT workout phases
const defaultPhases: TimerPhase[] = [
  { name: "Work", duration: 30, color: "bg-red-500", isWork: true },
  { name: "Rest", duration: 10, color: "bg-green-500", isWork: false },
  { name: "Work", duration: 30, color: "bg-red-500", isWork: true },
  { name: "Rest", duration: 10, color: "bg-green-500", isWork: false },
  { name: "Work", duration: 30, color: "bg-red-500", isWork: true },
  { name: "Rest", duration: 10, color: "bg-green-500", isWork: false },
  { name: "Work", duration: 30, color: "bg-red-500", isWork: true },
  { name: "Rest", duration: 10, color: "bg-green-500", isWork: false },
];

export default function FullScreenTimer({
  isOpen,
  onClose,
  exerciseName = "HIIT Workout",
  exerciseDetails
}: FullScreenTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(defaultPhases[0].duration);
  const [phases, setPhases] = useState<TimerPhase[]>(defaultPhases);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for beeps
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio();
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      
      audioRef.current = {
        play: () => {
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.1);
        }
      } as any;
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Phase completed
            playBeep();
            if (currentPhaseIndex < phases.length - 1) {
              setCurrentPhaseIndex(prev => prev + 1);
              return phases[currentPhaseIndex + 1].duration;
            } else {
              // Workout completed
              setIsRunning(false);
              playCompletionSound();
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining, currentPhaseIndex, phases]);

  const playBeep = () => {
    if (isSoundEnabled && audioRef.current) {
      audioRef.current.play();
    }
  };

  const playCompletionSound = () => {
    if (isSoundEnabled && audioRef.current) {
      // Play multiple beeps for completion
      for (let i = 0; i < 3; i++) {
        setTimeout(() => audioRef.current?.play(), i * 200);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentPhaseIndex(0);
    setTimeRemaining(phases[0].duration);
  };

  const handleStop = () => {
    setIsRunning(false);
    onClose();
  };

  const currentPhase = phases[currentPhaseIndex];
  const progressPercentage = ((phases[currentPhaseIndex].duration - timeRemaining) / phases[currentPhaseIndex].duration) * 100;
  const totalWorkoutTime = phases.reduce((sum, phase) => sum + phase.duration, 0);
  const completedTime = phases.slice(0, currentPhaseIndex).reduce((sum, phase) => sum + phase.duration, 0) + (phases[currentPhaseIndex].duration - timeRemaining);
  const workoutProgress = (completedTime / totalWorkoutTime) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-white">{exerciseName}</h1>
            {exerciseDetails && (
              <p className="text-sm text-neutral-400">
                {exerciseDetails.sets} sets • {exerciseDetails.reps} reps • {exerciseDetails.restTime} rest
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSoundEnabled(!isSoundEnabled)}
            className="text-white hover:bg-white/10"
          >
            {isSoundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-white/10"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Phase Indicator */}
        <div className="mb-8">
          <div className={`inline-flex items-center px-6 py-3 rounded-full ${currentPhase.color} text-white font-semibold text-lg`}>
            {currentPhase.name}
          </div>
          <p className="text-center text-neutral-400 mt-2">
            Phase {currentPhaseIndex + 1} of {phases.length}
          </p>
        </div>

        {/* Timer Circle */}
        <div className="relative mb-8">
          <div className="w-64 h-64 rounded-full border-8 border-neutral-700 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-white mb-2">
                {formatTime(timeRemaining)}
              </div>
              <div className="text-lg text-neutral-400">
                {currentPhase.isWork ? "WORK HARD!" : "REST"}
              </div>
            </div>
          </div>
          <Progress 
            value={progressPercentage} 
            className="absolute inset-0 w-64 h-64 rounded-full [&>div]:rounded-full"
          />
        </div>

        {/* Workout Progress */}
        <div className="w-full max-w-md mb-8">
          <div className="flex justify-between text-sm text-neutral-400 mb-2">
            <span>Workout Progress</span>
            <span>{Math.round(workoutProgress)}%</span>
          </div>
          <Progress value={workoutProgress} className="h-2" />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={handleReset}
            className="bg-transparent border-white text-white hover:bg-white/10"
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            Reset
          </Button>
          
          <Button
            size="lg"
            onClick={handleStartPause}
            className={`${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-2" />
                Start
              </>
            )}
          </Button>
          
          <Button
            variant="secondary"
            size="lg"
            onClick={handleStop}
            className="bg-transparent border-white text-white hover:bg-white/10"
          >
            <Square className="h-5 w-5 mr-2" />
            Stop
          </Button>
        </div>
      </div>

      {/* Phase Progress Bar */}
      <div className="p-6">
        <div className="flex gap-1 mb-2">
          {phases.map((phase, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded ${
                index < currentPhaseIndex
                  ? phase.color
                  : index === currentPhaseIndex
                  ? `${phase.color} opacity-70`
                  : 'bg-neutral-700'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-neutral-400">
          {phases.map((phase, index) => (
            <span key={index} className={index === currentPhaseIndex ? 'text-white font-semibold' : ''}>
              {phase.name}
            </span>
          ))}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
          <Card className="w-full max-w-md mx-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Timer Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Work Duration (seconds)</label>
                  <input
                    type="number"
                    defaultValue="30"
                    className="w-full mt-1 p-2 border rounded"
                    onChange={(e) => {
                      const newPhases = phases.map(phase => 
                        phase.isWork ? { ...phase, duration: parseInt(e.target.value) || 30 } : phase
                      );
                      setPhases(newPhases);
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Rest Duration (seconds)</label>
                  <input
                    type="number"
                    defaultValue="10"
                    className="w-full mt-1 p-2 border rounded"
                    onChange={(e) => {
                      const newPhases = phases.map(phase => 
                        !phase.isWork ? { ...phase, duration: parseInt(e.target.value) || 10 } : phase
                      );
                      setPhases(newPhases);
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Number of Rounds</label>
                  <input
                    type="number"
                    defaultValue="4"
                    className="w-full mt-1 p-2 border rounded"
                    onChange={(e) => {
                      const rounds = parseInt(e.target.value) || 4;
                      const workDuration = phases.find(p => p.isWork)?.duration || 30;
                      const restDuration = phases.find(p => !p.isWork)?.duration || 10;
                      
                      const newPhases: TimerPhase[] = [];
                      for (let i = 0; i < rounds; i++) {
                        newPhases.push(
                          { name: "Work", duration: workDuration, color: "bg-red-500", isWork: true },
                          { name: "Rest", duration: restDuration, color: "bg-green-500", isWork: false }
                        );
                      }
                      setPhases(newPhases);
                    }}
                  />
                </div>
                <Button onClick={() => setShowSettings(false)} className="w-full">
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
