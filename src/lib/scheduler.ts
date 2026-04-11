import { Topic, RoutineBlock, ScheduledTask, TimeSlot, ExamDate } from './types';

// Calculate priority score: higher = needs more attention
export function calculatePriority(topic: Topic, examDate?: ExamDate): number {
  const difficultyWeight = 0.35;
  const importanceWeight = 0.35;
  const confidenceWeight = 0.3;

  let score = (topic.difficulty * difficultyWeight) +
              (topic.importance * importanceWeight) +
              ((6 - topic.confidence) * confidenceWeight);

  if (examDate) {
    const daysUntilExam = Math.max(1, Math.ceil(
      (new Date(examDate.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    ));
    if (daysUntilExam <= 3) score *= 2.0;
    else if (daysUntilExam <= 7) score *= 1.5;
    else if (daysUntilExam <= 14) score *= 1.2;
  }

  if (topic.status === 'completed') score *= 0.3;

  return Math.round(score * 100) / 100;
}

// Get free time slots for a given day, strictly avoiding routine blocks
export function getFreeSlots(dayOfWeek: number, routineBlocks: RoutineBlock[]): TimeSlot[] {
  const dayBlocks = routineBlocks
    .filter(b => b.days.includes(dayOfWeek))
    .map(b => ({ start: timeToMinutes(b.start_time), end: timeToMinutes(b.end_time) }))
    .sort((a, b) => a.start - b.start);

  // Merge overlapping routine blocks
  const merged: { start: number; end: number }[] = [];
  for (const block of dayBlocks) {
    if (merged.length > 0 && block.start <= merged[merged.length - 1].end) {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, block.end);
    } else {
      merged.push({ ...block });
    }
  }

  const slots: TimeSlot[] = [];
  const dayStart = timeToMinutes('07:00');
  const dayEnd = timeToMinutes('23:00');

  let current = dayStart;
  for (const block of merged) {
    if (block.start > current) {
      const gap = block.start - current;
      if (gap >= 30) {
        slots.push({ start: minutesToTime(current), end: minutesToTime(block.start) });
      }
    }
    current = Math.max(current, block.end);
  }
  if (dayEnd > current && (dayEnd - current) >= 30) {
    slots.push({ start: minutesToTime(current), end: minutesToTime(dayEnd) });
  }

  return slots;
}

// Check if a time range overlaps with any routine block
function overlapsWith(startMin: number, endMin: number, routineBlocks: RoutineBlock[], dayOfWeek: number): boolean {
  return routineBlocks
    .filter(b => b.days.includes(dayOfWeek))
    .some(b => {
      const bStart = timeToMinutes(b.start_time);
      const bEnd = timeToMinutes(b.end_time);
      return startMin < bEnd && endMin > bStart;
    });
}

// Find a non-overlapping slot for a task within free slots, avoiding existing tasks
function findAvailableSlot(
  freeSlots: TimeSlot[],
  existingTasks: { start_time: string; end_time: string }[],
  duration: number,
  breakDuration: number = 15
): { start: string; end: string } | null {
  for (const slot of freeSlots) {
    const slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);
    let cursor = slotStart;

    while (cursor + duration <= slotEnd) {
      const candidateEnd = cursor + duration;
      // Check no overlap with existing tasks (with break buffer)
      const hasConflict = existingTasks.some(t => {
        const tStart = timeToMinutes(t.start_time);
        const tEnd = timeToMinutes(t.end_time);
        return cursor < tEnd + breakDuration && candidateEnd > tStart - breakDuration;
      });

      if (!hasConflict) {
        return { start: minutesToTime(cursor), end: minutesToTime(candidateEnd) };
      }
      cursor += 15; // Try next 15-min increment
    }
  }
  return null;
}

// Generate study sessions for a range of days
export function generateSchedule(
  topics: Topic[],
  routineBlocks: RoutineBlock[],
  examDates: ExamDate[],
  existingTasks: ScheduledTask[],
  startDate: Date,
  days: number = 7,
): ScheduledTask[] {
  const tasks: ScheduledTask[] = [];
  const activeTopics = topics.filter(t => t.status !== 'completed');

  const prioritized = activeTopics
    .map(t => ({
      ...t,
      priority_score: calculatePriority(t, examDates.find(e => e.subject_id === t.subject_id)),
    }))
    .sort((a, b) => b.priority_score - a.priority_score);

  for (let d = 0; d < days; d++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();

    const freeSlots = getFreeSlots(dayOfWeek, routineBlocks);
    if (freeSlots.length === 0) continue;

    const dayExisting = existingTasks.filter(t => t.date === dateStr);
    const dayTasks = [...tasks.filter(t => t.date === dateStr)];
    const totalExisting = dayExisting.length + dayTasks.length;

    // Max 4 sessions per day for balanced distribution
    const maxSessions = Math.min(4, Math.max(0, 4 - totalExisting));
    if (maxSessions === 0) continue;

    let sessionsAdded = 0;
    const allDayTaskSlots = [...dayExisting, ...dayTasks];

    for (const topic of prioritized) {
      if (sessionsAdded >= maxSessions) break;

      // Don't schedule same topic twice on same day
      const alreadyToday = dayTasks.some(t => t.topic_id === topic.id) ||
                           dayExisting.some(t => t.topic_id === topic.id);
      if (alreadyToday) continue;

      // Session duration: 45-60 min based on difficulty, with proper breaks
      const sessionDuration = topic.difficulty >= 4 ? 60 : 45;

      const found = findAvailableSlot(freeSlots, allDayTaskSlots, sessionDuration, 15);
      if (!found) continue;

      // Double-check no routine overlap
      if (overlapsWith(timeToMinutes(found.start), timeToMinutes(found.end), routineBlocks, dayOfWeek)) continue;

      const task: ScheduledTask = {
        id: `gen-${dateStr}-${topic.id}-${sessionsAdded}`,
        topic_id: topic.id,
        subject_id: topic.subject_id,
        date: dateStr,
        start_time: found.start,
        end_time: found.end,
        status: 'scheduled',
        is_revision: false,
        revision_count: 0,
        created_at: new Date().toISOString(),
        user_id: '',
      };

      tasks.push(task);
      dayTasks.push(task);
      allDayTaskSlots.push(task);
      sessionsAdded++;
    }
  }

  const revisionTasks = addSpacedRevision(tasks, prioritized, routineBlocks, existingTasks, startDate, days);
  return [...tasks, ...revisionTasks];
}

