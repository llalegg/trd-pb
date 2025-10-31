import React, { useMemo, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ChevronRight, Play, Clock, Video, Check, X, ChevronLeft, ChevronDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getSessionData } from "@/lib/sessionData";
import { exerciseStateManager } from "@/lib/exerciseState";
import ExerciseDetailsSheet from "@/components/ExerciseDetailsSheet";

// Get session data and flatten all exercises in order
const getSessionExercises = () => {
  const sessionData = getSessionData(17); // Using day 17 as default
  const allExercises: any[] = [];
  
  // Flatten exercises from all routines in order
  sessionData.routines.forEach((routine) => {
    routine.exercises.forEach((exercise) => {
      allExercises.push({
        ...exercise,
        routineType: routine.type,
        description: `${routine.name} exercise focusing on ${routine.description}`,
        equipment: ["Equipment"], // Default equipment
  instructions: [
          "Follow proper form and technique",
          "Maintain control throughout the movement",
          "Focus on quality over quantity"
  ],
  formCues: [
          "Keep core engaged",
          "Breathe properly",
          "Maintain proper posture"
        ],
        loggedResults: [] as any[],
        restTime: "2:00" // Default rest time
      });
    });
  });
  
  return allExercises;
};

// RPE options with descriptions (1-10 scale)
const rpeOptions = [
  { value: "1", description: "Very easy" },
  { value: "2", description: "Easy" },
  { value: "3", description: "Moderate" },
  { value: "4", description: "Somewhat hard" },
  { value: "5", description: "Hard" },
  { value: "6", description: "Very hard" },
  { value: "7", description: "Very, very hard" },
  { value: "8", description: "Extremely hard" },
  { value: "9", description: "Near maximal" },
  { value: "10", description: "Maximal effort" }
];

// RPE Dropdown Component
function RPEDropdown({ isOpen, onClose, onSelect, currentValue, position }: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  currentValue: string;
  position?: { top: number; left: number };
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Dropdown - Full screen width with 12px padding */}
      <div 
        className="fixed z-50 bg-[#121210] border-t border-[#292928] shadow-lg max-h-60 overflow-y-auto left-0 right-0 mx-[12px] rounded-t-lg"
        style={{
          top: position?.top || 0
        }}
      >
        {rpeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => {
              onSelect(option.value);
              onClose();
            }}
            className={cn(
              "w-full px-3 py-2 text-left transition-colors hover:bg-[#171716] flex items-center justify-between",
              currentValue === option.value 
                ? "bg-[#292928] text-[#f7f6f2]" 
                : "text-[#979795]"
            )}
          >
            <span className="font-semibold text-sm">{option.value}</span>
            <span className="text-xs ml-2">{option.description}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// Rest Time Selector Component
