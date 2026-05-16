// Badge definitions and earning logic

export const ADMIN_BADGE = {
  id: 'admin',
  emoji: '🛡️',
  label: 'NymFit Admin',
  desc: 'Part of the NymFit team',
  color: 'bg-pink-950 text-primary border-primary/60',
};

export const EARLY_MEMBER_BADGE = {
  id: 'early_member',
  emoji: '⭐',
  label: 'Early Member',
  desc: 'One of the first 10 NymFit members',
  color: 'bg-yellow-950 text-yellow-300 border-yellow-600/60',
};

export const FIRST_100_BADGE = {
  id: 'first_100',
  emoji: '💯',
  label: 'First to 100',
  desc: 'Among the first 100 NymFit members',
  color: 'bg-violet-950 text-violet-300 border-violet-600/60',
};

export const ALL_BADGES = [
  // Logging streaks
  { id: 'log_3', emoji: '🌱', label: '3-Day Logger', desc: 'Logged 3 days in a row', color: 'bg-emerald-950 text-emerald-300 border-emerald-600/60' },
  { id: 'log_7', emoji: '🔥', label: 'Week Warrior', desc: 'Logged 7 days in a row', color: 'bg-orange-950 text-orange-300 border-orange-600/60' },
  { id: 'log_30', emoji: '👑', label: 'Glow-Up Queen', desc: 'Logged 30 days in a row', color: 'bg-yellow-950 text-yellow-300 border-yellow-600/60' },

  // Hydration
  { id: 'water_7', emoji: '💧', label: '7-Day Hydration Hero', desc: 'Logged water for 7 days', color: 'bg-sky-950 text-sky-300 border-sky-600/60' },
  { id: 'water_30', emoji: '🫧', label: 'Hydration Queen', desc: 'Logged water for 30 days', color: 'bg-blue-950 text-blue-300 border-blue-600/60' },

  // Habits
  { id: 'habits_perfect_day', emoji: '✨', label: 'Perfect Day', desc: 'Completed all habits in a day', color: 'bg-purple-950 text-purple-300 border-purple-600/60' },
  { id: 'habits_7', emoji: '🌸', label: 'Morning Routine Master', desc: 'Completed habits 7 days', color: 'bg-pink-950 text-pink-300 border-pink-600/60' },
  { id: 'habits_30', emoji: '💫', label: 'Habit Goddess', desc: 'Completed habits 30 days', color: 'bg-violet-950 text-violet-300 border-violet-600/60' },

  // Workouts
  { id: 'workout_1', emoji: '🏃‍♀️', label: 'First Sweat', desc: 'Logged your first workout', color: 'bg-red-950 text-red-300 border-red-600/60' },
  { id: 'workout_10', emoji: '💪', label: 'Gym Girlie', desc: 'Logged 10 workouts total', color: 'bg-rose-950 text-rose-300 border-rose-600/60' },
  { id: 'workout_30', emoji: '🦋', label: 'Transformation Era', desc: 'Logged 30 workouts total', color: 'bg-fuchsia-950 text-fuchsia-300 border-fuchsia-600/60' },

  // Meals
  { id: 'meal_7', emoji: '🥗', label: 'Clean Eater', desc: 'Logged meals for 7 days', color: 'bg-lime-950 text-lime-300 border-lime-600/60' },
  { id: 'meal_30', emoji: '🌿', label: 'Nutrition Nurturer', desc: 'Logged meals for 30 days', color: 'bg-green-950 text-green-300 border-green-600/60' },

  // Community
  { id: 'first_post', emoji: '📸', label: 'Story Sharer', desc: 'Posted your first story', color: 'bg-amber-950 text-amber-300 border-amber-600/60' },
  { id: 'posts_5', emoji: '🌟', label: 'Community Cutie', desc: 'Shared 5 stories', color: 'bg-yellow-950 text-yellow-300 border-yellow-600/60' },

  // Special membership
  { ...EARLY_MEMBER_BADGE },
  { ...FIRST_100_BADGE },
];

export function getBadge(id) {
  if (id === 'admin') return ADMIN_BADGE;
  if (id === 'early_member') return EARLY_MEMBER_BADGE;
  if (id === 'first_100') return FIRST_100_BADGE;
  return ALL_BADGES.find(b => b.id === id);
}

/**
 * Given logs and posts, returns an array of badge IDs the user has earned.
 */
export function computeEarnedBadges(logs = [], posts = [], workoutCount = 0) {
  const earned = [];

  // Sort logs by date descending
  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Consecutive streak
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (sorted.find(l => l.date === key)) streak++;
    else if (i > 0) break;
  }
  if (streak >= 3) earned.push('log_3');
  if (streak >= 7) earned.push('log_7');
  if (streak >= 30) earned.push('log_30');

  // Hydration days
  const waterDays = logs.filter(l => (l.water_glasses || 0) > 0 || (l.drink_entries || []).length > 0).length;
  if (waterDays >= 7) earned.push('water_7');
  if (waterDays >= 30) earned.push('water_30');

  // Habits
  const habitDays = logs.filter(l => (l.habits_done || []).length > 0).length;
  const perfectDays = logs.filter(l => (l.habits_done || []).length >= 6).length;
  if (perfectDays >= 1) earned.push('habits_perfect_day');
  if (habitDays >= 7) earned.push('habits_7');
  if (habitDays >= 30) earned.push('habits_30');

  // Workouts
  const totalWorkouts = logs.reduce((s, l) => s + (l.workouts_done || []).length, 0) + workoutCount;
  if (totalWorkouts >= 1) earned.push('workout_1');
  if (totalWorkouts >= 10) earned.push('workout_10');
  if (totalWorkouts >= 30) earned.push('workout_30');

  // Meals
  const mealDays = logs.filter(l => (l.food_entries || []).length > 0 || (l.meals_eaten || []).length > 0).length;
  if (mealDays >= 7) earned.push('meal_7');
  if (mealDays >= 30) earned.push('meal_30');

  // Community posts
  if (posts.length >= 1) earned.push('first_post');
  if (posts.length >= 5) earned.push('posts_5');

  return earned;
}