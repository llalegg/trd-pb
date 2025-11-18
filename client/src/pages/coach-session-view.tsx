import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { ArrowLeft, User, Shield, ExternalLink, Plus, Trash2, Check, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSessionData, type Routine, type Exercise as SessionExercise } from "@/lib/sessionData";
import { useQuery } from "@tanstack/react-query";
import { type Program } from "@shared/schema";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SetResult {
  reps: string;
  weight?: string;
  time?: string;
  rpe?: string;
  notes?: string;
  enteredBy?: "athlete" | "coach";
  enteredAt?: string;
}

interface ExerciseResults {
  [exerciseName: string]: SetResult[];
}

interface ExerciseWithRoutine {
  exercise: SessionExercise;
  routineType: string;
  routineName: string;
  index?: number;
}

export default function CoachSessionView() {
  const [location, setLocation] = useLocation();
  const [exerciseResults, setExerciseResults] = useState<{
    [routineType: string]: ExerciseResults;
  }>({});
  const [selectedExercise, setSelectedExercise] = useState<ExerciseWithRoutine | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showAssignedValues, setShowAssignedValues] = useState(false);

  // Get program ID and day from URL
  const urlParams = new URLSearchParams(window.location.search);
  const programId = urlParams.get('programId');
  const selectedDay = parseInt(urlParams.get('day') || '17', 10);

  // Fetch program data
  const { data: programs } = useQuery<Program[]>({
    queryKey: ["/api/programs"],
    enabled: !!programId,
  });

  const programData = programs?.find(p => p.id === programId);
  const sessionData = getSessionData(selectedDay);

  // Flatten all exercises from all routines into a list
  const allExercises: ExerciseWithRoutine[] = [];
  sessionData.routines.forEach((routine) => {
    routine.exercises.forEach((exercise) => {
      allExercises.push({
        exercise,
        routineType: routine.type,
        routineName: routine.name,
      });
    });
  });

  // Set first exercise as selected by default
  useEffect(() => {
    if (allExercises.length > 0 && !selectedExercise) {
      setSelectedExercise(allExercises[0]);
    }
  }, [selectedDay]);

  // Initialize exercise results with pre-filled assigned data
  useEffect(() => {
    const initialResults: { [routineType: string]: ExerciseResults } = {};
    sessionData.routines.forEach((routine) => {
      initialResults[routine.type] = {};
      routine.exercises.forEach((exercise) => {
        // Pre-fill with assigned data from exercise
        const preFilledSets: SetResult[] = Array.from({ length: exercise.sets }, (_, index) => {
          // Extract numeric reps value if possible (e.g., "8-10" -> "8", "5" -> "5")
          const repsValue = exercise.reps.match(/^\d+/)?.[0] || exercise.reps;
          return {
            reps: repsValue,
            weight: exercise.weight || "",
            rpe: "6", // Default RPE
            time: "",
            notes: "",
            enteredBy: "coach" as const,
          };
        });
        initialResults[routine.type][exercise.name] = preFilledSets;
      });
    });
    setExerciseResults(initialResults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDay]);

  const updateExerciseResult = (
    routineType: string,
    exerciseName: string,
    setIndex: number,
    field: keyof SetResult,
    value: string
  ) => {
    setExerciseResults((prev) => {
      const newResults = { ...prev };
      if (!newResults[routineType]) {
        newResults[routineType] = {};
      }
      if (!newResults[routineType][exerciseName]) {
        newResults[routineType][exerciseName] = [];
      }
      const sets = [...newResults[routineType][exerciseName]];
      if (!sets[setIndex]) {
        sets[setIndex] = { reps: "", enteredBy: "coach" as const };
      }
      sets[setIndex] = { ...sets[setIndex], [field]: value, enteredBy: "coach" as const, enteredAt: new Date().toISOString() };
      newResults[routineType][exerciseName] = sets;
      return newResults;
    });
  };

  const addSet = (routineType: string, exerciseName: string) => {
    setExerciseResults((prev) => {
      const newResults = { ...prev };
      if (!newResults[routineType]) {
        newResults[routineType] = {};
      }
      if (!newResults[routineType][exerciseName]) {
        newResults[routineType][exerciseName] = [];
      }
      const sets = [...newResults[routineType][exerciseName]];
      // Get default values from exercise
      const exercise = allExercises.find(
        e => e.routineType === routineType && e.exercise.name === exerciseName
      );
      const repsValue = exercise?.exercise.reps.match(/^\d+/)?.[0] || exercise?.exercise.reps || "";
      sets.push({
        reps: repsValue,
        weight: exercise?.exercise.weight || "",
        rpe: "6",
        time: "",
        notes: "",
        enteredBy: "coach" as const,
        enteredAt: new Date().toISOString(),
      });
      newResults[routineType][exerciseName] = sets;
      return newResults;
    });
  };

  const deleteSet = (routineType: string, exerciseName: string, setIndex: number) => {
    setExerciseResults((prev) => {
      const newResults = { ...prev };
      if (!newResults[routineType]?.[exerciseName]) return newResults;
      const sets = [...newResults[routineType][exerciseName]];
      sets.splice(setIndex, 1);
      newResults[routineType][exerciseName] = sets;
      return newResults;
    });
  };

  const AUTO_SAVE_DEBOUNCE_MS = 1000;

  // Auto-save on changes
  useEffect(() => {
    // Debounce auto-save
    const timeoutId = setTimeout(() => {
      // TODO: Save to API
    }, AUTO_SAVE_DEBOUNCE_MS);
    
    return () => clearTimeout(timeoutId);
  }, [exerciseResults]);

  const getExerciseResults = (routineType: string, exerciseName: string): SetResult[] => {
    return exerciseResults[routineType]?.[exerciseName] || [];
  };

  const hasAthleteResults = (routineType: string, exerciseName: string): boolean => {
    const results = getExerciseResults(routineType, exerciseName);
    return results.some((r) => r.enteredBy === "athlete");
  };

  // Check if exercise is completed
  const isExerciseCompleted = (routineType: string, exerciseName: string): boolean => {
    const key = `${routineType}-${exerciseName}`;
    return completedExercises.has(key);
  };

  // Toggle exercise completion
  const toggleExerciseCompletion = (routineType: string, exerciseName: string) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      const key = `${routineType}-${exerciseName}`;
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Complete all exercises
  const completeAllExercises = () => {
    const allKeys = allExercises.map(item => `${item.routineType}-${item.exercise.name}`);
    setCompletedExercises(new Set(allKeys));
  };

  // Mock custom results (different from assigned)
  const hasCustomResults = (routineType: string, exerciseName: string): boolean => {
    // Mock: mark some exercises as having custom results
    const mockCustom = [
      "Shoulder activation",
      "Pull-ups",
    ];
    return mockCustom.includes(exerciseName);
  };

  // Group exercises by routine
  const exercisesByRoutine = useMemo(() => {
    const grouped: { [routineType: string]: { routineName: string; exercises: ExerciseWithRoutine[] } } = {};
    allExercises.forEach((item, index) => {
      if (!grouped[item.routineType]) {
        grouped[item.routineType] = {
          routineName: item.routineName,
          exercises: [],
        };
      }
      grouped[item.routineType].exercises.push({ ...item, index });
    });
    return grouped;
  }, [allExercises]);

  const getEnteredBy = (routineType: string, exerciseName: string): "athlete" | "coach" | null => {
    const results = getExerciseResults(routineType, exerciseName);
    if (results.length === 0) return null;
    return results[0].enteredBy || null;
  };

  const formatDate = (date: Date) => {
    return format(date, "MM/dd/yyyy");
  };

  const formatHeaderDate = (day: number) => {
    // Create a date for the selected day
    const date = new Date();
    date.setDate(day);
    return format(date, "EEE, MM/dd/yyyy");
  };

  const rpeOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  // Determine tracking fields based on routine type
  const getTrackingFields = (routineType: string) => {
    switch (routineType) {
      case 'strength':
        return ['reps', 'weight', 'rpe'];
      case 'movement':
        return ['reps', 'rpe'];
      case 'throwing':
        return ['rpe'];
      default:
        return ['reps', 'weight', 'rpe'];
    }
  };

  if (!selectedExercise) {
    return (
      <div className="min-h-screen bg-surface-base flex items-center justify-center">
        <p className="text-[#979795]">Loading...</p>
      </div>
    );
  }

  const trackingFields = getTrackingFields(selectedExercise.routineType);
  const results = getExerciseResults(selectedExercise.routineType, selectedExercise.exercise.name);
  const enteredBy = getEnteredBy(selectedExercise.routineType, selectedExercise.exercise.name);
  
  // Use actual results count or exercise sets, whichever is larger
  const currentSetsCount = Math.max(results.length, selectedExercise.exercise.sets);
  const displayResults = Array.from({ length: currentSetsCount }, (_, index) => 
    results[index] || { reps: "", enteredBy: "coach" as const }
  );

  return (
    <div className="min-h-screen bg-surface-base">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0d0d0c] border-b border-[#292928] px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#f7f6f2] hover:bg-[#171716] h-8 px-2"
              onClick={() => {
                if (programId) {
                  setLocation(`/program-page?id=${programId}`);
                } else {
                  setLocation("/programs");
                }
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-base font-semibold text-[#f7f6f2] font-['Montserrat']">
              {formatHeaderDate(selectedDay)}
            </h1>
            {programData && (
              <div className="flex items-center gap-2 ml-2">
                <div className="w-6 h-6 rounded-full bg-[#292928] flex items-center justify-center overflow-hidden">
                  <User className="h-4 w-4 text-[#979795]" />
                </div>
                <span className="text-sm text-[#f7f6f2] font-['Montserrat']">{programData.athleteName}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Column 1: Exercise List */}
        <div className="w-80 border-r border-[#292928] bg-[#0d0d0c] overflow-y-auto">
            <div className="p-4 border-b border-[#292928]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-[#f7f6f2] font-['Montserrat']">
                    Exercises
                  </h2>
                  <div className="bg-[#292928] rounded-full px-2 py-0.5 text-xs font-medium text-[#f7f6f2] font-['Montserrat']">
                    {allExercises.length}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={completeAllExercises}
                  className="border-[#292928] text-[#f7f6f2] hover:bg-[#171716] h-7 px-2 text-xs font-['Montserrat']"
                >
                  <Check className="h-3 w-3 mr-1.5" />
                  Complete All
                </Button>
              </div>
            </div>
            <div className="space-y-1 p-2">
              {Object.entries(exercisesByRoutine).map(([routineType, group]) => (
                <div key={routineType} className="space-y-1">
                  {/* Routine Sub-section Header */}
                  <div className="px-3 py-2">
                    <p className="text-xs font-medium text-[#979795] font-['Montserrat'] uppercase">
                      {group.routineName}
                    </p>
                  </div>
                  
                  {/* Exercises in this routine */}
                  {group.exercises.map((item, index) => {
                    const hasAthlete = hasAthleteResults(item.routineType, item.exercise.name);
                    const isCompleted = isExerciseCompleted(item.routineType, item.exercise.name);
                    const hasCustom = hasCustomResults(item.routineType, item.exercise.name);
                    const isSelected = selectedExercise?.exercise.name === item.exercise.name && 
                                      selectedExercise?.routineType === item.routineType;
                    const exerciseNumber = index + 1;
                    
                    // Format meta information
                    const metaInfo = item.exercise.weight 
                      ? `${item.exercise.reps} × ${item.exercise.sets} sets @ ${item.exercise.weight}lbs`
                      : `${item.exercise.reps} × ${item.exercise.sets} sets`;
                    
                    return (
                      <button
                        key={`${item.routineType}-${item.exercise.name}-${index}`}
                        onClick={() => setSelectedExercise(item)}
                        className={cn(
                          "group w-full text-left p-3 rounded-lg transition-colors",
                          isSelected 
                            ? "bg-[#171716]" 
                            : "hover:bg-[#171716]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {/* Exercise Number */}
                            <div className="text-xs font-medium text-[#979795] font-['Montserrat'] w-6 flex-shrink-0">
                              {exerciseNumber}.
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium text-[#f7f6f2] font-['Montserrat'] truncate">
                                  {item.exercise.name}
                                </p>
                                {hasCustom && (
                                  <Pencil className="h-3.5 w-3.5 text-[#ff8c00] flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-[#979795] font-['Montserrat']">
                                {metaInfo}
                              </p>
                            </div>
                          </div>
                          
                          {/* Checkmark - clickable and visible on hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExerciseCompletion(item.routineType, item.exercise.name);
                            }}
                            className={cn(
                              "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                              isCompleted 
                                ? "bg-white border-white opacity-100" 
                                : "border-[#979795] opacity-0 group-hover:opacity-100 hover:border-[#f7f6f2]"
                            )}
                          >
                            {isCompleted && (
                              <Check className="h-4 w-4 text-[#0d0d0c]" />
                            )}
                          </button>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

        {/* Column 2: Exercise Details */}
        <div className="flex-1 overflow-y-auto bg-[#0d0d0c]">
            <div className="p-6 space-y-4">
              {/* Exercise Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-[#f7f6f2] font-['Montserrat']">
                      {selectedExercise.exercise.name}
                    </h2>
                    {enteredBy && enteredBy === "athlete" && (
                      <Badge 
                        variant="secondary"
                        icon={<User className="h-3 w-3" />}
                        className="text-xs"
                      >
                        Athlete
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#292928] text-[#f7f6f2] hover:bg-[#171716] font-['Montserrat'] h-7 px-2 text-xs"
                    onClick={() => setLocation("/vault")}
                  >
                    <ExternalLink className="h-3 w-3 mr-1.5" />
                    Exercise Library
                  </Button>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#979795] font-['Montserrat']">
                  <span>{selectedExercise.routineName}</span>
                  <span>•</span>
                  <span>Target: {selectedExercise.exercise.sets} sets × {selectedExercise.exercise.reps}</span>
                  {selectedExercise.exercise.weight && (
                    <>
                      <span>•</span>
                      <span>@ {selectedExercise.exercise.weight}lbs</span>
                    </>
                  )}
                </div>
              </div>

              {/* Toggle Switch */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#979795] font-['Montserrat']">Assigned</span>
                  <Switch
                    checked={!showAssignedValues}
                    onCheckedChange={(checked) => setShowAssignedValues(!checked)}
                    className="data-[state=checked]:bg-[#c4af6c]"
                  />
                  <span className="text-xs text-[#979795] font-['Montserrat']">Actual Results</span>
                </div>
              </div>

              {/* Table - Mobile App Style */}
              <div className="bg-[#0d0d0c] overflow-hidden">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="min-w-[500px]">
                    {/* Table Header */}
                    <div className="bg-[#0d0d0c] flex border-b border-[#292928]">
                      <div className="w-[54px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
                        <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Set</p>
                      </div>
                      {trackingFields.includes('reps') && (
                        <div className="w-[120px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
                          <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Reps</p>
                        </div>
                      )}
                      {trackingFields.includes('weight') && (
                        <div className="w-[140px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
                          <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Weight (lbs)</p>
                        </div>
                      )}
                      {trackingFields.includes('rpe') && (
                        <div className="w-[100px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
                          <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">RPE</p>
                        </div>
                      )}
                      <div className="w-[200px] px-4 py-3 border-r border-[#292928] flex-shrink-0">
                        <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Notes</p>
                      </div>
                      <div className="w-[60px] px-4 py-3 flex-shrink-0">
                        <p className="text-xs text-[#bcbbb7] font-medium font-['Montserrat']">Actions</p>
                      </div>
                    </div>

                    {/* Table Rows */}
                    <div>
                      {displayResults.map((result, setIndex) => {
                        const isAssignedView = showAssignedValues;
                        const assignedReps = selectedExercise.exercise.reps;
                        const assignedWeight = selectedExercise.exercise.weight || "";
                        
                        return (
                          <div key={setIndex} className="flex h-12 border-b border-[#292928]">
                            <div className="w-[54px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0">
                              <p className="text-sm font-semibold text-[#979795] font-['Montserrat']">
                                {setIndex + 1}
                              </p>
                            </div>
                            {trackingFields.includes('reps') && (
                              <div className="w-[120px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0">
                                {isAssignedView ? (
                                  <p className="text-sm text-[#979795] font-['Montserrat']">
                                    {assignedReps}
                                  </p>
                                ) : (
                                  <input
                                    type="text"
                                    value={result.reps || ""}
                                    onChange={(e) => updateExerciseResult(selectedExercise.routineType, selectedExercise.exercise.name, setIndex, "reps", e.target.value)}
                                    className="w-full bg-transparent text-sm text-[#f7f6f2] font-['Montserrat'] border-none outline-none"
                                    placeholder={selectedExercise.exercise.reps}
                                  />
                                )}
                              </div>
                            )}
                            {trackingFields.includes('weight') && (
                              <div className="w-[140px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0">
                                {isAssignedView ? (
                                  <p className="text-sm text-[#979795] font-['Montserrat']">
                                    {assignedWeight || "N/A"}
                                  </p>
                                ) : (
                                  <input
                                    type="text"
                                    value={result.weight || ""}
                                    onChange={(e) => updateExerciseResult(selectedExercise.routineType, selectedExercise.exercise.name, setIndex, "weight", e.target.value)}
                                    className="w-full bg-transparent text-sm text-[#f7f6f2] font-['Montserrat'] border-none outline-none"
                                    placeholder={selectedExercise.exercise.weight || "N/A"}
                                  />
                                )}
                              </div>
                            )}
                            {trackingFields.includes('rpe') && (
                              <div className="w-[100px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0">
                                {isAssignedView ? (
                                  <p className="text-sm text-[#979795] font-['Montserrat']">-</p>
                                ) : (
                                  <Select
                                    value={result.rpe || ""}
                                    onValueChange={(value) => {
                                      updateExerciseResult(selectedExercise.routineType, selectedExercise.exercise.name, setIndex, "rpe", value);
                                    }}
                                  >
                                    <SelectTrigger className="w-full bg-transparent border-none h-auto p-0 text-sm text-[#f7f6f2] font-['Montserrat'] hover:bg-transparent focus:ring-0">
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#121210] border-[#292928]">
                                      {rpeOptions.map((rpe) => (
                                        <SelectItem 
                                          key={rpe} 
                                          value={rpe.toString()}
                                          className="text-[#f7f6f2] hover:bg-[#171716] focus:bg-[#171716]"
                                        >
                                          {rpe}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}
                              </div>
                            )}
                            <div className="w-[200px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0">
                              {isAssignedView ? (
                                <p className="text-sm text-[#979795] font-['Montserrat']">-</p>
                              ) : (
                                <input
                                  type="text"
                                  value={result.notes || ""}
                                  onChange={(e) => updateExerciseResult(selectedExercise.routineType, selectedExercise.exercise.name, setIndex, "notes", e.target.value)}
                                  className="w-full bg-transparent text-sm text-[#f7f6f2] font-['Montserrat'] border-none outline-none"
                                  placeholder="Notes..."
                                />
                              )}
                            </div>
                            <div className="w-[60px] px-4 py-3 flex items-center justify-center flex-shrink-0">
                              {!isAssignedView && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteSet(selectedExercise.routineType, selectedExercise.exercise.name, setIndex)}
                                  className="h-8 w-8 p-0 text-[#979795] hover:text-[#f7f6f2] hover:bg-[#171716]"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Add Set Row - Plus icon in last empty row */}
                      {!showAssignedValues && (
                        <div className="flex h-12 border-b border-[#292928]">
                          <div className="w-[54px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0">
                            <p className="text-sm font-semibold text-[#979795] font-['Montserrat']">
                              {displayResults.length + 1}
                            </p>
                          </div>
                          {trackingFields.includes('reps') && (
                            <div className="w-[120px] px-4 py-3 border-r border-[#292928] flex items-center flex-shrink-0">
                              <button
                                onClick={() => addSet(selectedExercise.routineType, selectedExercise.exercise.name)}
                                className="w-full flex items-center justify-center text-[#979795] hover:text-[#f7f6f2]"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          {trackingFields.includes('weight') && (
                            <div className="w-[140px] px-4 py-3 border-r border-[#292928] flex-shrink-0" />
                          )}
                          {trackingFields.includes('rpe') && (
                            <div className="w-[100px] px-4 py-3 border-r border-[#292928] flex-shrink-0" />
                          )}
                          <div className="w-[200px] px-4 py-3 border-r border-[#292928] flex-shrink-0" />
                          <div className="w-[60px] px-4 py-3 flex-shrink-0" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
