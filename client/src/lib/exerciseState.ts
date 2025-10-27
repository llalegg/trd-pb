// Simple state management for exercise completion
// This will persist exercise completion across components

interface ExerciseCompletion {
  exerciseId: string; // combination of routine type + exercise name
  completedSets: number;
  progress: number;
  completedAt?: string;
}

class ExerciseStateManager {
  private completions: Map<string, ExerciseCompletion> = new Map();
  private listeners: Set<() => void> = new Set();

  // Generate unique ID for exercise
  private getExerciseId(routineType: string, exerciseName: string): string {
    return `${routineType}-${exerciseName}`;
  }

  // Mark exercise as completed
  markExerciseCompleted(routineType: string, exerciseName: string, sets: number) {
    const exerciseId = this.getExerciseId(routineType, exerciseName);
    this.completions.set(exerciseId, {
      exerciseId,
      completedSets: sets,
      progress: 100,
      completedAt: new Date().toISOString()
    });
    this.notifyListeners();
  }

  // Get completion status for exercise
  getExerciseCompletion(routineType: string, exerciseName: string): ExerciseCompletion | null {
    const exerciseId = this.getExerciseId(routineType, exerciseName);
    return this.completions.get(exerciseId) || null;
  }

  // Check if exercise is completed
  isExerciseCompleted(routineType: string, exerciseName: string): boolean {
    const completion = this.getExerciseCompletion(routineType, exerciseName);
    return completion !== null && completion.progress === 100;
  }

  // Subscribe to changes
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Clear all completions (for testing/reset)
  clearAll() {
    this.completions.clear();
    this.notifyListeners();
  }
}

// Export singleton instance
export const exerciseStateManager = new ExerciseStateManager();
