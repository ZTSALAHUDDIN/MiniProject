import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { formatTime } from '@/lib/scheduler';
import { cn } from '@/lib/utils';
import { CalendarClock, CheckCircle2, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function DailyOverview() {
  const { scheduledTasks, topics, subjects, routineBlocks } = useApp();
  const navigate = useNavigate();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayTasks = useMemo(() =>
    scheduledTasks
      .filter(t => t.date === today)
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .map(t => ({
        ...t,
        topic: topics.find(tp => tp.id === t.topic_id),
        subject: subjects.find(s => s.id === t.subject_id),
      })),
  [scheduledTasks, today, topics, subjects]);

  const pending = todayTasks.filter(t => t.status === 'scheduled');
  const completed = todayTasks.filter(t => t.status === 'completed');
  const nextTask = pending.find(t => {
    const [h, m] = t.start_time.split(':').map(Number);
    return h * 60 + m >= currentMinutes;
  });

  // Tomorrow preview
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const tomorrowTasks = scheduledTasks.filter(t => t.date === tomorrowStr && t.status === 'scheduled');

  if (todayTasks.length === 0 && tomorrowTasks.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-primary/5 via-card to-accent/5 rounded-xl p-5 shadow-card border border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-5 h-5 text-primary" />
          <h3 className="font-heading font-semibold text-foreground">Daily Action Guide</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/schedule')} className="text-xs text-primary">
          Full Schedule <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-card/80 rounded-lg border border-border/30">
          <p className="text-2xl font-heading font-bold text-primary">{pending.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending</p>
        </div>
        <div className="text-center p-3 bg-card/80 rounded-lg border border-border/30">
          <p className="text-2xl font-heading font-bold text-success">{completed.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Done</p>
        </div>
        <div className="text-center p-3 bg-card/80 rounded-lg border border-border/30">
          <p className="text-2xl font-heading font-bold text-foreground">{todayTasks.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
        </div>
      </div>

      {/* Next up */}
      {nextTask && (
        <div className="bg-primary/10 rounded-lg p-3 border border-primary/20 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Next Up</span>
          </div>
          <div className="flex items-center gap-2">
            {nextTask.subject && (
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: nextTask.subject.color }} />
            )}
            <span className="font-heading font-semibold text-sm text-foreground">
              {nextTask.topic?.name || 'Study Session'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {formatTime(nextTask.start_time)} – {formatTime(nextTask.end_time)}
            {nextTask.is_revision && ' · Revision'}
          </p>
        </div>
      )}

      {/* Upcoming tasks list */}
      {pending.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Upcoming Today</p>
          {pending.slice(0, 4).map(t => (
            <div key={t.id} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-md bg-card/60">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.subject?.color || 'hsl(175,60%,40%)' }} />
              <span className="truncate flex-1 text-foreground">{t.topic?.name}</span>
              <span className="text-muted-foreground flex-shrink-0">{formatTime(t.start_time)}</span>
            </div>
          ))}
          {pending.length > 4 && (
            <p className="text-[10px] text-muted-foreground text-center">+{pending.length - 4} more</p>
          )}
        </div>
      )}

      {/* Tomorrow preview */}
      {tomorrowTasks.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Tomorrow: {tomorrowTasks.length} sessions
          </p>
        </div>
      )}
    </div>
  );
}