function RestTimeSelector({ isOpen, onClose, onSelect, currentValue }: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  currentValue: string;
}) {
  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(0);

  React.useEffect(() => {
    if (isOpen && currentValue) {
      const [mins, secs] = currentValue.split(':').map(Number);
      setMinutes(mins || 2);
      setSeconds(secs || 0);
    }
  }, [isOpen, currentValue]);

  const handleSelect = () => {
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    onSelect(timeString);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
      <div className="bg-[#121210] w-full rounded-t-xl">
        <div className="p-4 border-b border-[#292928]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#f7f6f2]">Select Rest Time</h3>
            <button onClick={onClose}>
              <X className="w-6 h-6 text-[#979795]" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Minutes */}
            <div className="flex flex-col items-center">
              <label className="text-sm text-[#979795] mb-2">Minutes</label>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setMinutes(Math.min(59, minutes + 1))}
                  className="w-12 h-8 bg-[#292928] rounded text-[#f7f6f2] hover:bg-[#3a3a38]"
                >
                  +
                </button>
                <div className="w-16 h-12 bg-[#171716] rounded my-2 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#f7f6f2]">{minutes}</span>
                </div>
                <button
                  onClick={() => setMinutes(Math.max(0, minutes - 1))}
                  className="w-12 h-8 bg-[#292928] rounded text-[#f7f6f2] hover:bg-[#3a3a38]"
                >
                  -
                </button>
              </div>
            </div>
            
            <span className="text-2xl font-bold text-[#f7f6f2] mt-8">:</span>
            
            {/* Seconds */}
            <div className="flex flex-col items-center">
              <label className="text-sm text-[#979795] mb-2">Seconds</label>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => setSeconds(seconds === 45 ? 0 : seconds + 15)}
                  className="w-12 h-8 bg-[#292928] rounded text-[#f7f6f2] hover:bg-[#3a3a38]"
                >
                  +
                </button>
                <div className="w-16 h-12 bg-[#171716] rounded my-2 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#f7f6f2]">{seconds.toString().padStart(2, '0')}</span>
                </div>
                <button
                  onClick={() => setSeconds(seconds === 0 ? 45 : seconds - 15)}
                  className="w-12 h-8 bg-[#292928] rounded text-[#f7f6f2] hover:bg-[#3a3a38]"
                >
                  -
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleSelect}
            className="w-full h-12 bg-[#e5e4e1] rounded-full text-black font-semibold"
          >
            Set Rest Time
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FocusView() {
  const [, setLocation] = useLocation();
  
  // Check URL parameters for navigation
  const urlParams = new URLSearchParams(window.location.search);
  const targetRoutineType = urlParams.get('routineType');
  const targetExerciseName = urlParams.get('exerciseName');
  const isSuperset = urlParams.get('superset') === 'true';
  const supersetType = urlParams.get('supersetType') || 'movement';
  
  // Find the correct exercise index based on URL parameters
  const getInitialExerciseIndex = () => {
    if (targetRoutineType && targetExerciseName) {
      const sessionExercises = getSessionExercises();
      const foundIndex = sessionExercises.findIndex(exercise => 
        exercise.routineType === targetRoutineType && exercise.name === targetExerciseName
      );
      return foundIndex >= 0 ? foundIndex : 0;
    }
    return 0;
  };
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(getInitialExerciseIndex());
  const [exerciseStates, setExerciseStates] = useState<{ [key: number]: 'not-started' | 'active' | 'completed' }>({});
  const [showIntroScreen, setShowIntroScreen] = useState(false);
  const [showRPEDropdown, setShowRPEDropdown] = useState(false);
  const [rpeDropdownPosition, setRPEDropdownPosition] = useState({ top: 0, left: 0 });
  const [selectedRPERow, setSelectedRPERow] = useState<number | null>(null);
  const [selectedRPEExercise, setSelectedRPEExercise] = useState<number | null>(null);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [showRestTimeSelector, setShowRestTimeSelector] = useState(false);
  const [selectedRestTimeRow, setSelectedRestTimeRow] = useState<number | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [completedRoutineType, setCompletedRoutineType] = useState<string>('');
  
  // Weight unit state (lbs by default)
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs');
  const lbsToKg = (lbs: number) => Math.round(lbs * 0.45359237 * 10) / 10;
  const kgToLbs = (kg: number) => Math.round((kg / 0.45359237) * 10) / 10;
  
  // Superset-specific state
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number | null>(null);
  
  // Table data state - initialize with default values, will be updated when exercise is available
  const [tableData, setTableData] = useState([
    { set: 1, reps: 12, weight: 135, rpe: "6", restTime: "2:00" },
    { set: 2, reps: 12, weight: 135, rpe: "6", restTime: "2:00" },
    { set: 3, reps: 12, weight: 135, rpe: "6", restTime: "2:00" },
    { set: 4, reps: 12, weight: 135, rpe: "6", restTime: "2:00" },
  ]);

  // Helper function to get realistic defaults based on routine type
  const getRealisticDefaults = (routineType?: string) => {
    switch (routineType) {
      case 'strength':
        return { reps: 8, weight: 135, restTime: "3:00" };
      case 'movement':
        return { reps: 15, weight: 0, restTime: "1:00" }; // Body weight
      case 'throwing':
        return { reps: 20, weight: 0, restTime: "2:00" }; // No weight for throwing
      default:
        return { reps: 12, weight: 135, restTime: "2:00" };
    }
  };

  // Track which cells have been overridden by user input
  const [overriddenCells, setOverriddenCells] = useState<{ [key: string]: boolean }>({});

  // Superset table data state
  const [supersetTableData, setSupersetTableData] = useState<{ [key: string]: any }>({});

  // Get superset data or regular exercises
  const getSupersetData = () => {
    if (supersetType === 'movement') {
      return {
        name: "Movement Superset",
        sets: 4,
        exercises: [
          {
            name: "Band Pull-Apart",
            reps: "110",
            weight: "110",
            routineType: "movement"
          },
          {
            name: "Shoulder Circles",
            reps: "15",
            weight: "Body weight",
            routineType: "movement"
          },
          {
            name: "Arm Swings",
            reps: "20",
            weight: "Body weight",
            routineType: "movement"
          }
        ]
      };
    } else {
      return {
        name: "Strength & Conditioning Superset",
        sets: 4,
        exercises: [
          {
            name: "Push-ups",
            reps: "12",
            weight: "Body weight",
            routineType: "strength"
          },
          {
            name: "Pull-ups",
            reps: "8",
            weight: "Body weight",
            routineType: "strength"
          }
        ]
      };
    }
  };

  const sessionExercises = useMemo(() => getSessionExercises(), []);
  const supersetData = isSuperset ? getSupersetData() : null;
  const currentExercise = isSuperset ? null : sessionExercises[currentExerciseIndex];
  
  // Update table data when exercise changes
  useEffect(() => {
    if (currentExercise && !isSuperset) {
      const exerciseHasInteracted = exerciseStates[currentExerciseIndex] !== undefined;
      if (!exerciseHasInteracted) {
        const defaults = getRealisticDefaults(currentExercise.routineType);
        setTableData([
          { set: 1, reps: defaults.reps, weight: defaults.weight, rpe: "6", restTime: defaults.restTime },
          { set: 2, reps: defaults.reps, weight: defaults.weight, rpe: "6", restTime: defaults.restTime },
          { set: 3, reps: defaults.reps, weight: defaults.weight, rpe: "6", restTime: defaults.restTime },
          { set: 4, reps: defaults.reps, weight: defaults.weight, rpe: "6", restTime: defaults.restTime },
        ]);
        setOverriddenCells({}); // Reset overridden cells
      }
    }
  }, [currentExerciseIndex, currentExercise?.routineType, exerciseStates]);
  
  // Check if current exercise is already completed
  const isCurrentExerciseCompleted = currentExercise ? 
    exerciseStateManager.isExerciseCompleted(currentExercise.routineType, currentExercise.name) : false;
  const isCurrentSupersetCompleted = isSuperset && supersetData ? 
    exerciseStateManager.isExerciseCompleted(supersetType, supersetData.name) : false;

  // Check if current exercise has been interacted with
  const hasInteracted = exerciseStates[currentExerciseIndex] !== undefined;

  // Show intro screen only if exercise hasn't been interacted with (not for supersets)
  const shouldShowIntroScreen = !isSuperset && !hasInteracted && showIntroScreen;

  const handleStartExercise = () => {
    setExerciseStates(prev => ({
      ...prev,
      [currentExerciseIndex]: 'active'
    }));
    setShowIntroScreen(false);
  };

  const handleCompleteAndNext = () => {
    if (isSuperset && supersetData) {
      // Handle superset completion
      console.log('Superset completed:', {
        superset: supersetData.name,
        routineType: supersetType,
        completedAt: new Date().toISOString()
      });

      // Mark superset as completed in global state
      exerciseStateManager.markExerciseCompleted(
        supersetType,
        supersetData.name,
        supersetData.sets
      );

      // Go back to session view (no success screen for supersets)
      setLocation("/session-view");
      return;
    }

    // Regular exercise completion logic
    setExerciseStates(prev => ({
      ...prev,
      [currentExerciseIndex]: 'completed'
    }));

    console.log('Exercise completed:', {
      exercise: currentExercise?.name,
      routineType: currentExercise?.routineType,
      data: tableData,
      completedAt: new Date().toISOString()
    });

    // Update the exercise completion using state manager
    if (currentExercise) {
      exerciseStateManager.markExerciseCompleted(
        currentExercise.routineType,
        currentExercise.name,
        currentExercise.sets
      );
      
      currentExercise.completedSets = currentExercise.sets;
      currentExercise.progress = 100;
    }

    // Check if we're at the last exercise of the current routine
    const currentRoutineType = currentExercise?.routineType;
    const nextExercise = sessionExercises[currentExerciseIndex + 1];
    const isLastExerciseOfRoutine = !nextExercise || nextExercise.routineType !== currentRoutineType;

    if (currentExerciseIndex < sessionExercises.length - 1) {
      if (isLastExerciseOfRoutine) {
        setCompletedRoutineType(currentRoutineType || '');
        setShowSuccessScreen(true);
      } else {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
        setShowIntroScreen(true);
        
        const nextExercise = sessionExercises[currentExerciseIndex + 1];
        const newDefaults = getRealisticDefaults(nextExercise?.routineType);
        setTableData([
          { set: 1, reps: newDefaults.reps, weight: newDefaults.weight, rpe: "6", restTime: newDefaults.restTime },
          { set: 2, reps: newDefaults.reps, weight: newDefaults.weight, rpe: "6", restTime: newDefaults.restTime },
          { set: 3, reps: newDefaults.reps, weight: newDefaults.weight, rpe: "6", restTime: newDefaults.restTime },
          { set: 4, reps: newDefaults.reps, weight: newDefaults.weight, rpe: "6", restTime: newDefaults.restTime },
        ]);
      }
    } else {
      setCompletedRoutineType(currentRoutineType || '');
      setShowSuccessScreen(true);
    }
  };

  const handleMoveToNextRoutine = () => {
    setShowSuccessScreen(false);
    
    // Find next exercise (which should be from next routine)
    if (currentExerciseIndex < sessionExercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setShowIntroScreen(true);
      
      // Reset table data for next exercise
      const nextExercise = sessionExercises[currentExerciseIndex + 1];
      const newDefaults = getRealisticDefaults(nextExercise?.routineType);
      setTableData([
        { set: 1, reps: newDefaults.reps, weight: newDefaults.weight, rpe: "6", restTime: newDefaults.restTime },
        { set: 2, reps: newDefaults.reps, weight: newDefaults.weight, rpe: "6", restTime: newDefaults.restTime },
        { set: 3, reps: newDefaults.reps, weight: newDefaults.weight, rpe: "6", restTime: newDefaults.restTime },
        { set: 4, reps: newDefaults.reps, weight: newDefaults.weight, rpe: "6", restTime: newDefaults.restTime },
      ]);
    } else {
      // All exercises completed, go back to session view
      setLocation("/session-view");
    }
  };

  const handleBackToSession = () => {
    setLocation("/session-view");
  };

  const handlePreviousExercise = () => {
    if (isSuperset) {
      // For supersets, just go back to session view
      setLocation("/session-view");
      return;
    }

    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setShowIntroScreen(true);
      
      // Reset table data for previous exercise - useEffect will handle this automatically
    } else {
      // If at first exercise, go back to session view
      setLocation("/session-view");
    }
  };

  const handleTableInputChange = (rowIndex: number, field: string, value: string | number) => {
    setTableData(prev => prev.map((row, index) => 
      index === rowIndex ? { ...row, [field]: value } : row
    ));
    
    // Mark this cell as overridden (except for RPE which starts with default value)
    const cellKey = `${rowIndex}-${field}`;
    if (field !== 'rpe' || value !== '6') {
      setOverriddenCells(prev => ({ ...prev, [cellKey]: true }));
    }
  };

  const handleRPEClick = (rowIndex: number, exerciseIndex?: number, event?: React.MouseEvent) => {
    setSelectedRPERow(rowIndex);
    setSelectedRPEExercise(exerciseIndex || null);
    
    if (event) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setRPEDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
    }
    
    setShowRPEDropdown(true);
  };

  const handleRestTimeClick = (rowIndex: number) => {
    setSelectedRestTimeRow(rowIndex);
    setShowRestTimeSelector(true);
  };

  const handleRestTimeSelect = (value: string) => {
    if (selectedRestTimeRow !== null) {
      handleTableInputChange(selectedRestTimeRow, 'restTime', value);
    }
  };

  const handleRPESelect = (value: string) => {
    if (selectedRPERow !== null) {
      if (isSuperset && selectedRPEExercise !== null) {
        // Handle superset RPE selection
        setSupersetRPE(selectedRPEExercise, selectedRPERow, value);
      } else {
        // Handle regular table RPE selection
        handleTableInputChange(selectedRPERow, 'rpe', value);
      }
    }
  };

  const handleExerciseNameClick = () => {
    setShowExerciseDetails(true);
  };

  // Get tracking fields based on routine type
  const getTrackingFields = (routineType: string) => {
    switch (routineType) {
      case 'strength':
        return ['reps', 'weight', 'rpe', 'restTime'];
      case 'movement':
        return ['reps', 'rpe', 'restTime'];
      case 'throwing':
        return ['rpe'];
      default:
        return ['reps', 'weight', 'rpe', 'restTime'];
    }
  };

  // Check if exercise is bodyweight
  const isBodyweightExercise = currentExercise && (
    currentExercise.weight === 0 || 
    currentExercise.weight === "Body weight" ||
    (typeof currentExercise.weight === 'string' && currentExercise.weight.toLowerCase().includes('body'))
  );

  // Get tracking fields - exclude weight for bodyweight exercises
  const baseTrackingFields = isSuperset 
    ? getTrackingFields(supersetType) 
    : getTrackingFields(currentExercise?.routineType || 'strength');
  
  const trackingFields = isBodyweightExercise && !isSuperset
    ? baseTrackingFields.filter(field => field !== 'weight')
    : baseTrackingFields;

  // Helper function to check if a cell is overridden
  const isCellOverridden = (rowIndex: number, field: string) => {
    const cellKey = `${rowIndex}-${field}`;
    return overriddenCells[cellKey] || false;
  };

  // Helper function to check if a value is custom (different from default)
  const isCustomValue = (rowIndex: number, field: string, value: any) => {
    // Only show as custom if the cell has been explicitly overridden by the user
    const cellKey = `${rowIndex}-${field}`;
    if (!overriddenCells[cellKey]) {
      return false; // Not overridden, so not custom
    }
    
    const routineDefaults = getRealisticDefaults(currentExercise?.routineType || 'strength');
    const defaults = {
      reps: routineDefaults.reps,
      weight: routineDefaults.weight,
      rpe: "6",
      restTime: routineDefaults.restTime
    };
    
    // Only return true if it's been overridden AND differs from default
    return value !== defaults[field as keyof typeof defaults];
  };

  // Helper function to get superset RPE value
  const getSupersetRPE = (exerciseIndex: number, setIndex: number) => {
    const key = `${exerciseIndex}-${setIndex}-rpe`;
    return supersetTableData[key] || '';
  };

  // Helper function to set superset RPE value
  const setSupersetRPE = (exerciseIndex: number, setIndex: number, value: string) => {
    const key = `${exerciseIndex}-${setIndex}-rpe`;
    setSupersetTableData(prev => ({ ...prev, [key]: value }));
    
    // Mark as overridden if value is not empty
    if (value !== '') {
      setOverriddenCells(prev => ({ ...prev, key: true }));
    }
  };

  // Video slider handlers for superset
  const handleVideoSwipe = (direction: 'left' | 'right') => {
    if (!isSuperset || !supersetData) return;
    
    if (direction === 'left' && currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    } else if (direction === 'right' && currentVideoIndex < supersetData.exercises.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  // Get next routine type for success screen
  const getNextRoutineType = () => {
    const routineOrder = ['movement', 'strength', 'throwing'];
    const currentIndex = routineOrder.indexOf(completedRoutineType);
    if (currentIndex !== -1 && currentIndex < routineOrder.length - 1) {
      return routineOrder[currentIndex + 1];
    }
    return null;
  };

  // Show success screen when routine is completed
  if (showSuccessScreen) {
    const nextRoutineType = getNextRoutineType();
    
      return (
      <div className="bg-[#0d0d0c] min-h-screen w-full flex flex-col items-center justify-center px-4">
        <div className="text-center space-y-8 max-w-sm">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-[#c4af6c] rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-black" />
          </div>
          
          {/* Success Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-[#f7f6f2] font-['Montserrat']">
              Great Job!
            </h1>
            <p className="text-[#979795] font-['Montserrat']">
              You've completed the {completedRoutineType} routine
            </p>
          </div>
          
          {/* Summary Information */}
          <div className="bg-[#171716] rounded-xl p-4 space-y-3">
            <h3 className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
              Routine Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#979795]">Routine Type:</span>
                <span className="text-[#f7f6f2] capitalize">{completedRoutineType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#979795]">Exercises Completed:</span>
                <span className="text-[#f7f6f2]">
                  {sessionExercises.filter(ex => ex.routineType === completedRoutineType).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#979795]">Status:</span>
                <span className="text-[#c4af6c]">Complete</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3 w-full">
            {nextRoutineType && (
              <Button 
                className="w-full h-12 text-sm font-semibold bg-[#e5e4e1] text-black hover:bg-[#d5d4d1] font-['Montserrat']"
                onClick={handleMoveToNextRoutine}
              >
                Move to {nextRoutineType.charAt(0).toUpperCase() + nextRoutineType.slice(1)}
              </Button>
            )}
            <Button 
              variant="outline"
              className="w-full h-12 text-sm font-semibold bg-transparent border-[#292928] text-[#f7f6f2] hover:bg-[#171716] font-['Montserrat']"
              onClick={handleBackToSession}
            >
              Back to Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show intro screen as a full page when needed
  if (shouldShowIntroScreen) {
    return (
      <div className="bg-[#0d0d0c] min-h-screen w-full flex flex-col relative">
        {/* Close Button - Top Right */}
        <button 
          onClick={() => setLocation("/session-view")}
          className="absolute top-4 right-4 w-10 h-10 bg-[#292928] rounded-full flex items-center justify-center z-50"
        >
          <X className="w-6 h-6 text-[#f7f6f2]" />
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          <div className="px-4 pt-6 pb-2 space-y-6">
            {/* Title Section */}
            <div className="space-y-1">
              <p className="text-sm text-[#979795] font-semibold">Prepare for exercise</p>
              <h1 className="text-lg font-semibold text-[#f7f6f2]">{currentExercise.name}</h1>
            </div>

            {/* Assigned Section */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-[#f7f6f2]">Assigned</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-[#979795]">Reps x Sets</p>
                  <p className="text-lg font-semibold text-[#f7f6f2]">{currentExercise.reps} x {currentExercise.sets}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-[#979795]">Weight</p>
                  <p className="text-lg font-semibold text-[#f7f6f2]">{currentExercise.weight || "Body weight"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-[#979795]">Rest Time</p>
                  <p className="text-lg font-semibold text-[#f7f6f2]">{currentExercise.restTime}</p>
                </div>
              </div>
            </div>

            {/* Equipment Section */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-[#f7f6f2]">Equipment needed</h2>
              <div className="flex flex-wrap gap-2">
                {currentExercise.equipment.map((equipmentName: string, index: number) => (
                  <button
                    key={index}
                    className="px-3 py-2 bg-[#171716] rounded-lg text-sm text-[#f7f6f2] hover:bg-[#292928] transition-colors"
                  >
                    {equipmentName}
                  </button>
                ))}
              </div>
            </div>

            {/* Set-up Instructions Section */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-[#f7f6f2]">Set-up Instructions</h2>
              <div className="space-y-2">
                {currentExercise.instructions.map((instruction: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#171716] flex items-center justify-center text-xs font-semibold text-[#979795] mt-0.5 shrink-0">
                      {index + 1}
                    </div>
                    <p className="text-sm text-[#979795] leading-relaxed">{instruction}</p>
                  </div>
                ))}
              </div>
      </div>

            {/* How-to Section */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-[#f7f6f2]">How-to</h2>
              <div className="space-y-2">
                {currentExercise.formCues.map((cue: string, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#585856] mt-2 shrink-0" />
                    <p className="text-sm text-[#979795] leading-relaxed">{cue}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Action Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0c] p-4">
          <Button 
            className="w-full h-12 text-sm font-semibold bg-[#e5e4e1] text-black hover:bg-[#d5d4d1]"
            onClick={handleStartExercise}
          >
            Start
          </Button>
        </div>
      </div>
    );
  }

  // Render superset view if in superset mode
  if (isSuperset && supersetData) {
    return (
      <div className="min-h-screen bg-[#0d0d0c] flex flex-col relative">
        {/* Video Section with Slider */}
        <div className="h-[377px] relative overflow-hidden">
          {/* Video Thumbnail Placeholder */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/images/gym-background.jpg)',
              backgroundColor: '#1a1a1a', // Fallback color
            }}
          >
            {/* Dark overlay for better text visibility */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            <div className="w-full h-full flex items-center justify-center relative">
              {/* Exercise Name Label - Top Left */}
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg px-3 py-2 z-10">
                <p className="text-sm font-semibold text-white font-['Montserrat']">
                  {supersetData.exercises[currentVideoIndex]?.name}
                </p>
              </div>
              
              {/* Duration Badge */}
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 rounded px-2 py-1 z-10">
                <p className="text-xs text-white font-['Montserrat']">2:30</p>
              </div>
              
              {/* Thumbnail Pattern */}
              <div className="w-full h-full opacity-10 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-45"></div>
            </div>
          </div>
          
          {/* Play Button Overlay - Static */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 bg-black bg-opacity-60 rounded-full flex items-center justify-center border-2 border-white border-opacity-20">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>

          {/* Video Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {supersetData.exercises.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentVideoIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  currentVideoIndex === index ? "bg-white" : "bg-white bg-opacity-40"
                )}
              />
            ))}
          </div>

          {/* Swipe Areas (invisible) */}
          <div 
            className="absolute left-0 top-0 w-1/3 h-full cursor-pointer"
            onClick={() => handleVideoSwipe('left')}
          />
          <div 
            className="absolute right-0 top-0 w-1/3 h-full cursor-pointer"
            onClick={() => handleVideoSwipe('right')}
          />
        </div>

        {/* Superset Header */}
        <div className="bg-[#0d0d0c] px-4 py-3 flex items-center justify-between border-b border-[#292928]">
          <p className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
            Superset
          </p>
          <p className="text-xs text-[#979795] font-['Montserrat'] font-medium">
            {supersetData.sets} sets
          </p>
        </div>

        {/* Exercises List with Tables */}
        <div className="flex-1 overflow-y-auto pb-24">
          {supersetData.exercises.map((exercise, exerciseIndex) => (
            <div key={exerciseIndex} className="mb-0">
              {/* Exercise Title */}
              <button 
                onClick={() => {
                  setSelectedExerciseIndex(exerciseIndex);
                  setShowExerciseDetails(true);
                }}
                className="bg-[#121210] border-b border-[#292928] px-4 py-3 flex items-center justify-between w-full text-left hover:bg-[#171716] transition-colors"
              >
                <div className="flex-1">
                  <p className="text-xs text-[#979795] font-medium font-['Montserrat']">Exercise</p>
                  <h1 className="text-base font-semibold text-[#f7f6f2] font-['Montserrat']">{exercise.name}</h1>
                </div>
                <ChevronRight className="w-6 h-6 text-[#979795]" />
              </button>

              {/* Table for this exercise */}
              <div className="overflow-x-auto scrollbar-hide">
                <div className="min-w-[500px]">
                  {/* Table Header */}
                  <div className="bg-[#121210] flex">
                    <div className="w-[54px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
                      <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Set</p>
                    </div>
                    {trackingFields.includes('reps') && (
                      <div className="w-[80px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
                        <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Reps</p>
                      </div>
                    )}
                    {trackingFields.includes('weight') && (
                      <div className="w-[120px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Weight</p>
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => setWeightUnit('lbs')}
                              className={cn(
                                "text-[9px] px-1 py-0.5 rounded min-w-[18px]",
                                weightUnit === 'lbs' ? "bg-[#292928] text-[#f7f6f2]" : "text-[#979795] hover:bg-[#171716]"
                              )}
                            >
                              lbs
                            </button>
                            <button
                              onClick={() => setWeightUnit('kg')}
                              className={cn(
                                "text-[9px] px-1 py-0.5 rounded min-w-[18px]",
                                weightUnit === 'kg' ? "bg-[#292928] text-[#f7f6f2]" : "text-[#979795] hover:bg-[#171716]"
                              )}
                            >
                              kg
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    {trackingFields.includes('rpe') && (
                      <div className="w-[80px] px-4 py-3 flex-shrink-0">
                        <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">RPE</p>
                      </div>
                    )}
                  </div>

                  {/* Table Rows */}
                  <div>
                    {Array.from({ length: supersetData.sets }, (_, setIndex) => (
                      <div key={setIndex} className="flex h-12 border-b border-[#292928]">
                        <div className="w-[54px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0">
                          <p className="text-sm font-semibold text-[#979795] font-['Montserrat']">{setIndex + 1}</p>
                        </div>
                        {trackingFields.includes('reps') && (
                          <div className={cn(
                            "w-[80px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0",
                            isCellOverridden(setIndex, `${exerciseIndex}-reps`) && "bg-[#16140F]"
                          )}>
                            <input
                              type="number"
                              defaultValue={exercise.reps}
                              onChange={(e) => handleTableInputChange(setIndex, `${exerciseIndex}-reps`, parseInt(e.target.value) || 0)}
                              className={cn(
                                "w-full bg-transparent text-sm font-['Montserrat'] border-none outline-none",
                                exercise.reps !== "110" ? "text-[#ff8c00]" : "text-[#f7f6f2]"
                              )}
                            />
                          </div>
                        )}
                        {trackingFields.includes('weight') && (
                          <div className={cn(
                            "w-[120px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0",
                            isCellOverridden(setIndex, `${exerciseIndex}-weight`) && "bg-[#16140F]"
                          )}>
                            <input
                              type="text"
                              defaultValue={(() => {
                                const raw = exercise.weight as string;
                                const numeric = parseFloat(raw);
                                if (!isNaN(numeric)) {
                                  return weightUnit === 'kg' ? String(lbsToKg(numeric)) : String(numeric);
                                }
                                return raw;
                              })()}
                              onChange={(e) => {
                                const val = e.target.value;
                                const n = parseFloat(val);
                                if (!isNaN(n)) {
                                  const lbs = weightUnit === 'kg' ? kgToLbs(n) : n;
                                  handleTableInputChange(setIndex, `${exerciseIndex}-weight`, String(Math.round(lbs * 10) / 10));
                                } else {
                                  handleTableInputChange(setIndex, `${exerciseIndex}-weight`, val);
                                }
                              }}
                              className={cn(
                                "w-full bg-transparent text-sm font-['Montserrat'] border-none outline-none",
                                (() => {
                                  const raw = exercise.weight as string;
                                  const numeric = parseFloat(raw);
                                  return (!isNaN(numeric) && numeric !== 110) || (isNaN(numeric) && raw !== "Body weight") ? "text-[#ff8c00]" : "text-[#f7f6f2]";
                                })()
                              )}
                            />
                          </div>
                        )}
                        {trackingFields.includes('rpe') && (
                          <div className={cn(
                            "w-[80px] px-4 py-3 flex items-center flex-shrink-0",
                            isCellOverridden(setIndex, `${exerciseIndex}-rpe`) && "bg-[#16140F]"
                          )}>
                            <button
                              onClick={(e) => handleRPEClick(setIndex, exerciseIndex, e)}
                              className="w-full flex items-center justify-between bg-transparent text-sm text-[#f7f6f2] font-['Montserrat'] border-none outline-none"
                            >
                              <span className={cn(
                                getSupersetRPE(exerciseIndex, setIndex) && getSupersetRPE(exerciseIndex, setIndex) !== "6" ? "text-[#ff8c00]" : "text-[#f7f6f2]"
                              )}>{getSupersetRPE(exerciseIndex, setIndex) || 'Select'}</span>
                              <ChevronDown className="w-4 h-4 text-[#979795]" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
            </div>
          </div>
        </div>
            </div>
          ))}
      </div>

        {/* Bottom Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0c] border-t border-[#292928] p-4 flex items-center gap-2 z-40">
          {/* Previous Button - only for completed exercises */}
          {isCurrentSupersetCompleted && (
            <button 
              onClick={handlePreviousExercise}
              className="w-12 h-12 bg-[#292928] rounded-full flex items-center justify-center hover:bg-[#3a3a38] transition-colors shrink-0"
            >
              <ArrowLeft className="w-6 h-6 text-[#f7f6f2]" />
            </button>
          )}
          
          {/* Record and Timer Buttons - only for non-completed exercises */}
          {!isCurrentSupersetCompleted && (
            <>
              <button 
                className="w-12 h-12 bg-[#292928] rounded-full flex items-center justify-center hover:bg-[#3a3a38] transition-colors shrink-0"
              >
                <Video className="w-6 h-6 text-[#f7f6f2]" />
              </button>
              <button 
                className="w-12 h-12 bg-[#292928] rounded-full flex items-center justify-center hover:bg-[#3a3a38] transition-colors shrink-0"
              >
                <Clock className="w-6 h-6 text-[#f7f6f2]" />
              </button>
            </>
          )}
          
          {/* Center Content - Complete & Next button fills remaining width */}
          <div className="flex-1 flex items-center justify-center min-w-0">
            {isCurrentSupersetCompleted ? (
              <span className="text-sm text-[#979795] font-['Montserrat']">Marked as completed</span>
            ) : (
              <button 
                onClick={handleCompleteAndNext}
                className="h-12 bg-[#e5e4e1] rounded-full flex items-center justify-center gap-2 px-5 w-full max-w-full"
              >
                <Check className="w-5 h-5 text-black shrink-0" />
                <span className="text-sm font-semibold text-black font-['Montserrat']">Complete & Next</span>
              </button>
            )}
          </div>
          
          {/* Next Button (for completed exercises) */}
          {isCurrentSupersetCompleted && (
            <button 
              onClick={handleCompleteAndNext}
              className="w-12 h-12 bg-[#e5e4e1] rounded-full flex items-center justify-center hover:bg-[#d5d4d1] transition-colors shrink-0"
            >
              <ArrowRight className="w-6 h-6 text-black" />
            </button>
          )}
        </div>

        {/* X Button - Top Right */}
        <button 
          onClick={() => setLocation("/session-view")}
          className="fixed top-4 right-4 w-10 h-10 bg-[#292928] rounded-full flex items-center justify-center z-50 shadow-lg"
        >
          <X className="w-6 h-6 text-[#f7f6f2]" />
        </button>

        {/* RPE Dropdown */}
        <RPEDropdown
          isOpen={showRPEDropdown}
          onClose={() => setShowRPEDropdown(false)}
          onSelect={handleRPESelect}
          currentValue={selectedRPERow !== null ? tableData[selectedRPERow]?.rpe || '' : ''}
          position={rpeDropdownPosition}
        />

        {/* Exercise Details Bottom Sheet */}
        {showExerciseDetails && selectedExerciseIndex !== null && supersetData.exercises[selectedExerciseIndex] && (
          <ExerciseDetailsSheet
            exercise={{
              id: `${supersetType}-${selectedExerciseIndex}`,
              name: supersetData.exercises[selectedExerciseIndex].name,
              sets: supersetData.sets,
              reps: supersetData.exercises[selectedExerciseIndex].reps,
              weight: supersetData.exercises[selectedExerciseIndex].weight,
              description: `Superset exercise focusing on ${supersetType} training`,
              instructions: [
                "Follow proper form and technique",
                "Maintain control throughout the movement",
                "Focus on quality over quantity"
              ],
              formCues: [
                "Keep core engaged",
                "Breathe properly",
                "Maintain proper posture"
              ],
              equipment: ["Equipment"],
              routineType: supersetType
            }}
            onClose={() => {
              setShowExerciseDetails(false);
              setSelectedExerciseIndex(null);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0c] flex flex-col relative">
      {/* Video Section */}
      <div className="h-[377px] relative overflow-hidden">
        {/* Video Thumbnail Placeholder */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/gym-background.jpg)',
            backgroundColor: '#1a1a1a', // Fallback color
          }}
        >
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          {/* Thumbnail Content */}
          <div className="w-full h-full flex items-center justify-center relative">
            {/* Duration Badge */}
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 rounded px-2 py-1 z-10">
              <p className="text-xs text-white font-['Montserrat']">2:30</p>
            </div>
            
            {/* Thumbnail Pattern */}
            <div className="w-full h-full opacity-10 bg-gradient-to-r from-transparent via-white to-transparent transform rotate-45"></div>
          </div>
        </div>
        
        {/* Play Button Overlay - Static (not clickable) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black bg-opacity-60 rounded-full flex items-center justify-center border-2 border-white border-opacity-20">
            <Play className="w-8 h-8 text-white ml-1" />
          </div>
        </div>
      </div>

      {/* Exercise Title Section - Clickable */}
      <button 
        onClick={handleExerciseNameClick}
        className="bg-[#121210] border-b border-[#292928] px-4 py-3 flex items-center justify-between w-full text-left hover:bg-[#171716] transition-colors"
      >
        <div className="flex-1">
          <p className="text-xs text-[#979795] font-medium font-['Montserrat']">Exercise</p>
          <h1 className="text-base font-semibold text-[#f7f6f2] font-['Montserrat']">{currentExercise.name}</h1>
        </div>
        <ChevronRight className="w-6 h-6 text-[#979795]" />
      </button>

      {/* Table Container - Single Scroll Container */}
      <div className="flex-1 flex flex-col pb-24 overflow-x-auto scrollbar-hide">
        <div className="min-w-[500px] flex-1 flex flex-col">
          {/* Table Header */}
          <div className="bg-[#121210] flex">
            <div className="w-[54px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
              <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Set</p>
            </div>
            {trackingFields.includes('reps') && (
              <div className="w-[80px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
                <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Reps</p>
              </div>
            )}
            {trackingFields.includes('weight') && (
              <div className="w-[120px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Weight</p>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => setWeightUnit('lbs')}
                      className={cn(
                        "text-[9px] px-1 py-0.5 rounded min-w-[18px]",
                        weightUnit === 'lbs' ? "bg-[#292928] text-[#f7f6f2]" : "text-[#979795] hover:bg-[#171716]"
                      )}
                    >
                      lbs
                    </button>
                    <button
                      onClick={() => setWeightUnit('kg')}
                      className={cn(
                        "text-[9px] px-1 py-0.5 rounded min-w-[18px]",
                        weightUnit === 'kg' ? "bg-[#292928] text-[#f7f6f2]" : "text-[#979795] hover:bg-[#171716]"
                      )}
                    >
                      kg
                    </button>
                  </div>
                </div>
              </div>
            )}
            {trackingFields.includes('velocity') && (
              <div className="w-[90px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
                <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Velocity</p>
              </div>
            )}
            {trackingFields.includes('accuracy') && (
              <div className="w-[90px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
                <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Accuracy</p>
              </div>
            )}
            {trackingFields.includes('rpe') && (
              <div className="w-[80px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
                <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">RPE</p>
              </div>
            )}
            {trackingFields.includes('restTime') && (
              <div className="w-[70px] px-4 py-3 flex-shrink-0">
                <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Rest</p>
              </div>
            )}
          </div>

          {/* Table Rows */}
          <div className="flex-1">
            {tableData.map((row, index) => (
              <div key={index} className="flex h-12 border-b border-[#292928]">
                <div className="w-[54px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0">
                  <p className="text-sm font-semibold text-[#979795] font-['Montserrat']">{row.set}</p>
                </div>
                {trackingFields.includes('reps') && (
                  <div className={cn(
                    "w-[80px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0",
                    isCellOverridden(index, 'reps') && "bg-[#16140F]"
                  )}>
                    <input
                      type="number"
                      value={row.reps}
                      onChange={(e) => handleTableInputChange(index, 'reps', parseInt(e.target.value) || 0)}
                      className={cn(
                        "w-full bg-transparent text-sm font-['Montserrat'] border-none outline-none",
                        isCustomValue(index, 'reps', row.reps) ? "text-[#ff8c00]" : "text-[#f7f6f2]"
                      )}
                    />
                  </div>
                )}
                {trackingFields.includes('weight') && (
                  <div className={cn(
                    "w-[120px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0",
                    isCellOverridden(index, 'weight') && "bg-[#16140F]"
                  )}>
                    <input
                      type="number"
                      value={(() => {
                        const lbs = Number(row.weight) || 0;
                        return weightUnit === 'kg' ? lbsToKg(lbs) : lbs;
                      })()}
                      onChange={(e) => {
                        const n = parseFloat(e.target.value);
                        const lbs = isNaN(n) ? 0 : (weightUnit === 'kg' ? kgToLbs(n) : n);
                        handleTableInputChange(index, 'weight', Math.round(lbs * 10) / 10);
                      }}
                      className={cn(
                        "w-full bg-transparent text-sm font-['Montserrat'] border-none outline-none",
                        isCustomValue(index, 'weight', row.weight) ? "text-[#ff8c00]" : "text-[#f7f6f2]"
                      )}
                    />
                  </div>
                )}
                {trackingFields.includes('velocity') && (
                  <div className={cn(
                    "w-[90px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0",
                    isCellOverridden(index, 'velocity') && "bg-[#16140F]"
                  )}>
                    <input
                      type="number"
                      value={(row as any).velocity || ''}
                      onChange={(e) => handleTableInputChange(index, 'velocity', parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent text-sm text-[#f7f6f2] font-['Montserrat'] border-none outline-none"
                      placeholder="mph"
                    />
                  </div>
                )}
                {trackingFields.includes('accuracy') && (
                  <div className={cn(
                    "w-[90px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0",
                    isCellOverridden(index, 'accuracy') && "bg-[#16140F]"
                  )}>
                    <input
                      type="number"
                      value={(row as any).accuracy || ''}
                      onChange={(e) => handleTableInputChange(index, 'accuracy', parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent text-sm text-[#f7f6f2] font-['Montserrat'] border-none outline-none"
                      placeholder="%"
                    />
                  </div>
                )}
                {trackingFields.includes('rpe') && (
                  <div className={cn(
                    "w-[80px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0",
                    isCellOverridden(index, 'rpe') && "bg-[#16140F]"
                  )}>
                    <button
                      onClick={(e) => handleRPEClick(index, undefined, e)}
                      className="w-full flex items-center justify-between bg-transparent text-sm text-[#f7f6f2] font-['Montserrat'] border-none outline-none"
                    >
                      <span className={cn(
                        isCustomValue(index, 'rpe', row.rpe) ? "text-[#ff8c00]" : "text-[#f7f6f2]"
                      )}>{row.rpe || 'Select'}</span>
                      <ChevronDown className="w-4 h-4 text-[#979795]" />
                    </button>
                  </div>
                )}
                {trackingFields.includes('restTime') && (
                  <div className={cn(
                    "w-[70px] px-4 py-3 flex items-center flex-shrink-0",
                    isCellOverridden(index, 'restTime') && "bg-[#16140F]"
                  )}>
                    <button
                      onClick={() => handleRestTimeClick(index)}
                      className="w-full flex items-center justify-between bg-transparent text-sm text-[#f7f6f2] font-['Montserrat'] border-none outline-none"
                    >
                      <span className={cn(
                        isCustomValue(index, 'restTime', row.restTime) ? "text-[#ff8c00]" : "text-[#f7f6f2]"
                      )}>{row.restTime}</span>
                      <ChevronDown className="w-3 h-3 text-[#979795]" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0c] border-t border-[#292928] p-4 flex items-center gap-2 z-40">
        {/* Previous Button - only for completed exercises */}
        {isCurrentExerciseCompleted && (
          <button 
            onClick={handlePreviousExercise}
            className="w-12 h-12 bg-[#292928] rounded-full flex items-center justify-center hover:bg-[#3a3a38] transition-colors shrink-0"
          >
            <ArrowLeft className="w-6 h-6 text-[#f7f6f2]" />
          </button>
        )}
        
        {/* Record and Timer Buttons - only for non-completed exercises */}
        {!isCurrentExerciseCompleted && (
          <>
            <button 
              className="w-12 h-12 bg-[#292928] rounded-full flex items-center justify-center hover:bg-[#3a3a38] transition-colors shrink-0"
            >
              <Video className="w-6 h-6 text-[#f7f6f2]" />
            </button>
            <button 
              className="w-12 h-12 bg-[#292928] rounded-full flex items-center justify-center hover:bg-[#3a3a38] transition-colors shrink-0"
            >
              <Clock className="w-6 h-6 text-[#f7f6f2]" />
            </button>
          </>
        )}
        
        {/* Center Content - Complete & Next button fills remaining width */}
        <div className="flex-1 flex items-center justify-center min-w-0">
          {isCurrentExerciseCompleted ? (
            <span className="text-sm text-[#979795] font-['Montserrat']">Marked as completed</span>
          ) : (
            <button 
              onClick={handleCompleteAndNext}
              className="h-12 bg-[#e5e4e1] rounded-full flex items-center justify-center gap-2 px-5 w-full max-w-full"
            >
              <Check className="w-5 h-5 text-black shrink-0" />
              <span className="text-sm font-semibold text-black font-['Montserrat']">Complete & Next</span>
            </button>
          )}
        </div>
        
        {/* Next Button (for completed exercises) */}
        {isCurrentExerciseCompleted && (
          <button 
            onClick={handleCompleteAndNext}
            className="w-12 h-12 bg-[#e5e4e1] rounded-full flex items-center justify-center hover:bg-[#d5d4d1] transition-colors shrink-0"
          >
            <ArrowRight className="w-6 h-6 text-black" />
          </button>
        )}
      </div>

      {/* X Button - Top Right */}
      <button 
        onClick={() => setLocation("/session-view")}
        className="absolute top-4 right-4 w-10 h-10 bg-[#292928] rounded-full flex items-center justify-center"
      >
        <X className="w-6 h-6 text-[#f7f6f2]" />
      </button>

      {/* RPE Dropdown */}
      <RPEDropdown
        isOpen={showRPEDropdown}
        onClose={() => setShowRPEDropdown(false)}
        onSelect={handleRPESelect}
        currentValue={selectedRPERow !== null ? tableData[selectedRPERow]?.rpe || '' : ''}
        position={rpeDropdownPosition}
      />

      {/* Rest Time Selector */}
      <RestTimeSelector
        isOpen={showRestTimeSelector}
        onClose={() => setShowRestTimeSelector(false)}
        onSelect={handleRestTimeSelect}
        currentValue={selectedRestTimeRow !== null ? tableData[selectedRestTimeRow]?.restTime || '2:00' : '2:00'}
      />

      {/* Exercise Details Bottom Sheet */}
      {showExerciseDetails && currentExercise && (
        <ExerciseDetailsSheet
          exercise={currentExercise}
          onClose={() => setShowExerciseDetails(false)}
        />
      )}
    </div>
  );
}