function addSpacedRevision(
  existingNewTasks: ScheduledTask[],
  topics: Topic[],
  routineBlocks: RoutineBlock[],
  existingTasks: ScheduledTask[],
  startDate: Date,
  days: number
): ScheduledTask[] {
  const revisionTasks: ScheduledTask[] = [];
  const intervals = [1, 3, 7];

  for (const task of existingNewTasks.slice(0, 8)) {
    for (const interval of intervals) {
      const revDate = new Date(task.date);
      revDate.setDate(revDate.getDate() + interval);
      const revDateStr = revDate.toISOString().split('T')[0];

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days);
      if (revDate > endDate) continue;

      const dayOfWeek = revDate.getDay();
      const freeSlots = getFreeSlots(dayOfWeek, routineBlocks);

      const allDayTasks = [
        ...existingTasks.filter(t => t.date === revDateStr),
        ...existingNewTasks.filter(t => t.date === revDateStr),
        ...revisionTasks.filter(t => t.date === revDateStr),
      ];

      if (allDayTasks.length >= 5) continue;

      const found = findAvailableSlot(freeSlots, allDayTasks, 30, 10);
      if (!found) continue;

      if (overlapsWith(timeToMinutes(found.start), timeToMinutes(found.end), routineBlocks, dayOfWeek)) continue;

      revisionTasks.push({
        id: `rev-${revDateStr}-${task.topic_id}-${interval}`,
        topic_id: task.topic_id,
        subject_id: task.subject_id,
        date: revDateStr,
        start_time: found.start,
        end_time: found.end,
        status: 'scheduled',
        is_revision: true,
        revision_count: intervals.indexOf(interval) + 1,
        created_at: new Date().toISOString(),
        user_id: '',
      });
    }
  }

  return revisionTasks;
}

// Handle missed task: reschedule to next available slot
export function rescheduleMissedTask(
  task: ScheduledTask,
  routineBlocks: RoutineBlock[],
  existingTasks: ScheduledTask[]
): ScheduledTask | null {
  for (let d = 1; d <= 3; d++) {
    const newDate = new Date(task.date);
    newDate.setDate(newDate.getDate() + d);
    const dateStr = newDate.toISOString().split('T')[0];
    const dayOfWeek = newDate.getDay();

    const freeSlots = getFreeSlots(dayOfWeek, routineBlocks);
    const dayTasks = existingTasks.filter(t => t.date === dateStr);
    if (dayTasks.length >= 5) continue;

    const found = findAvailableSlot(freeSlots, dayTasks, 45, 15);
    if (found) {
      return {
        ...task,
        id: `resched-${dateStr}-${task.topic_id}`,
        date: dateStr,
        start_time: found.start,
        end_time: found.end,
        status: 'scheduled',
      };
    }
  }
  return null;
}

// Schedule extra revision for difficult topics
export function scheduleExtraRevision(
  task: ScheduledTask,
  routineBlocks: RoutineBlock[],
  existingTasks: ScheduledTask[]
): ScheduledTask | null {
  // Add revision 2 days later
  const revDate = new Date(task.date);
  revDate.setDate(revDate.getDate() + 2);
  const dateStr = revDate.toISOString().split('T')[0];
  const dayOfWeek = revDate.getDay();

  const freeSlots = getFreeSlots(dayOfWeek, routineBlocks);
  const dayTasks = existingTasks.filter(t => t.date === dateStr);
  if (dayTasks.length >= 5) return null;

  const found = findAvailableSlot(freeSlots, dayTasks, 30, 10);
  if (!found) return null;

  return {
    ...task,
    id: `extra-rev-${dateStr}-${task.topic_id}`,
    date: dateStr,
    start_time: found.start,
    end_time: found.end,
    status: 'scheduled',
    is_revision: true,
    revision_count: (task.revision_count || 0) + 1,
  };
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}
