import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { TaskCard } from '@/components/TaskCard';
import { DayView } from '@/components/DayView';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Plus, Zap, Calendar, CheckCircle2, LayoutGrid, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function SchedulePage() {
  const { scheduledTasks, topics, subjects, generateNewSchedule, addQuickTask } = useApp();
  const [weekOffset, setWeekOffset] = useState(0);
  const [quickTaskOpen, setQuickTaskOpen] = useState(false);
  const [quickTopicId, setQuickTopicId] = useState('');
  const [quickDate, setQuickDate] = useState('');
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + (weekOffset * 7));
    d.setHours(0, 0, 0, 0);
    return d;
  }, [weekOffset]);

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    }),
  [weekStart]);

  const today = new Date().toISOString().split('T')[0];

  const weekStats = useMemo(() => {
    const weekDates = weekDays.map(d => d.toISOString().split('T')[0]);
    const weekTasks = scheduledTasks.filter(t => weekDates.includes(t.date));
    const completed = weekTasks.filter(t => t.status === 'completed').length;
    const total = weekTasks.length;
    return { completed, total, progress: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [weekDays, scheduledTasks]);

  const handleQuickAdd = () => {
    if (!quickTopicId || !quickDate) return;
    addQuickTask(quickTopicId, quickDate);
    setQuickTaskOpen(false);
    setQuickTopicId('');
    setQuickDate('');
  };

  const selectedDay = weekDays[selectedDayIndex];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Schedule</h1>
          <p className="text-muted-foreground text-sm mt-1">Your weekly study plan</p>
        </div>
        <div className="flex gap-2">
          {/* View toggle */}
          <div className="flex bg-muted rounded-lg p-0.5">
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
              className={cn('h-8', viewMode === 'week' && 'gradient-primary text-primary-foreground')}
            >
              <LayoutGrid className="w-4 h-4 mr-1" />Week
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className={cn('h-8', viewMode === 'day' && 'gradient-primary text-primary-foreground')}
            >
              <CalendarDays className="w-4 h-4 mr-1" />Day
            </Button>
          </div>

          <Dialog open={quickTaskOpen} onOpenChange={setQuickTaskOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={topics.length === 0}>
                <Plus className="w-4 h-4 mr-2" />Quick Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Quick Task</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Topic</Label>
                  <Select value={quickTopicId} onValueChange={setQuickTopicId}>
                    <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                    <SelectContent>
                      {topics.map(t => {
                        const s = subjects.find(s => s.id === t.subject_id);
                        return <SelectItem key={t.id} value={t.id}>{s?.name} – {t.name}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={quickDate} onChange={e => setQuickDate(e.target.value)} />
                </div>
                <Button onClick={handleQuickAdd} className="w-full gradient-primary text-primary-foreground">Add Task</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={generateNewSchedule} className="gradient-primary text-primary-foreground shadow-glow" disabled={topics.length === 0}>
            <Zap className="w-4 h-4 mr-2" />Generate
          </Button>
        </div>
      </div>

      {/* Week Navigation + Summary */}
      <div className="bg-card rounded-xl p-4 shadow-card border border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset(p => p - 1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <p className="font-heading font-semibold text-foreground">
              {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            {weekOffset !== 0 && (
              <button onClick={() => setWeekOffset(0)} className="text-xs text-primary hover:underline">Today</button>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setWeekOffset(p => p + 1)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Day selector for day view */}
        {viewMode === 'day' && (
          <div className="flex gap-1 justify-center">
            {weekDays.map((day, i) => {
              const dateStr = day.toISOString().split('T')[0];
              const isToday = dateStr === today;
              const dayTaskCount = scheduledTasks.filter(t => t.date === dateStr).length;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDayIndex(i)}
                  className={cn(
                    'flex flex-col items-center px-3 py-2 rounded-lg transition-all text-xs',
                    selectedDayIndex === i
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : isToday
                        ? 'bg-primary/10 text-primary hover:bg-primary/20'
                        : 'hover:bg-muted text-muted-foreground',
                  )}
                >
                  <span className="font-medium">{DAYS[day.getDay()]}</span>
                  <span className="text-lg font-heading font-bold">{day.getDate()}</span>
                  {dayTaskCount > 0 && (
                    <span className="text-[9px] mt-0.5">{dayTaskCount} tasks</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {weekStats.total > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Week progress</span>
              <span className="font-medium text-foreground">{weekStats.completed}/{weekStats.total} ({weekStats.progress}%)</span>
            </div>
            <Progress value={weekStats.progress} className="h-2" />
          </div>
        )}
      </div>

      {/* Day View */}
      {viewMode === 'day' && selectedDay && (
        <DayView date={selectedDay} />
      )}

      {/* Week Grid */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
          {weekDays.map((day, i) => {
            const dateStr = day.toISOString().split('T')[0];
            const isToday = dateStr === today;
            const isPast = dateStr < today;
            const dayTasks = scheduledTasks
              .filter(t => t.date === dateStr)
              .sort((a, b) => a.start_time.localeCompare(b.start_time));
            const dayCompleted = dayTasks.filter(t => t.status === 'completed').length;
            const dayProgress = dayTasks.length > 0 ? Math.round((dayCompleted / dayTasks.length) * 100) : 0;

            return (
              <div
                key={i}
                className={cn(
                  'bg-card rounded-xl p-3 shadow-card border transition-all min-h-[120px] cursor-pointer hover:shadow-md',
                  isToday ? 'border-primary/40 shadow-glow ring-1 ring-primary/20' : 'border-border/50',
                  isPast && !isToday && 'opacity-75',
                )}
                onClick={() => { setViewMode('day'); setSelectedDayIndex(i); }}
              >
                <div className="text-center mb-2">
                  <p className="text-xs text-muted-foreground font-medium">{DAYS[day.getDay()]}</p>
                  <p className={cn('text-lg font-heading font-bold', isToday ? 'text-primary' : 'text-foreground')}>
                    {day.getDate()}
                  </p>
                  {dayTasks.length > 0 && (
                    <div className="h-1 bg-muted rounded-full overflow-hidden mt-1 mx-2">
                      <div className="h-full bg-success rounded-full transition-all" style={{ width: `${dayProgress}%` }} />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {dayTasks.length === 0 && (
                    <p className="text-xs text-muted-foreground/50 text-center">No tasks</p>
                  )}
                  {dayTasks.map(task => (
                    <TaskCard key={task.id} taskId={task.id} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {scheduledTasks.length === 0 && (
        <div className="bg-card rounded-xl p-8 shadow-card border border-border/50 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No schedule generated yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Add subjects, topics, and your routine first, then generate a schedule</p>
        </div>
      )}
    </div>
  );
}
