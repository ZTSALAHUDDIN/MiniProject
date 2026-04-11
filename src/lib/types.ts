export interface Subject {
  id: string;
  name: string;
  color: string;
  created_at: string;
  user_id: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  importance: 1 | 2 | 3 | 4 | 5;
  confidence: 1 | 2 | 3 | 4 | 5;
  estimated_hours: number;
  priority_score: number;
  status: 'pending' | 'in_progress' | 'completed';
  deadline?: string; // ISO date
  created_at: string;
  user_id: string;
}

export interface RoutineBlock {
  id: string;
  label: string;
  type: 'sleep' | 'college' | 'meal' | 'commute' | 'other';
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  days: number[]; // 0=Sun, 1=Mon, ...6=Sat
  user_id: string;
}

export interface ExamDate {
  id: string;
  subject_id: string;
  exam_date: string; // ISO date
  user_id: string;
}

export interface ScheduledTask {
  id: string;
  topic_id: string;
  subject_id: string;
  date: string; // ISO date
  start_time: string; // HH:MM
  end_time: string;
  status: 'scheduled' | 'completed' | 'missed' | 'difficult';
  is_revision: boolean;
  revision_count: number;
  created_at: string;
  user_id: string;
}

export interface DailyStats {
  id: string;
  date: string;
  tasks_completed: number;
  tasks_missed: number;
  tasks_total: number;
  study_minutes: number;
  user_id: string;
}

export interface Streak {
  id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  total_study_days: number;
  user_id: string;
}

export interface Award {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  earned_at: string;
  user_id: string;
}

export type TimeSlot = {
  start: string; // HH:MM
  end: string;
};

export const SUBJECT_COLORS = [
  'hsl(175, 60%, 40%)',
  'hsl(200, 70%, 50%)',
  'hsl(145, 60%, 42%)',
  'hsl(35, 90%, 55%)',
  'hsl(280, 60%, 55%)',
  'hsl(340, 65%, 55%)',
  'hsl(15, 75%, 55%)',
  'hsl(220, 65%, 55%)',
];
