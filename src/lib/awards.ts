export interface AwardDef {
  type: string;
  title: string;
  description: string;
  icon: string;
  check: (stats: AwardStats) => boolean;
}

export interface AwardStats {
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;
  totalStudyMinutes: number;
  totalStudyDays: number;
}

export const AWARD_DEFINITIONS: AwardDef[] = [
  { type: 'first_task', title: 'First Step', description: 'Complete your first task', icon: '🎯', check: s => s.totalCompleted >= 1 },
  { type: 'ten_tasks', title: 'Getting Going', description: 'Complete 10 tasks', icon: '📚', check: s => s.totalCompleted >= 10 },
  { type: 'fifty_tasks', title: 'Dedicated Learner', description: 'Complete 50 tasks', icon: '🏆', check: s => s.totalCompleted >= 50 },
  { type: 'hundred_tasks', title: 'Century Club', description: 'Complete 100 tasks', icon: '💯', check: s => s.totalCompleted >= 100 },
  { type: 'streak_3', title: 'On a Roll', description: '3-day study streak', icon: '🔥', check: s => s.currentStreak >= 3 },
  { type: 'streak_7', title: 'Week Warrior', description: '7-day study streak', icon: '⚡', check: s => s.currentStreak >= 7 },
  { type: 'streak_14', title: 'Unstoppable', description: '14-day study streak', icon: '🌟', check: s => s.currentStreak >= 14 },
  { type: 'streak_30', title: 'Monthly Master', description: '30-day study streak', icon: '👑', check: s => s.currentStreak >= 30 },
  { type: 'hours_5', title: 'Five Hours In', description: 'Study for 5 total hours', icon: '⏰', check: s => s.totalStudyMinutes >= 300 },
  { type: 'hours_25', title: 'Quarter Century', description: 'Study for 25 total hours', icon: '📖', check: s => s.totalStudyMinutes >= 1500 },
  { type: 'hours_100', title: 'Scholar', description: 'Study for 100 total hours', icon: '🎓', check: s => s.totalStudyMinutes >= 6000 },
  { type: 'days_10', title: 'Consistent', description: 'Study on 10 different days', icon: '📅', check: s => s.totalStudyDays >= 10 },
];
