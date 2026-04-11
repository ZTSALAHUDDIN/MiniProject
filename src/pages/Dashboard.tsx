import { useMemo, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { LiveClock } from '@/components/LiveClock';
import { StatCard } from '@/components/StatCard';
import { TaskCard } from '@/components/TaskCard';
import { DailyOverview } from '@/components/DailyOverview';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Clock, Flame, Trophy, BookOpen, TrendingUp, Zap, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useNotifications } from '@/hooks/useNotifications';

export default function Dashboard() {
  const { scheduledTasks, topics, subjects, streak, awards, generateNewSchedule, examDates } = useApp();
  const navigate = useNavigate();
  const { requestPermission } = useNotifications(scheduledTasks);
  const today = new Date().toISOString().split('T')[0];

  const todayTasks = scheduledTasks
    .filter(t => t.date === today)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const completedToday = todayTasks.filter(t => t.status === 'completed').length;
  const missedToday = todayTasks.filter(t => t.status === 'missed').length;
  const scheduledToday = todayTasks.filter(t => t.status === 'scheduled').length;
  const todayProgress = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;

  const totalCompleted = scheduledTasks.filter(t => t.status === 'completed').length;
  const totalMinutes = scheduledTasks
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => {
      const [sh, sm] = t.start_time.split(':').map(Number);
      const [eh, em] = t.end_time.split(':').map(Number);
      return sum + (eh * 60 + em) - (sh * 60 + sm);
    }, 0);
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

  // Weekly progress data
  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayTasks = scheduledTasks.filter(t => t.date === dateStr);
      data.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        completed: dayTasks.filter(t => t.status === 'completed').length,
        missed: dayTasks.filter(t => t.status === 'missed').length,
        total: dayTasks.length,
      });
    }
    return data;
  }, [scheduledTasks]);

  // Subject progress (topics completed / total)
  const subjectProgress = useMemo(() => {
    return subjects.map(s => {
      const subTopics = topics.filter(t => t.subject_id === s.id);
      const completed = subTopics.filter(t => t.status === 'completed').length;
      const exam = examDates.find(e => e.subject_id === s.id);
      const daysLeft = exam ? Math.max(0, Math.ceil((new Date(exam.exam_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
      return {
        name: s.name, color: s.color, total: subTopics.length,
        completed, progress: subTopics.length > 0 ? Math.round((completed / subTopics.length) * 100) : 0,
        daysLeft,
      };
    });
  }, [subjects, topics, examDates]);

  // Task status pie data
  const statusData = useMemo(() => {
    const c = scheduledTasks.filter(t => t.status === 'completed').length;
    const m = scheduledTasks.filter(t => t.status === 'missed').length;
    const s = scheduledTasks.filter(t => t.status === 'scheduled').length;
    const d = scheduledTasks.filter(t => t.status === 'difficult').length;
    return [
      { name: 'Completed', value: c, color: 'hsl(145, 60%, 42%)' },
      { name: 'Missed', value: m, color: 'hsl(0, 72%, 55%)' },
      { name: 'Scheduled', value: s, color: 'hsl(175, 60%, 40%)' },
      { name: 'Difficult', value: d, color: 'hsl(35, 90%, 55%)' },
    ].filter(d => d.value > 0);
  }, [scheduledTasks]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Your study overview at a glance</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={requestPermission}
            title="Enable study reminders"
          >
            <Bell className="w-4 h-4 mr-2" />
            Reminders
          </Button>
          <Button
            onClick={generateNewSchedule}
            className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition-opacity"
            disabled={topics.length === 0}
          >
            <Zap className="w-4 h-4 mr-2" />
            Generate Schedule
          </Button>
        </div>
      </div>

      {/* Today's Progress Banner */}
      {todayTasks.length > 0 && (
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-foreground">Today's Progress</h3>
            <span className="text-2xl font-heading font-bold text-primary">{todayProgress}%</span>
          </div>
          <Progress value={todayProgress} className="h-3" />
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> {completedToday} done</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> {missedToday} missed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> {scheduledToday} remaining</span>
          </div>
        </div>
      )}

      {/* Daily Action Guide */}
      <DailyOverview />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Tasks" value={`${completedToday}/${todayTasks.length}`} subtitle={`${scheduledToday} remaining`} icon={<CheckCircle2 className="w-5 h-5" />} variant="primary" />
        <StatCard title="Current Streak" value={`${streak.current_streak}🔥`} subtitle={`Best: ${streak.longest_streak} days`} icon={<Flame className="w-5 h-5" />} variant="warning" />
        <StatCard title="Total Hours" value={totalHours} subtitle={`${totalCompleted} sessions done`} icon={<Clock className="w-5 h-5" />} variant="success" />
        <StatCard title="Awards" value={awards.length} subtitle={`of ${12} total`} icon={<Trophy className="w-5 h-5" />} variant="default" />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-heading font-semibold text-lg text-foreground">Today's Schedule</h2>
          {todayTasks.length > 0 ? (
            <div className="space-y-3">
              {todayTasks.map(task => (
                <TaskCard key={task.id} taskId={task.id} />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-8 shadow-card border border-border/50 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No tasks scheduled for today</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                {topics.length === 0
                  ? 'Add subjects and topics first, then generate a schedule'
                  : 'Click "Generate Schedule" to create your study plan'}
              </p>
              {topics.length === 0 && (
                <Button variant="outline" className="mt-4" onClick={() => navigate('/subjects')}>
                  Add Subjects
                </Button>
              )}
            </div>
          )}

          {/* Weekly Activity Chart */}
          {scheduledTasks.length > 0 && (
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/50 mt-4">
              <h3 className="font-heading font-semibold text-foreground mb-4">This Week's Activity</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'hsl(210, 10%, 50%)' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(210, 15%, 90%)', fontSize: '12px' }} />
                  <Bar dataKey="completed" fill="hsl(145, 60%, 42%)" radius={[4, 4, 0, 0]} name="Completed" />
                  <Bar dataKey="missed" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} name="Missed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Clock */}
          <div className="bg-card rounded-xl p-6 shadow-card border border-border/50">
            <LiveClock />
          </div>

          {/* Subject Progress */}
          {subjectProgress.length > 0 && (
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
              <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Subject Progress</h3>
              <div className="space-y-4">
                {subjectProgress.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-foreground flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </span>
                      <span className="text-muted-foreground">
                        {s.completed}/{s.total} topics
                        {s.daysLeft !== null && <span className="ml-1 text-warning">({s.daysLeft}d left)</span>}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${s.progress}%`, backgroundColor: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Task Status Breakdown */}
          {statusData.length > 0 && (
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
              <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Overall Status</h3>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={38} innerRadius={22}>
                        {statusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1.5 flex-1">
                  {statusData.map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-muted-foreground">{d.name}</span>
                      </span>
                      <span className="font-medium text-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
            <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subjects</span>
                <span className="font-medium text-foreground">{subjects.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Topics</span>
                <span className="font-medium text-foreground">{topics.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Study Days</span>
                <span className="font-medium text-foreground">{streak.total_study_days}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Missed Tasks</span>
                <span className="font-medium text-destructive">
                  {scheduledTasks.filter(t => t.status === 'missed').length}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Awards */}
          {awards.length > 0 && (
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
              <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Recent Awards</h3>
              <div className="space-y-2">
                {awards.slice(-3).reverse().map(award => (
                  <div key={award.id} className="flex items-center gap-3 text-sm">
                    <span className="text-xl">{award.icon}</span>
                    <div>
                      <p className="font-medium text-foreground">{award.title}</p>
                      <p className="text-xs text-muted-foreground">{award.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
