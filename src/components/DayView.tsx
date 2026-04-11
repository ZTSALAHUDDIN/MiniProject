import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatTime, timeToMinutes } from '@/lib/scheduler';
import { cn } from '@/lib/utils';
import { Check, X, AlertTriangle, Moon, GraduationCap, UtensilsCrossed, Bus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HOUR_HEIGHT = 60; // px per hour
const START_HOUR = 6;
const END_HOUR = 24;

const ROUTINE_ICONS: Record<string, React.ReactNode> = {
  sleep: <Moon className="w-3 h-3" />,
  college: <GraduationCap className="w-3 h-3" />,
  meal: <UtensilsCrossed className="w-3 h-3" />,
  commute: <Bus className="w-3 h-3" />,
  other: <Clock className="w-3 h-3" />,
};

const ROUTINE_COLORS: Record<string, string> = {
  sleep: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-700 dark:text-indigo-300',
  college: 'bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300',
  meal: 'bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300',
  commute: 'bg-slate-500/20 border-slate-500/30 text-slate-700 dark:text-slate-300',
  other: 'bg-gray-500/20 border-gray-500/30 text-gray-700 dark:text-gray-300',
};

interface DayViewProps {
  date: Date;
}

export function DayView({ date }: DayViewProps) {
  const { scheduledTasks, routineBlocks, topics, subjects, markTask } = useApp();
  const dateStr = date.toISOString().split('T')[0];
  const dayOfWeek = date.getDay();

  const dayRoutine = useMemo(() =>
    routineBlocks
      .filter(b => b.days.includes(dayOfWeek))
      .map(b => ({
        ...b,
        startMin: timeToMinutes(b.start_time),
        endMin: timeToMinutes(b.end_time),
      }))
      .sort((a, b) => a.startMin - b.startMin),
  [routineBlocks, dayOfWeek]);

  const dayTasks = useMemo(() =>
    scheduledTasks
      .filter(t => t.date === dateStr)
      .map(t => ({
        ...t,
        startMin: timeToMinutes(t.start_time),
        endMin: timeToMinutes(t.end_time),
        topic: topics.find(tp => tp.id === t.topic_id),
        subject: subjects.find(s => s.id === t.subject_id),
      }))
      .sort((a, b) => a.startMin - b.startMin),
  [scheduledTasks, dateStr, topics, subjects]);

  const nowMinutes = useMemo(() => {
    const now = new Date();
    return dateStr === now.toISOString().split('T')[0] ? now.getHours() * 60 + now.getMinutes() : -1;
  }, [dateStr]);

  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

  const getTop = (min: number) => ((min - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const getHeight = (startMin: number, endMin: number) => ((endMin - startMin) / 60) * HOUR_HEIGHT;

  return (
    <div className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
      <div className="p-4 border-b border-border/50">
        <h3 className="font-heading font-semibold text-foreground">
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {dayTasks.length} study sessions · {dayRoutine.length} routine blocks
        </p>
      </div>

      <div className="relative overflow-y-auto max-h-[600px]" style={{ height: totalHeight + 20 }}>
        {/* Hour lines */}
        {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => {
          const hour = START_HOUR + i;
          return (
            <div key={hour} className="absolute left-0 right-0 flex items-start" style={{ top: getTop(hour * 60) }}>
              <span className="text-[10px] text-muted-foreground w-12 text-right pr-2 -mt-1.5 flex-shrink-0">
                {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
              </span>
              <div className="flex-1 border-t border-border/30" />
            </div>
          );
        })}

        {/* Now line */}
        {nowMinutes >= START_HOUR * 60 && nowMinutes <= END_HOUR * 60 && (
          <div className="absolute left-12 right-0 z-30 flex items-center" style={{ top: getTop(nowMinutes) }}>
            <div className="w-2 h-2 rounded-full bg-destructive -ml-1" />
            <div className="flex-1 border-t-2 border-destructive" />
          </div>
        )}

        {/* Routine blocks */}
        {dayRoutine.map(block => {
          const startMin = Math.max(block.startMin, START_HOUR * 60);
          const endMin = Math.min(block.endMin, END_HOUR * 60);
          if (endMin <= startMin) return null;
          return (
            <div
              key={block.id}
              className={cn(
                'absolute left-14 right-2 rounded-lg border px-2 py-1 z-10 overflow-hidden',
                ROUTINE_COLORS[block.type] || ROUTINE_COLORS.other,
              )}
              style={{ top: getTop(startMin), height: Math.max(getHeight(startMin, endMin), 20) }}
            >
              <div className="flex items-center gap-1.5">
                {ROUTINE_ICONS[block.type] || ROUTINE_ICONS.other}
                <span className="text-[11px] font-medium truncate">{block.label}</span>
              </div>
              {getHeight(startMin, endMin) >= 30 && (
                <span className="text-[10px] opacity-70">
                  {formatTime(block.start_time)} – {formatTime(block.end_time)}
                </span>
              )}
            </div>
          );
        })}

        {/* Study sessions */}
        {dayTasks.map(task => {
          const startMin = Math.max(task.startMin, START_HOUR * 60);
          const endMin = Math.min(task.endMin, END_HOUR * 60);
          if (endMin <= startMin) return null;
          return (
            <div
              key={task.id}
              className={cn(
                'absolute left-14 right-2 rounded-lg border-l-4 px-2 py-1 z-20 bg-card shadow-sm border border-border/50 overflow-hidden',
                task.status === 'completed' && 'opacity-60 border-l-success',
                task.status === 'missed' && 'opacity-60 border-l-destructive',
                task.status === 'difficult' && 'border-l-warning',
                task.status === 'scheduled' && 'border-l-primary',
              )}
              style={{
                top: getTop(startMin),
                height: Math.max(getHeight(startMin, endMin), 28),
                left: '4.5rem',
                right: '0.5rem',
              }}
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {task.subject && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: task.subject.color }} />
                  )}
                  <span className="text-[11px] font-semibold truncate text-card-foreground">
                    {task.topic?.name || 'Unknown'}
                  </span>
                  {task.is_revision && (
                    <span className="text-[9px] bg-accent/20 text-accent px-1 rounded">R{task.revision_count}</span>
                  )}
                </div>
                {task.status === 'scheduled' && (
                  <div className="flex gap-0.5 flex-shrink-0">
                    <button className="p-0.5 text-success hover:bg-success/10 rounded" onClick={() => markTask(task.id, 'completed')}>
                      <Check className="w-3 h-3" />
                    </button>
                    <button className="p-0.5 text-destructive hover:bg-destructive/10 rounded" onClick={() => markTask(task.id, 'missed')}>
                      <X className="w-3 h-3" />
                    </button>
                    <button className="p-0.5 text-warning hover:bg-warning/10 rounded" onClick={() => markTask(task.id, 'difficult')}>
                      <AlertTriangle className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {task.status !== 'scheduled' && (
                  <span className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0',
                    task.status === 'completed' && 'bg-success/10 text-success',
                    task.status === 'missed' && 'bg-destructive/10 text-destructive',
                    task.status === 'difficult' && 'bg-warning/10 text-warning',
                  )}>
                    {task.status}
                  </span>
                )}
              </div>
              {getHeight(startMin, endMin) >= 30 && (
                <span className="text-[10px] text-muted-foreground">
                  {formatTime(task.start_time)} – {formatTime(task.end_time)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
