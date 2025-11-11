export function getDemoData() {
  return {
    profile: {
      username: 'DemoChampion',
      avatar_url: '',
      level: 15,
      total_xp: 2500,
      created_at: '2024-12-01T00:00:00Z'
    },
    stats: {
      workouts_count: 42,
      meals_count: 89,
      current_streak: 7,
      max_streak: 14,
      total_exercises: 156,
      prs_this_month: 8
    },
    recentWorkouts: [
      {
        id: '1',
        name: 'Upper Body Power',
        date: '2025-01-10',
        duration_minutes: 65,
        total_volume: 8500,
        xp_earned: 120,
        exercises: [
          { name: 'Bench Press', sets: 4, reps: 8, weight: 225, unit: 'lbs' },
          { name: 'Pull-ups', sets: 3, reps: 10, weight: 0, unit: 'lbs' },
          { name: 'Overhead Press', sets: 4, reps: 8, weight: 135, unit: 'lbs' }
        ]
      },
      {
        id: '2',
        name: 'Lower Body Strength',
        date: '2025-01-08',
        duration_minutes: 70,
        total_volume: 12000,
        xp_earned: 150,
        exercises: [
          { name: 'Squat', sets: 5, reps: 5, weight: 315, unit: 'lbs' },
          { name: 'Romanian Deadlift', sets: 4, reps: 8, weight: 225, unit: 'lbs' },
          { name: 'Leg Press', sets: 3, reps: 12, weight: 450, unit: 'lbs' }
        ]
      },
      {
        id: '3',
        name: 'Full Body Conditioning',
        date: '2025-01-06',
        duration_minutes: 45,
        total_volume: 5000,
        xp_earned: 100,
        exercises: [
          { name: 'Power Clean', sets: 5, reps: 3, weight: 185, unit: 'lbs' },
          { name: 'Front Squat', sets: 3, reps: 8, weight: 185, unit: 'lbs' },
          { name: 'Box Jumps', sets: 3, reps: 10, weight: 0, unit: 'reps' }
        ]
      }
    ],
    recentMeals: [
      {
        id: '1',
        name: 'Breakfast Power Bowl',
        time: '08:00',
        calories: 650,
        protein: 45,
        carbs: 65,
        fats: 20
      },
      {
        id: '2',
        name: 'Pre-Workout Snack',
        time: '11:30',
        calories: 280,
        protein: 15,
        carbs: 40,
        fats: 8
      },
      {
        id: '3',
        name: 'Post-Workout Lunch',
        time: '13:30',
        calories: 800,
        protein: 60,
        carbs: 80,
        fats: 25
      }
    ],
    achievements: [
      {
        id: '1',
        name: 'First Workout',
        description: 'Complete your first workout',
        unlocked: true,
        unlocked_at: '2024-12-01T10:00:00Z',
        icon: '🏋️'
      },
      {
        id: '2',
        name: 'Week Warrior',
        description: '7-day workout streak',
        unlocked: true,
        unlocked_at: '2024-12-08T18:00:00Z',
        icon: '🔥'
      },
      {
        id: '3',
        name: 'PR Crusher',
        description: 'Set 10 personal records',
        unlocked: true,
        unlocked_at: '2024-12-15T14:30:00Z',
        icon: '💪'
      },
      {
        id: '4',
        name: 'Nutrition Tracked',
        description: 'Log 50 meals',
        unlocked: true,
        unlocked_at: '2024-12-20T20:00:00Z',
        icon: '🍎'
      },
      {
        id: '5',
        name: 'Level 10',
        description: 'Reach level 10',
        unlocked: true,
        unlocked_at: '2025-01-05T12:00:00Z',
        icon: '⭐'
      },
      {
        id: '6',
        name: 'Century Club',
        description: 'Complete 100 exercises',
        unlocked: false,
        unlocked_at: null,
        icon: '🎯'
      }
    ],
    activityFeed: [
      {
        type: 'pr',
        data: { exercise: 'Bench Press', weight: 225, unit: 'lbs', improvement: 5 },
        created_at: '2025-01-10T14:30:00Z',
        xp_earned: 25
      },
      {
        type: 'level_up',
        data: { level: 15 },
        created_at: '2025-01-09T18:00:00Z',
        xp_earned: 50
      },
      {
        type: 'achievement',
        data: { name: 'Week Warrior', icon: '🔥' },
        created_at: '2025-01-08T20:00:00Z',
        xp_earned: 100
      },
      {
        type: 'pr',
        data: { exercise: 'Squat', weight: 315, unit: 'lbs', improvement: 10 },
        created_at: '2025-01-08T13:00:00Z',
        xp_earned: 30
      },
      {
        type: 'workout_complete',
        data: { name: 'Full Body Conditioning', duration: 45 },
        created_at: '2025-01-06T12:00:00Z',
        xp_earned: 100
      }
    ],
    personalRecords: [
      { exercise: 'Bench Press', weight: 225, unit: 'lbs', date: '2025-01-10' },
      { exercise: 'Squat', weight: 315, unit: 'lbs', date: '2025-01-08' },
      { exercise: 'Deadlift', weight: 405, unit: 'lbs', date: '2025-01-05' },
      { exercise: 'Overhead Press', weight: 135, unit: 'lbs', date: '2025-01-10' },
      { exercise: 'Pull-ups', weight: 0, unit: 'reps', date: '2025-01-10', reps: 10 }
    ]
  };
}
