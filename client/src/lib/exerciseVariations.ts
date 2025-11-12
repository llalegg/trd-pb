export interface ExerciseVariation {
  name: string;
  equipment: string[];
}

const EXERCISE_VARIATIONS_MAP: Record<string, ExerciseVariation[]> = {
  "dynamic warm-up throws": [
    { name: "Dynamic warm-up throws", equipment: ["Baseball", "Glove"] },
    { name: "Standing warm-up throws", equipment: ["Baseball", "Glove"] },
    { name: "Kneeling warm-up throws", equipment: ["Baseball", "Glove", "Knee Pad"] },
    { name: "Long toss warm-up", equipment: ["Baseball", "Glove", "Pitching Target"] },
  ],
  "romanian deadlifts": [
    { name: "Romanian deadlifts", equipment: ["Barbell", "Weight Plates"] },
    { name: "Romanian deadlifts (Dumbbells)", equipment: ["Dumbbells"] },
    { name: "Single-leg Romanian deadlifts", equipment: ["Dumbbell"] },
    { name: "Romanian deadlifts (Kettlebell)", equipment: ["Kettlebell"] },
  ],
  "hip mobility circuit": [
    { name: "Hip mobility circuit", equipment: ["Resistance Bands", "Foam Roller"] },
    { name: "Hip mobility circuit (Advanced)", equipment: ["Resistance Bands", "Foam Roller", "Yoga Mat"] },
    { name: "Hip mobility circuit (Minimal)", equipment: ["Yoga Mat"] },
  ],
  "shoulder activation": [
    { name: "Shoulder activation", equipment: ["Resistance Bands"] },
    { name: "Shoulder activation (Dumbbells)", equipment: ["Dumbbells"] },
    { name: "Shoulder activation (Cables)", equipment: ["Cable Machine"] },
    { name: "Shoulder activation (Bodyweight)", equipment: [] },
  ],
  "core stability work": [
    { name: "Core stability work", equipment: ["Yoga Mat"] },
    { name: "Core stability work (Advanced)", equipment: ["Yoga Mat", "Stability Ball"] },
    { name: "Core stability work (Weighted)", equipment: ["Yoga Mat", "Medicine Ball"] },
    { name: "Core stability work (Minimal)", equipment: [] },
  ],
  "movement patterns": [
    { name: "Movement patterns", equipment: ["Resistance Bands"] },
    { name: "Movement patterns (Weighted)", equipment: ["Dumbbells"] },
    { name: "Movement patterns (Bodyweight)", equipment: [] },
  ],
  "push-ups": [
    { name: "Push-ups", equipment: [] },
    { name: "Push-ups (Incline)", equipment: ["Bench"] },
    { name: "Push-ups (Decline)", equipment: ["Bench"] },
    { name: "Push-ups (Weighted)", equipment: ["Weight Plate"] },
    { name: "Push-ups (Diamond)", equipment: [] },
  ],
  "pull-ups": [
    { name: "Pull-ups", equipment: ["Pull-up Bar"] },
    { name: "Pull-ups (Assisted)", equipment: ["Pull-up Bar", "Resistance Band"] },
    { name: "Pull-ups (Weighted)", equipment: ["Pull-up Bar", "Weight Belt"] },
    { name: "Chin-ups", equipment: ["Pull-up Bar"] },
  ],
  "bench press": [
    { name: "Bench press", equipment: ["Barbell", "Bench", "Weight Plates"] },
    { name: "Bench press (Dumbbells)", equipment: ["Dumbbells", "Bench"] },
    { name: "Bench press (Incline)", equipment: ["Barbell", "Incline Bench", "Weight Plates"] },
    { name: "Bench press (Decline)", equipment: ["Barbell", "Decline Bench", "Weight Plates"] },
  ],
  "squats": [
    { name: "Squats", equipment: ["Barbell", "Weight Plates", "Squat Rack"] },
    { name: "Squats (Dumbbells)", equipment: ["Dumbbells"] },
    { name: "Squats (Goblet)", equipment: ["Kettlebell"] },
    { name: "Squats (Bodyweight)", equipment: [] },
  ],
  "mechanics drill - balance point": [
    { name: "Mechanics Drill - Balance Point", equipment: ["Baseball"] },
    { name: "Mechanics Drill - Balance Point (Weighted)", equipment: ["Baseball", "Weighted Ball"] },
    { name: "Mechanics Drill - Balance Point (Mirror)", equipment: ["Baseball", "Mirror"] },
  ],
  "long toss": [
    { name: "Long toss", equipment: ["Baseball", "Glove"] },
    { name: "Long toss (Progressive)", equipment: ["Baseball", "Glove", "Pitching Target"] },
    { name: "Long toss (Flat Ground)", equipment: ["Baseball", "Glove"] },
  ],
};

export const getExerciseVariations = (exerciseName: string, routineType: string, fallbackEquipment: string[] = []): ExerciseVariation[] => {
  const key = exerciseName.toLowerCase();
  const variations = EXERCISE_VARIATIONS_MAP[key];
  
  if (variations && variations.length > 0) {
    return variations;
  }
  
  // Fallback: return exercise with default equipment
  return [{ name: exerciseName, equipment: fallbackEquipment }];
};

export const getVariationCount = (exerciseName: string, routineType: string): number => {
  const variations = getExerciseVariations(exerciseName, routineType);
  return variations.length > 1 ? variations.length : 0;
};

