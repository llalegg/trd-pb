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
    case 16: // Monday
      return [
        {
          type: "throwing",
          name: "Throwing",
          exerciseCount: 6,
          estimatedTime: "45 min",
          status: "not-started",
          description: "Focus on mechanics and velocity development",
          exercises: [
            { name: "Dynamic warm-up throws", sets: 2, reps: "10-15", progress: 100, completedSets: 2 },
            { name: "Long toss progression", sets: 3, reps: "8-10", progress: 66, completedSets: 2 },
            { name: "Bullpen session", sets: 4, reps: "5-6", progress: 0, completedSets: 0 },
            { name: "Velocity tracking", sets: 3, reps: "6", progress: 0, completedSets: 0 },
            { name: "Mechanical drills", sets: 3, reps: "8-12", progress: 0, completedSets: 0 },
            { name: "Cool down throws", sets: 2, reps: "10-12", progress: 0, completedSets: 0 }
          ]
        },
        {
          type: "movement",
          name: "Movement",
          exerciseCount: 4,
          estimatedTime: "30 min",
          status: "not-started",
          description: "Dynamic warm-up and mobility work",
          exercises: [
            { name: "Hip mobility circuit", sets: 2, reps: "60s ea.", progress: 0, completedSets: 0 },
            { name: "Shoulder activation", sets: 3, reps: "12", progress: 0, completedSets: 0 },
            { name: "Core stability work", sets: 3, reps: "45s", progress: 0, completedSets: 0 },
            { name: "Movement patterns", sets: 2, reps: "10", progress: 0, completedSets: 0 }
          ]
        }
      ];
    case 17: // Tuesday (current day)
      return [
        {
          type: "throwing",
          name: "Throwing",
          exerciseCount: 6,
          estimatedTime: "45 min",
          status: "not-started",
          description: "Focus on mechanics and velocity development",
          exercises: [
            { name: "Dynamic warm-up throws", sets: 2, reps: "10-15", progress: 100, completedSets: 2 },
            { name: "Long toss progression", sets: 3, reps: "8-10", progress: 66, completedSets: 2 },
            { name: "Bullpen session", sets: 4, reps: "5-6", progress: 0, completedSets: 0 },
            { name: "Velocity tracking", sets: 3, reps: "6", progress: 0, completedSets: 0 },
            { name: "Mechanical drills", sets: 3, reps: "8-12", progress: 0, completedSets: 0 },
            { name: "Cool down throws", sets: 2, reps: "10-12", progress: 0, completedSets: 0 }
          ]
        },
        {
          type: "movement",
          name: "Movement",
          exerciseCount: 6,
          estimatedTime: "45 min",
          status: "not-started",
          description: "Dynamic warm-up and mobility work",
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
          name: "Strength",
          exerciseCount: 4,
          estimatedTime: "30 min",
          status: "not-started",
          description: "Progressive overload training",
          exercises: [
            { name: "Bench press", sets: 5, reps: "5", weight: "185", progress: 20, completedSets: 1 },
            { name: "Pull-ups", sets: 4, reps: "8-10", progress: 0, completedSets: 0 },
            { name: "Shoulder press", sets: 3, reps: "8", weight: "95", progress: 0, completedSets: 0 },
            { name: "Rows", sets: 4, reps: "10", weight: "65", progress: 0, completedSets: 0 }
          ]
        }
      ];
    case 18: // Wednesday (rest day)
      return [];
    case 19: // Thursday
      return [
        {
          type: "throwing",
          name: "Throwing",
          exerciseCount: 4,
          estimatedTime: "30 min",
          status: "completed",
          description: "Recovery throwing session",
          exercises: [
            { name: "Light warm-up throws", sets: 2, reps: "10-12", progress: 100, completedSets: 2 },
            { name: "Easy bullpen", sets: 3, reps: "5-6", progress: 100, completedSets: 3 },
            { name: "Mechanical focus", sets: 2, reps: "8", progress: 100, completedSets: 2 },
            { name: "Cool down", sets: 2, reps: "8-10", progress: 100, completedSets: 2 }
          ]
        },
        {
          type: "movement",
          name: "Movement",
          exerciseCount: 3,
          estimatedTime: "20 min",
          status: "completed",
          description: "Light movement and recovery",
          exercises: [
            { name: "Gentle mobility", sets: 2, reps: "45s ea.", progress: 100, completedSets: 2 },
            { name: "Recovery stretches", sets: 2, reps: "60s", progress: 100, completedSets: 2 },
            { name: "Breathing exercises", sets: 1, reps: "5 min", progress: 100, completedSets: 1 }
          ]
        }
      ];
    case 20: // Friday
      return [
        {
          type: "strength",
          name: "Strength",
          exerciseCount: 5,
          estimatedTime: "40 min",
          status: "in-progress",
          description: "Full body strength training",
          exercises: [
            { name: "Squats", sets: 4, reps: "8", weight: "225", progress: 50, completedSets: 2 },
            { name: "Deadlifts", sets: 3, reps: "5", weight: "275", progress: 33, completedSets: 1 },
            { name: "Overhead press", sets: 3, reps: "8", weight: "95", progress: 0, completedSets: 0 },
            { name: "Pull-ups", sets: 4, reps: "8-10", progress: 0, completedSets: 0 },
            { name: "Core circuit", sets: 3, reps: "45s", progress: 0, completedSets: 0 }
          ]
        }
      ];
    case 21: // Saturday (rest day)
      return [];
    case 22: // Sunday
      return [
        {
          type: "recovery",
          name: "Recovery",
          exerciseCount: 3,
          estimatedTime: "25 min",
          status: "not-started",
          description: "Active recovery and mobility",
          exercises: [
            { name: "Foam rolling", sets: 1, reps: "10 min", progress: 0, completedSets: 0 },
            { name: "Dynamic stretching", sets: 2, reps: "60s ea.", progress: 0, completedSets: 0 },
            { name: "Light cardio", sets: 1, reps: "15 min", progress: 0, completedSets: 0 }
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
