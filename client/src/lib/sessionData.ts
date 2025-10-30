// Shared session data structure for home and session views

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  progress: number;
  completedSets: number;
}

export interface Routine {
  type: string;
  name: string;
  exerciseCount: number;
  estimatedTime: string;
  status: "not-started" | "in-progress" | "completed";
  description: string;
  exercises: Exercise[];
  // Movement specific
  routineType?: "Corrective A" | "Corrective E" | "Mobility & Activation";
  // S&C specific
  bodyFocus?: "Upper Body" | "Lower Body" | "Total Body";
  liftingTime?: string;
  conditioningType?: string;
  conditioningTime?: string;
  // Throwing specific
  seriesType?: "Player Series A" | "Catch & Play" | "Play Session";
  intensity?: "High Intensity" | "Medium Intensity" | "Rest";
  isRestDay?: boolean;
}

export interface SessionData {
  date: string;
  dayOfWeek: string;
  sessionName: string;
  totalDuration: string;
  routines: Routine[];
}

// Enhanced exercises with different routines for different days
export const getExercisesForDay = (day: number): Routine[] => {
  switch (day) {
    case 15: // Monday (completed day)
      return [
        {
          type: "movement",
          name: "Movement",
          exerciseCount: 4,
          estimatedTime: "30m",
          status: "completed",
          description: "Dynamic warm-up and mobility work",
          routineType: "Corrective A",
          exercises: [
            { name: "Hip mobility circuit", sets: 2, reps: "60s ea.", progress: 100, completedSets: 2 },
            { name: "Shoulder activation", sets: 3, reps: "12", progress: 100, completedSets: 3 },
            { name: "Core stability work", sets: 3, reps: "45s", progress: 100, completedSets: 3 },
            { name: "Movement patterns", sets: 2, reps: "10", progress: 100, completedSets: 2 }
          ]
        },
        {
          type: "strength",
          name: "S&C",
          exerciseCount: 5,
          estimatedTime: "45m",
          status: "completed",
          description: "Upper body strength & conditioning training",
          bodyFocus: "Upper Body",
          liftingTime: "45m",
          conditioningType: "Bike",
          conditioningTime: "15m",
          exercises: [
            { name: "Bench press", sets: 5, reps: "5", weight: "185", progress: 100, completedSets: 5 },
            { name: "Pull-ups", sets: 4, reps: "8-10", progress: 100, completedSets: 4 },
            { name: "Shoulder press", sets: 3, reps: "8", weight: "95", progress: 100, completedSets: 3 },
            { name: "Rows", sets: 4, reps: "10", weight: "65", progress: 100, completedSets: 4 },
            { name: "Bike conditioning", sets: 1, reps: "15 min", progress: 100, completedSets: 1 }
          ]
        },
        {
          type: "throwing",
          name: "Throwing",
          exerciseCount: 6,
          estimatedTime: "25m",
          status: "completed",
          description: "Throwing mechanics and arm care",
          seriesType: "Catch & Play",
          intensity: "Medium Intensity",
          exercises: [
            { name: "Arm care routine", sets: 2, reps: "12", progress: 100, completedSets: 2 },
            { name: "Long toss progression", sets: 4, reps: "8-10", progress: 100, completedSets: 4 },
            { name: "Bullpen session", sets: 3, reps: "15", progress: 100, completedSets: 3 },
            { name: "Velocity work", sets: 2, reps: "5", progress: 100, completedSets: 2 },
            { name: "Mechanical drills", sets: 3, reps: "8-12", progress: 100, completedSets: 3 },
            { name: "Cool down throws", sets: 2, reps: "10-12", progress: 100, completedSets: 2 }
          ]
        }
      ];
    case 16: // Tuesday (partially completed session)
      return [
        {
          type: "movement",
          name: "Movement",
          exerciseCount: 4,
          estimatedTime: "30m",
          status: "in-progress",
          description: "Dynamic warm-up and mobility work",
          routineType: "Corrective A",
          exercises: [
            { name: "Hip mobility circuit", sets: 2, reps: "60s ea.", progress: 100, completedSets: 2 },
            { name: "Shoulder activation", sets: 3, reps: "12", progress: 100, completedSets: 3 },
            { name: "Core stability work", sets: 3, reps: "45s", progress: 0, completedSets: 0 },
            { name: "Movement patterns", sets: 2, reps: "10", progress: 0, completedSets: 0 }
          ]
        },
        {
          type: "strength",
          name: "S&C",
          exerciseCount: 5,
          estimatedTime: "45m",
          status: "not-started",
          description: "Upper body strength & conditioning training",
          bodyFocus: "Upper Body",
          liftingTime: "45m",
          conditioningType: "Bike",
          conditioningTime: "15m",
          exercises: [
            { name: "Bench press", sets: 5, reps: "5", weight: "185", progress: 100, completedSets: 5 },
            { name: "Pull-ups", sets: 4, reps: "8-10", progress: 100, completedSets: 4 },
            { name: "Shoulder press", sets: 3, reps: "8", weight: "95", progress: 67, completedSets: 2 },
            { name: "Rows", sets: 4, reps: "10", weight: "65", progress: 0, completedSets: 0 },
            { name: "Bike conditioning", sets: 1, reps: "15 min", progress: 0, completedSets: 0 }
          ]
        },
        {
          type: "throwing",
          name: "Throwing",
          exerciseCount: 6,
          estimatedTime: "45m",
          status: "not-started",
          description: "Focus on mechanics and velocity development",
          seriesType: "Player Series A",
          intensity: "High Intensity",
          exercises: [
            { name: "Dynamic warm-up throws", sets: 2, reps: "10-15", progress: 0, completedSets: 0 },
            { name: "Long toss progression", sets: 3, reps: "8-10", progress: 0, completedSets: 0 },
            { name: "Bullpen session", sets: 4, reps: "5-6", progress: 0, completedSets: 0 },
            { name: "Velocity tracking", sets: 3, reps: "6", progress: 0, completedSets: 0 },
            { name: "Mechanical drills", sets: 3, reps: "8-12", progress: 0, completedSets: 0 },
            { name: "Cool down throws", sets: 2, reps: "10-12", progress: 0, completedSets: 0 }
          ]
        }
      ];
    case 17: // Tuesday (current day)
      return [
        {
          type: "movement",
          name: "Movement",
          exerciseCount: 6,
          estimatedTime: "30m",
          status: "not-started",
          description: "Dynamic warm-up and mobility work",
          routineType: "Mobility & Activation",
          exercises: [
            { name: "Hip mobility circuit", sets: 2, reps: "60s ea.", progress: 0, completedSets: 0 },
            { name: "Shoulder activation", sets: 3, reps: "12", progress: 0, completedSets: 0 },
            { name: "Core stability work", sets: 3, reps: "45s", progress: 0, completedSets: 0 },
            { name: "Movement patterns", sets: 2, reps: "10", progress: 0, completedSets: 0 },
            { name: "Balance training", sets: 3, reps: "30s", progress: 0, completedSets: 0 },
            { name: "Coordination drills", sets: 2, reps: "8-12", progress: 0, completedSets: 0 }
          ]
        },
        {
          type: "strength",
          name: "S&C",
          exerciseCount: 4,
          estimatedTime: "45m",
          status: "not-started",
          description: "Progressive strength & conditioning training",
          bodyFocus: "Lower Body",
          liftingTime: "45m",
          exercises: [
            { name: "Squats", sets: 5, reps: "5", weight: "225", progress: 0, completedSets: 0 },
            { name: "Romanian deadlifts", sets: 4, reps: "8-10", progress: 0, completedSets: 0 },
            { name: "Bulgarian split squats", sets: 3, reps: "8", weight: "95", progress: 0, completedSets: 0 },
            { name: "Calf raises", sets: 4, reps: "15", weight: "65", progress: 0, completedSets: 0 }
          ]
        },
        {
          type: "throwing",
          name: "Throwing",
          exerciseCount: 6,
          estimatedTime: "45m",
          status: "not-started",
          description: "Focus on mechanics and velocity development",
          seriesType: "Catch & Play",
          intensity: "Medium Intensity",
          exercises: [
            { name: "Dynamic warm-up throws", sets: 2, reps: "10-15", progress: 0, completedSets: 0 },
            { name: "Long toss progression", sets: 3, reps: "8-10", progress: 0, completedSets: 0 },
            { name: "Bullpen session", sets: 4, reps: "5-6", progress: 0, completedSets: 0 },
            { name: "Velocity tracking", sets: 3, reps: "6", progress: 0, completedSets: 0 },
            { name: "Mechanical drills", sets: 3, reps: "8-12", progress: 0, completedSets: 0 },
            { name: "Cool down throws", sets: 2, reps: "10-12", progress: 0, completedSets: 0 }
          ]
        }
      ];
    case 18: // Wednesday (rest day)
      return [];
    case 19: // Thursday
      return [
        {
          type: "movement",
          name: "Movement",
          exerciseCount: 3,
          estimatedTime: "20m",
          status: "not-started",
          description: "Light movement and recovery",
          routineType: "Corrective E",
          exercises: [
            { name: "Gentle mobility", sets: 2, reps: "45s ea.", progress: 0, completedSets: 0 },
            { name: "Recovery stretches", sets: 2, reps: "60s", progress: 0, completedSets: 0 },
            { name: "Breathing exercises", sets: 1, reps: "5 min", progress: 0, completedSets: 0 }
          ]
        },
        {
          type: "strength",
          name: "S&C",
          exerciseCount: 3,
          estimatedTime: "30m",
          status: "not-started",
          description: "Total body strength & conditioning training",
          bodyFocus: "Total Body",
          liftingTime: "30m",
          conditioningType: "Running",
          conditioningTime: "20m",
          exercises: [
            { name: "Push-ups", sets: 3, reps: "12", progress: 0, completedSets: 0 },
            { name: "Bodyweight squats", sets: 3, reps: "15", progress: 0, completedSets: 0 },
            { name: "Running conditioning", sets: 1, reps: "20 min", progress: 0, completedSets: 0 }
          ]
        },
        {
          type: "throwing",
          name: "Throwing",
          exerciseCount: 0,
          estimatedTime: "0m",
          status: "completed",
          description: "Rest day - no throwing",
          seriesType: "REST",
          intensity: "Rest",
          isRestDay: true,
          exercises: []
        }
      ];
    case 20: // Friday
      return [
        {
          type: "movement",
          name: "Movement",
          exerciseCount: 4,
          estimatedTime: "25m",
          status: "not-started",
          description: "Pre-workout mobility and activation",
          routineType: "Mobility & Activation",
          exercises: [
            { name: "Dynamic warm-up", sets: 2, reps: "60s ea.", progress: 0, completedSets: 0 },
            { name: "Joint mobility", sets: 3, reps: "10", progress: 0, completedSets: 0 },
            { name: "Activation drills", sets: 3, reps: "8", progress: 0, completedSets: 0 },
            { name: "Movement prep", sets: 2, reps: "12", progress: 0, completedSets: 0 }
          ]
        },
        {
          type: "strength",
          name: "Strength & Conditioning",
          exerciseCount: 5,
          estimatedTime: "40m",
          status: "not-started",
          description: "Full body strength & conditioning training",
          bodyFocus: "Total Body",
          liftingTime: "40m",
          exercises: [
            { name: "Squats", sets: 4, reps: "8", weight: "225", progress: 0, completedSets: 0 },
            { name: "Deadlifts", sets: 3, reps: "5", weight: "275", progress: 0, completedSets: 0 },
            { name: "Overhead press", sets: 3, reps: "8", weight: "95", progress: 0, completedSets: 0 },
            { name: "Pull-ups", sets: 4, reps: "8-10", progress: 0, completedSets: 0 },
            { name: "Core circuit", sets: 3, reps: "45s", progress: 0, completedSets: 0 }
          ]
        },
        {
          type: "throwing",
          name: "Throwing",
          exerciseCount: 5,
          estimatedTime: "35m",
          status: "not-started",
          description: "End-of-week throwing session",
          seriesType: "Play Session",
          intensity: "Medium Intensity",
          exercises: [
            { name: "Light warm-up throws", sets: 2, reps: "8-10", progress: 0, completedSets: 0 },
            { name: "Progressive distance", sets: 3, reps: "6-8", progress: 0, completedSets: 0 },
            { name: "Game simulation", sets: 3, reps: "5", progress: 0, completedSets: 0 },
            { name: "Accuracy work", sets: 2, reps: "10", progress: 0, completedSets: 0 },
            { name: "Cool down throws", sets: 2, reps: "8", progress: 0, completedSets: 0 }
          ]
        }
      ];
    case 21: // Saturday (rest day)
      return [];
    case 22: // Sunday
      return [
        {
          type: "movement",
          name: "Movement",
          exerciseCount: 3,
          estimatedTime: "25m",
          status: "not-started",
          description: "Active recovery and mobility",
          routineType: "Corrective E",
          exercises: [
            { name: "Foam rolling", sets: 1, reps: "10 min", progress: 0, completedSets: 0 },
            { name: "Dynamic stretching", sets: 2, reps: "60s ea.", progress: 0, completedSets: 0 },
            { name: "Light cardio", sets: 1, reps: "15 min", progress: 0, completedSets: 0 }
          ]
        },
        {
          type: "strength",
          name: "Strength & Conditioning",
          exerciseCount: 4,
          estimatedTime: "30m",
          status: "not-started",
          description: "Light strength & conditioning work",
          bodyFocus: "Upper Body",
          liftingTime: "30m",
          exercises: [
            { name: "Light resistance bands", sets: 3, reps: "15", progress: 0, completedSets: 0 },
            { name: "Bodyweight exercises", sets: 3, reps: "12", progress: 0, completedSets: 0 },
            { name: "Core stability", sets: 3, reps: "30s", progress: 0, completedSets: 0 },
            { name: "Flexibility work", sets: 2, reps: "60s", progress: 0, completedSets: 0 }
          ]
        },
        {
          type: "throwing",
          name: "Throwing",
          exerciseCount: 4,
          estimatedTime: "30m",
          status: "not-started",
          description: "Light throwing session",
          seriesType: "Catch & Play",
          intensity: "Medium Intensity",
          exercises: [
            { name: "Easy warm-up throws", sets: 2, reps: "10", progress: 0, completedSets: 0 },
            { name: "Light catch play", sets: 3, reps: "8", progress: 0, completedSets: 0 },
            { name: "Form focus", sets: 2, reps: "6", progress: 0, completedSets: 0 },
            { name: "Recovery throws", sets: 2, reps: "8", progress: 0, completedSets: 0 }
          ]
        }
      ];
    default:
      return [];
  }
};

// Get session data for a specific day
export const getSessionData = (day: number): SessionData => {
  const routines = getExercisesForDay(day);
  const totalDuration = calculateTotalDuration(routines);
  
  return {
    date: `2024-07-${day.toString().padStart(2, '0')}`,
    dayOfWeek: getDayOfWeek(day),
    sessionName: `${getDayOfWeek(day)} training session`,
    totalDuration,
    routines
  };
};

// Helper functions
const calculateTotalDuration = (routines: Routine[]): string => {
  if (routines.length === 0) return "0 min";
  
  const totalMinutes = routines.reduce((total, routine) => {
    const timeStr = routine.estimatedTime;
    const minutes = parseInt(timeStr.match(/\d+/)?.[0] || '0');
    return total + minutes;
  }, 0);
  
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  
  return `${totalMinutes} min`;
};

const getDayOfWeek = (day: number): string => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // Assuming July 2024 starts on a Monday (day 1)
  const dayIndex = (day - 1) % 7;
  return days[dayIndex];
};
