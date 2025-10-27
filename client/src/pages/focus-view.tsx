import React, { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ChevronRight, Play, Clock, Video, Check, X, ChevronLeft, ChevronDown } from "lucide-react";
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

// RPE options with descriptions
const rpeOptions = [
  { value: "6", description: "No exertion at all" },
  { value: "7", description: "Extremely light" },
  { value: "8", description: "Very light" },
  { value: "9", description: "Light" },
  { value: "10", description: "Fairly light" },
  { value: "11", description: "Moderate" },
  { value: "12", description: "Somewhat hard" },
  { value: "13", description: "Hard" },
  { value: "14", description: "Very hard" },
  { value: "15", description: "Extremely hard" },
  { value: "16", description: "Very, very hard" },
  { value: "17", description: "Maximal exertion" },
  { value: "18", description: "Supramaximal" },
  { value: "19", description: "Supramaximal" },
  { value: "20", description: "Maximal exertion" }
];

// RPE Bottom Sheet Component
function RPEBottomSheet({ isOpen, onClose, onSelect, currentValue }: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  currentValue: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
      <div className="bg-[#121210] w-full rounded-t-xl max-h-[70vh] overflow-y-auto">
        <div className="p-4 border-b border-[#292928]">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#f7f6f2]">Select RPE</h3>
            <button onClick={onClose}>
              <X className="w-6 h-6 text-[#979795]" />
            </button>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {rpeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                onClose();
              }}
              className={cn(
                "w-full p-3 rounded-lg text-left transition-colors",
                currentValue === option.value 
                  ? "bg-[#292928] text-[#f7f6f2]" 
                  : "hover:bg-[#171716] text-[#979795]"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{option.value}</span>
                <span className="text-sm">{option.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FocusView() {
  const [, setLocation] = useLocation();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseStates, setExerciseStates] = useState<{ [key: number]: 'not-started' | 'active' | 'completed' }>({});
  const [showIntroScreen, setShowIntroScreen] = useState(false);
  const [showRPESheet, setShowRPESheet] = useState(false);
  const [selectedRPERow, setSelectedRPERow] = useState<number | null>(null);
  const [showExerciseDetails, setShowExerciseDetails] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [completedRoutineType, setCompletedRoutineType] = useState<string>('');
  
  // Superset-specific state
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number | null>(null);
  
  // Check if this is superset mode from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const isSuperset = urlParams.get('superset') === 'true';
  const supersetType = urlParams.get('supersetType') || 'movement';
  
  // Table data state - initialize with assigned values, RPE empty, add rest time
  const [tableData, setTableData] = useState([
    { set: 1, reps: 110, weight: 110, rpe: "", restTime: "2:00" },
    { set: 2, reps: 110, weight: 110, rpe: "", restTime: "2:00" },
    { set: 3, reps: 110, weight: 110, rpe: "", restTime: "2:00" },
    { set: 4, reps: 110, weight: 110, rpe: "", restTime: "2:00" },
  ]);

  // Track which cells have been overridden by user input
  const [overriddenCells, setOverriddenCells] = useState<{ [key: string]: boolean }>({});

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
        name: "Strength Superset",
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
        
        setTableData([
          { set: 1, reps: 110, weight: 110, rpe: "", restTime: "2:00" },
          { set: 2, reps: 110, weight: 110, rpe: "", restTime: "2:00" },
          { set: 3, reps: 110, weight: 110, rpe: "", restTime: "2:00" },
          { set: 4, reps: 110, weight: 110, rpe: "", restTime: "2:00" },
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
      setTableData([
        { set: 1, reps: 110, weight: 110, rpe: "", restTime: "2:00" },
        { set: 2, reps: 110, weight: 110, rpe: "", restTime: "2:00" },
        { set: 3, reps: 110, weight: 110, rpe: "", restTime: "2:00" },
        { set: 4, reps: 110, weight: 110, rpe: "", restTime: "2:00" },
      ]);
    } else {
      // All exercises completed, go back to session view
      setLocation("/session-view");
    }
  };

  const handleBackToSession = () => {
    setLocation("/session-view");
  };

  const handleTableInputChange = (rowIndex: number, field: string, value: string | number) => {
    setTableData(prev => prev.map((row, index) => 
      index === rowIndex ? { ...row, [field]: value } : row
    ));
    
    // Mark this cell as overridden (except for RPE which starts empty)
    const cellKey = `${rowIndex}-${field}`;
    if (field !== 'rpe' || value !== '') {
      setOverriddenCells(prev => ({ ...prev, [cellKey]: true }));
    }
  };

  const handleRPEClick = (rowIndex: number) => {
    setSelectedRPERow(rowIndex);
    setShowRPESheet(true);
  };

  const handleRPESelect = (value: string) => {
    if (selectedRPERow !== null) {
      handleTableInputChange(selectedRPERow, 'rpe', value);
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

  const trackingFields = isSuperset 
    ? getTrackingFields(supersetType) 
    : getTrackingFields(currentExercise?.routineType || 'strength');

  // Helper function to check if a cell is overridden
  const isCellOverridden = (rowIndex: number, field: string) => {
    const cellKey = `${rowIndex}-${field}`;
    return overriddenCells[cellKey] || false;
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
      <div className="bg-[#0d0d0c] min-h-screen w-full flex flex-col">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-center h-12 px-4 shrink-0">
          <button 
            onClick={() => setLocation("/session-view")}
            className="flex items-center justify-center w-12 h-12 shrink-0 rounded-full hover:bg-muted/50 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-[#f7f6f2]" />
          </button>
          <div className="flex-1" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          <div className="px-4 py-2 space-y-6">
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
                <div className="space-y-1">
                  <p className="text-sm text-[#979795]">Routine Type</p>
                  <p className="text-lg font-semibold text-[#f7f6f2] capitalize">{currentExercise.routineType}</p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-3">
              <h2 className="text-base font-semibold text-[#f7f6f2]">Description</h2>
              <p className="text-sm text-[#979795] leading-relaxed">
                {currentExercise.description}
              </p>
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
          <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a]">
            <div className="w-full h-full flex items-center justify-center relative">
              {/* Exercise Name Label - Top Left */}
              <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg px-3 py-2">
                <p className="text-sm font-semibold text-white font-['Montserrat']">
                  {supersetData.exercises[currentVideoIndex]?.name}
                </p>
              </div>
              
              {/* Duration Badge */}
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 rounded px-2 py-1">
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
                      <div className="w-[100px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
                        <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Weight (lbs)</p>
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
                              className="w-full bg-transparent text-sm text-[#f7f6f2] font-['Montserrat'] border-none outline-none"
                            />
                          </div>
                        )}
                        {trackingFields.includes('weight') && (
                          <div className={cn(
                            "w-[100px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0",
                            isCellOverridden(setIndex, `${exerciseIndex}-weight`) && "bg-[#16140F]"
                          )}>
                            <input
                              type="text"
                              defaultValue={exercise.weight}
                              onChange={(e) => handleTableInputChange(setIndex, `${exerciseIndex}-weight`, e.target.value)}
                              className="w-full bg-transparent text-sm text-[#f7f6f2] font-['Montserrat'] border-none outline-none"
                            />
                          </div>
                        )}
                        {trackingFields.includes('rpe') && (
                          <div className={cn(
                            "w-[80px] px-4 py-3 flex items-center flex-shrink-0",
                            isCellOverridden(setIndex, `${exerciseIndex}-rpe`) && "bg-[#16140F]"
                          )}>
                            <button
                              onClick={() => handleRPEClick(setIndex)}
                              className="w-full flex items-center justify-between bg-transparent text-sm text-[#f7f6f2] font-['Montserrat'] border-none outline-none"
                            >
                              <span>9</span>
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
        <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0c] border-t border-[#292928] p-4 flex gap-3 z-40">
          {/* Clock Button - Disabled */}
          <button 
            disabled
            className="w-12 h-12 bg-[#292928] rounded-full flex items-center justify-center opacity-50"
          >
            <Clock className="w-6 h-6 text-[#f7f6f2]" />
          </button>
          
          {/* Video Button - Disabled */}
          <button 
            disabled
            className="w-12 h-12 bg-[#292928] rounded-full flex items-center justify-center opacity-50"
          >
            <Video className="w-6 h-6 text-[#f7f6f2]" />
          </button>
          
          {/* Complete & Next Button */}
          <button 
            onClick={handleCompleteAndNext}
            className="flex-1 h-12 bg-[#e5e4e1] rounded-full flex items-center justify-center gap-2 px-5"
          >
            <Check className="w-5 h-5 text-black" />
            <span className="text-sm font-semibold text-black font-['Montserrat']">Complete & Next</span>
          </button>
        </div>

        {/* X Button - Top Right */}
        <button 
          onClick={() => setLocation("/session-view")}
          className="fixed top-4 right-4 w-10 h-10 bg-[#292928] rounded-full flex items-center justify-center z-50 shadow-lg"
        >
          <X className="w-6 h-6 text-[#f7f6f2]" />
        </button>

        {/* RPE Bottom Sheet */}
        <RPEBottomSheet
          isOpen={showRPESheet}
          onClose={() => setShowRPESheet(false)}
          onSelect={handleRPESelect}
          currentValue={selectedRPERow !== null ? tableData[selectedRPERow]?.rpe || '' : ''}
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#2a2a2a] via-[#1a1a1a] to-[#0a0a0a]">
          {/* Thumbnail Content */}
          <div className="w-full h-full flex items-center justify-center relative">
            {/* Duration Badge */}
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 rounded px-2 py-1">
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
              <div className="w-[100px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
                <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Weight (lbs)</p>
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
              <div className="w-[90px] px-4 py-3 flex-shrink-0">
                <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Rest Time</p>
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
                      className="w-full bg-transparent text-sm text-[#f7f6f2] font-['Montserrat'] border-none outline-none"
                    />
                  </div>
                )}
                {trackingFields.includes('weight') && (
                  <div className={cn(
                    "w-[100px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0",
                    isCellOverridden(index, 'weight') && "bg-[#16140F]"
                  )}>
                    <input
                      type="number"
                      value={row.weight}
                      onChange={(e) => handleTableInputChange(index, 'weight', parseInt(e.target.value) || 0)}
                      className="w-full bg-transparent text-sm text-[#f7f6f2] font-['Montserrat'] border-none outline-none"
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
                      onClick={() => handleRPEClick(index)}
                      className="w-full flex items-center justify-between bg-transparent text-sm text-[#f7f6f2] font-['Montserrat'] border-none outline-none"
                    >
                      <span>{row.rpe || 'Select'}</span>
                      <ChevronDown className="w-4 h-4 text-[#979795]" />
                    </button>
                  </div>
                )}
                {trackingFields.includes('restTime') && (
                  <div className={cn(
                    "w-[90px] px-4 py-3 flex items-center flex-shrink-0",
                    isCellOverridden(index, 'restTime') && "bg-[#16140F]"
                  )}>
                    <input
                      type="text"
                      value={row.restTime}
                      onChange={(e) => handleTableInputChange(index, 'restTime', e.target.value)}
                      className="w-full bg-transparent text-sm text-[#f7f6f2] font-['Montserrat'] border-none outline-none"
                      placeholder="2:00"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d0c] border-t border-[#292928] p-4 flex gap-3 z-40">
        {/* Clock Button - Disabled */}
        <button 
          disabled
          className="w-12 h-12 bg-[#292928] rounded-full flex items-center justify-center opacity-50"
        >
          <Clock className="w-6 h-6 text-[#f7f6f2]" />
        </button>
        
        {/* Video Button - Disabled */}
        <button 
          disabled
          className="w-12 h-12 bg-[#292928] rounded-full flex items-center justify-center opacity-50"
        >
          <Video className="w-6 h-6 text-[#f7f6f2]" />
        </button>
        
        {/* Complete & Next Button */}
        <button 
          onClick={handleCompleteAndNext}
          className="flex-1 h-12 bg-[#e5e4e1] rounded-full flex items-center justify-center gap-2 px-5"
        >
          <Check className="w-5 h-5 text-black" />
          <span className="text-sm font-semibold text-black font-['Montserrat']">Complete & Next</span>
        </button>
      </div>

      {/* X Button - Top Right */}
      <button 
        onClick={() => setLocation("/session-view")}
        className="absolute top-4 right-4 w-10 h-10 bg-[#292928] rounded-full flex items-center justify-center"
      >
        <X className="w-6 h-6 text-[#f7f6f2]" />
      </button>

      {/* RPE Bottom Sheet */}
      <RPEBottomSheet
        isOpen={showRPESheet}
        onClose={() => setShowRPESheet(false)}
        onSelect={handleRPESelect}
        currentValue={selectedRPERow !== null ? tableData[selectedRPERow]?.rpe || '' : ''}
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