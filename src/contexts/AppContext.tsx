import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Subject, Topic, RoutineBlock, ExamDate, ScheduledTask, DailyStats, Streak, Award } from '@/lib/types';
import { calculatePriority, generateSchedule, rescheduleMissedTask, scheduleExtraRevision, getFreeSlots, timeToMinutes, minutesToTime } from '@/lib/scheduler';
import { AWARD_DEFINITIONS, AwardStats } from '@/lib/awards';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

interface AppContextType {
  user: User | null;
  subjects: Subject[];
  topics: Topic[];
  routineBlocks: RoutineBlock[];
  examDates: ExamDate[];
  scheduledTasks: ScheduledTask[];
  dailyStats: DailyStats[];
  streak: Streak;
  awards: Award[];
  loading: boolean;
  addSubject: (name: string, color: string) => Promise<void>;
  removeSubject: (id: string) => Promise<void>;
  addTopic: (topic: Omit<Topic, 'id' | 'priority_score' | 'created_at' | 'user_id'>) => Promise<void>;
  updateTopic: (id: string, updates: Partial<Topic>) => Promise<void>;
  removeTopic: (id: string) => Promise<void>;
  addRoutineBlock: (block: Omit<RoutineBlock, 'id' | 'user_id'>) => Promise<void>;
  removeRoutineBlock: (id: string) => Promise<void>;
  addExamDate: (subjectId: string, date: string) => Promise<void>;
  removeExamDate: (id: string) => Promise<void>;
  markTask: (taskId: string, status: 'completed' | 'missed' | 'difficult') => Promise<void>;
  generateNewSchedule: () => Promise<void>;
  addQuickTask: (topicId: string, date: string) => Promise<void>;
  refreshData: () => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultStreak: Streak = {
  id: 'default', current_streak: 0, longest_streak: 0,
  last_active_date: '', total_study_days: 0, user_id: '',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [routineBlocks, setRoutineBlocks] = useState<RoutineBlock[]>([]);
  const [examDates, setExamDates] = useState<ExamDate[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [streak, setStreak] = useState<Streak>(defaultStreak);
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load all data when user logs in
  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      setSubjects([]); setTopics([]); setRoutineBlocks([]); setExamDates([]);
      setScheduledTasks([]); setDailyStats([]); setStreak(defaultStreak); setAwards([]);
      setLoading(false);
    }
  }, [user]);

  // Realtime subscription for scheduled_tasks
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'scheduled_tasks' }, () => {
        loadScheduledTasks();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'streaks' }, () => {
        loadStreak();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await Promise.all([
        loadSubjects(), loadTopics(), loadRoutineBlocks(), loadExamDates(),
        loadScheduledTasks(), loadDailyStats(), loadStreak(), loadAwards(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    const { data } = await supabase.from('subjects').select('*').order('created_at');
    if (data) setSubjects(data as any);
  };
  const loadTopics = async () => {
    const { data } = await supabase.from('topics').select('*').order('priority_score', { ascending: false });
    if (data) setTopics(data as any);
  };
  const loadRoutineBlocks = async () => {
    const { data } = await supabase.from('routine_blocks').select('*').order('start_time');
    if (data) setRoutineBlocks(data as any);
  };
  const loadExamDates = async () => {
    const { data } = await supabase.from('exam_dates').select('*');
    if (data) setExamDates(data as any);
  };
  const loadScheduledTasks = async () => {
    const { data } = await supabase.from('scheduled_tasks').select('*').order('date').order('start_time');
    if (data) setScheduledTasks(data as any);
  };
  const loadDailyStats = async () => {
    const { data } = await supabase.from('daily_stats').select('*').order('date', { ascending: false }).limit(30);
    if (data) setDailyStats(data as any);
  };
  const loadStreak = async () => {
    if (!user) return;
    const { data } = await supabase.from('streaks').select('*').eq('user_id', user.id).maybeSingle();
    if (data) setStreak(data as any);
    else {
      // Create streak row
      const { data: newStreak } = await supabase.from('streaks').insert({ user_id: user.id, current_streak: 0, longest_streak: 0, total_study_days: 0 }).select().single();
      if (newStreak) setStreak(newStreak as any);
    }
  };
  const loadAwards = async () => {
    const { data } = await supabase.from('awards').select('*').order('earned_at');
    if (data) setAwards(data as any);
  };

  const refreshData = useCallback(async () => {
    await loadAllData();
  }, [user]);

  const addSubject = useCallback(async (name: string, color: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('subjects').insert({ user_id: user.id, name, color }).select().single();
    if (error) { toast.error('Failed to add subject'); return; }
    setSubjects(prev => [...prev, data as any]);
    toast.success(`Added "${name}"`);
  }, [user]);

  const removeSubject = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('subjects').delete().eq('id', id);
    setSubjects(prev => prev.filter(s => s.id !== id));
    setTopics(prev => prev.filter(t => t.subject_id !== id));
    setExamDates(prev => prev.filter(e => e.subject_id !== id));
    setScheduledTasks(prev => prev.filter(t => t.subject_id !== id));
    toast.success('Subject removed');
  }, [user]);

  const addTopic = useCallback(async (topic: Omit<Topic, 'id' | 'priority_score' | 'created_at' | 'user_id'>) => {
    if (!user) return;
    const priority = calculatePriority(topic as any, examDates.find(e => e.subject_id === topic.subject_id));
    const { data, error } = await supabase.from('topics').insert({
      user_id: user.id, ...topic, priority_score: priority,
    }).select().single();
    if (error) { toast.error('Failed to add topic'); return; }
    setTopics(prev => [...prev, data as any]);
    toast.success(`Added "${topic.name}"`);
  }, [user, examDates]);

  const updateTopic = useCallback(async (id: string, updates: Partial<Topic>) => {
    if (!user) return;
    const existing = topics.find(t => t.id === id);
    if (!existing) return;
    const merged = { ...existing, ...updates };
    const priority = calculatePriority(merged as any, examDates.find(e => e.subject_id === merged.subject_id));
    const { error } = await supabase.from('topics').update({ ...updates, priority_score: priority }).eq('id', id);
    if (error) { toast.error('Failed to update topic'); return; }
    setTopics(prev => prev.map(t => t.id === id ? { ...t, ...updates, priority_score: priority } : t));
  }, [user, topics, examDates]);

  const removeTopic = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('topics').delete().eq('id', id);
    setTopics(prev => prev.filter(t => t.id !== id));
    setScheduledTasks(prev => prev.filter(t => t.topic_id !== id));
    toast.success('Topic removed');
  }, [user]);

  const addRoutineBlock = useCallback(async (block: Omit<RoutineBlock, 'id' | 'user_id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('routine_blocks').insert({ user_id: user.id, ...block }).select().single();
    if (error) { toast.error('Failed to add routine block'); return; }
    setRoutineBlocks(prev => [...prev, data as any]);
    toast.success(`Added "${block.label}"`);
  }, [user]);

  const removeRoutineBlock = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('routine_blocks').delete().eq('id', id);
    setRoutineBlocks(prev => prev.filter(b => b.id !== id));
    toast.success('Routine block removed');
  }, [user]);

  const addExamDate = useCallback(async (subjectId: string, date: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('exam_dates').insert({ user_id: user.id, subject_id: subjectId, exam_date: date }).select().single();
    if (error) { toast.error('Failed to add exam date'); return; }
    setExamDates(prev => [...prev, data as any]);
    // Recalculate priorities
    const { data: updatedTopics } = await supabase.from('topics').select('*').eq('subject_id', subjectId);
    if (updatedTopics) {
      for (const t of updatedTopics) {
        const newPriority = calculatePriority(t as any, { id: data.id, subject_id: subjectId, exam_date: date, user_id: user.id });
        await supabase.from('topics').update({ priority_score: newPriority }).eq('id', t.id);
      }
      await loadTopics();
    }
    toast.success('Exam date added');
  }, [user]);

  const removeExamDate = useCallback(async (id: string) => {
    if (!user) return;
    await supabase.from('exam_dates').delete().eq('id', id);
    setExamDates(prev => prev.filter(e => e.id !== id));
    toast.success('Exam date removed');
  }, [user]);

  const updateStreakAndAwards = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const todayCompleted = scheduledTasks.some(t => t.date === today && t.status === 'completed');

    if (todayCompleted) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const isConsecutive = streak.last_active_date === yesterdayStr || streak.last_active_date === today;
      const newCurrent = isConsecutive ? (streak.last_active_date === today ? streak.current_streak : streak.current_streak + 1) : 1;
      const newLongest = Math.max(streak.longest_streak, newCurrent);
      const newTotalDays = streak.last_active_date === today ? streak.total_study_days : streak.total_study_days + 1;

      await supabase.from('streaks').update({
        current_streak: newCurrent, longest_streak: newLongest,
        last_active_date: today, total_study_days: newTotalDays,
      }).eq('user_id', user.id);

      setStreak(prev => ({ ...prev, current_streak: newCurrent, longest_streak: newLongest, last_active_date: today, total_study_days: newTotalDays }));
    }

    // Update daily stats
    const todayTasks = scheduledTasks.filter(t => t.date === today);
    const completed = todayTasks.filter(t => t.status === 'completed').length;
    const missed = todayTasks.filter(t => t.status === 'missed').length;
    const studyMinutes = todayTasks.filter(t => t.status === 'completed').reduce((sum, t) => {
      const [sh, sm] = t.start_time.split(':').map(Number);
      const [eh, em] = t.end_time.split(':').map(Number);
      return sum + (eh * 60 + em) - (sh * 60 + sm);
    }, 0);

    await supabase.from('daily_stats').upsert({
      user_id: user.id, date: today,
      tasks_completed: completed, tasks_missed: missed,
      tasks_total: todayTasks.length, study_minutes: studyMinutes,
    }, { onConflict: 'user_id,date' });

    // Check awards
    const totalCompleted = scheduledTasks.filter(t => t.status === 'completed').length;
    const totalMinutes = scheduledTasks.filter(t => t.status === 'completed').reduce((sum, t) => {
      const [sh, sm] = t.start_time.split(':').map(Number);
      const [eh, em] = t.end_time.split(':').map(Number);
      return sum + (eh * 60 + em) - (sh * 60 + sm);
    }, 0);

    const stats: AwardStats = {
      totalCompleted, currentStreak: streak.current_streak,
      longestStreak: streak.longest_streak, totalStudyMinutes: totalMinutes,
      totalStudyDays: streak.total_study_days,
    };

    for (const def of AWARD_DEFINITIONS) {
      if (def.check(stats) && !awards.some(a => a.type === def.type)) {
        await supabase.from('awards').insert({
          user_id: user.id, type: def.type, title: def.title,
          description: def.description, icon: def.icon,
        });
        toast.success(`🏆 Award earned: ${def.title}!`);
      }
    }
    await loadAwards();
    await loadDailyStats();
  }, [user, scheduledTasks, streak, awards]);

  const markTask = useCallback(async (taskId: string, status: 'completed' | 'missed' | 'difficult') => {
    if (!user) return;
    const { error } = await supabase.from('scheduled_tasks').update({ status }).eq('id', taskId);
    if (error) { toast.error('Failed to update task'); return; }

    const task = scheduledTasks.find(t => t.id === taskId);
    setScheduledTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));

    if (task) {
      if (status === 'missed') {
        // Reschedule missed task + increase priority (lower confidence)
        const rescheduled = rescheduleMissedTask(task, routineBlocks, scheduledTasks);
        if (rescheduled) {
          const { data } = await supabase.from('scheduled_tasks').insert({
            user_id: user.id, topic_id: rescheduled.topic_id, subject_id: rescheduled.subject_id,
            date: rescheduled.date, start_time: rescheduled.start_time, end_time: rescheduled.end_time,
            status: 'scheduled', is_revision: rescheduled.is_revision, revision_count: rescheduled.revision_count,
          }).select().single();
          if (data) setScheduledTasks(prev => [...prev, data as any]);
          toast.info('Task rescheduled to next available slot');
        }
        await updateTopic(task.topic_id, { confidence: Math.max(1, (topics.find(t => t.id === task.topic_id)?.confidence || 3) - 1) as any });
      }

      if (status === 'difficult') {
        // Increase difficulty + lower confidence + add extra revision session
        const t = topics.find(t => t.id === task.topic_id);
        if (t) {
          await updateTopic(task.topic_id, {
            difficulty: Math.min(5, t.difficulty + 1) as any,
            confidence: Math.max(1, t.confidence - 1) as any,
          });
        }
        // Schedule extra revision for difficult topics
        const extraRev = scheduleExtraRevision(task, routineBlocks, scheduledTasks);
        if (extraRev) {
          const { data } = await supabase.from('scheduled_tasks').insert({
            user_id: user.id, topic_id: extraRev.topic_id, subject_id: extraRev.subject_id,
            date: extraRev.date, start_time: extraRev.start_time, end_time: extraRev.end_time,
            status: 'scheduled', is_revision: true, revision_count: extraRev.revision_count,
          }).select().single();
          if (data) setScheduledTasks(prev => [...prev, data as any]);
          toast.info('Extra revision session added for this difficult topic');
        }
        // Also mark the task as completed (student attempted it)
        await supabase.from('scheduled_tasks').update({ status: 'difficult' }).eq('id', taskId);
      }

      if (status === 'completed') {
        // Boost confidence → reduces future priority & time allocation
        const t = topics.find(t => t.id === task.topic_id);
        if (t) {
          await updateTopic(task.topic_id, {
            confidence: Math.min(5, t.confidence + 1) as any,
            ...(t.confidence >= 4 ? { estimated_hours: Math.max(0.5, t.estimated_hours - 0.25) } : {}),
          });
        }
      }
    }

    setTimeout(() => updateStreakAndAwards(), 300);
  }, [user, scheduledTasks, routineBlocks, topics, updateTopic, updateStreakAndAwards]);

  const generateNewSchedule = useCallback(async () => {
    if (!user || topics.length === 0) return;
    const today = new Date();
    const newTasks = generateSchedule(topics, routineBlocks, examDates, scheduledTasks, today, 7);
    const existingKeys = new Set(scheduledTasks.map(t => `${t.date}-${t.topic_id}`));
    const uniqueNew = newTasks.filter(t => !existingKeys.has(`${t.date}-${t.topic_id}`));

    if (uniqueNew.length === 0) {
      toast.info('Schedule is already up to date');
      return;
    }

    const inserts = uniqueNew.map(t => ({
      user_id: user.id, topic_id: t.topic_id, subject_id: t.subject_id,
      date: t.date, start_time: t.start_time, end_time: t.end_time,
      status: 'scheduled', is_revision: t.is_revision, revision_count: t.revision_count,
    }));

    const { data, error } = await supabase.from('scheduled_tasks').insert(inserts).select();
    if (error) { toast.error('Failed to generate schedule'); return; }
    if (data) setScheduledTasks(prev => [...prev, ...(data as any)]);
    toast.success(`Generated ${uniqueNew.length} study sessions!`);
  }, [user, topics, routineBlocks, examDates, scheduledTasks]);

  const addQuickTask = useCallback(async (topicId: string, date: string) => {
    if (!user) return;
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    const freeSlots = getFreeSlots(dayOfWeek, routineBlocks);
    const dayTasks = scheduledTasks.filter(t => t.date === date);

    if (dayTasks.length >= 5) {
      toast.error('Day is already full (max 5 sessions). Choose another day.');
      return;
    }

    // Use findAvailableSlot-like logic: find a slot that doesn't conflict with existing tasks or routine
    for (const slot of freeSlots) {
      const slotStart = timeToMinutes(slot.start);
      const slotEnd = timeToMinutes(slot.end);
      let cursor = slotStart;

      while (cursor + 45 <= slotEnd) {
        const candidateEnd = cursor + 45;
        const hasConflict = dayTasks.some(t => {
          const tStart = timeToMinutes(t.start_time);
          const tEnd = timeToMinutes(t.end_time);
          return cursor < tEnd + 15 && candidateEnd > tStart - 15;
        });

        if (!hasConflict) {
          const { data, error } = await supabase.from('scheduled_tasks').insert({
            user_id: user.id, topic_id: topicId, subject_id: topic.subject_id,
            date, start_time: minutesToTime(cursor), end_time: minutesToTime(candidateEnd),
            status: 'scheduled', is_revision: false, revision_count: 0,
          }).select().single();
          if (error) { toast.error('Failed to add task'); return; }
          if (data) setScheduledTasks(prev => [...prev, data as any]);
          toast.success('Quick task added!');
          return;
        }
        cursor += 15;
      }
    }
    toast.error('No free slot available for this day');
  }, [user, topics, scheduledTasks, routineBlocks]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value: AppContextType = {
    user, subjects, topics, routineBlocks, examDates, scheduledTasks,
    dailyStats, streak, awards, loading,
    addSubject, removeSubject, addTopic, updateTopic, removeTopic,
    addRoutineBlock, removeRoutineBlock, addExamDate, removeExamDate,
    markTask, generateNewSchedule, addQuickTask, refreshData, signOut,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
