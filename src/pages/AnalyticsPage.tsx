import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { StatCard } from '@/components/StatCard';
import { TrendingUp, Clock, Target, CheckCircle2 } from 'lucide-react';

const CHART_COLORS = ['hsl(175, 60%, 40%)', 'hsl(200, 70%, 50%)', 'hsl(145, 60%, 42%)', 'hsl(35, 90%, 55%)', 'hsl(280, 60%, 55%)', 'hsl(340, 65%, 55%)'];

export default function AnalyticsPage() {
  const { scheduledTasks, subjects, topics, streak } = useApp();

  const completedTasks = scheduledTasks.filter(t => t.status === 'completed');
  const missedTasks = scheduledTasks.filter(t => t.status === 'missed');

  const completionRate = scheduledTasks.length > 0
    ? Math.round((completedTasks.length / scheduledTasks.length) * 100)
    : 0;

  const totalMinutes = completedTasks.reduce((sum, t) => {
    const [sh, sm] = t.start_time.split(':').map(Number);
    const [eh, em] = t.end_time.split(':').map(Number);
    return sum + (eh * 60 + em) - (sh * 60 + sm);
  }, 0);

  // Daily study data for the last 7 days
  const dailyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayTasks = scheduledTasks.filter(t => t.date === dateStr);
      const completed = dayTasks.filter(t => t.status === 'completed').length;
      const missed = dayTasks.filter(t => t.status === 'missed').length;
      const minutes = dayTasks
        .filter(t => t.status === 'completed')
        .reduce((sum, t) => {
          const [sh, sm] = t.start_time.split(':').map(Number);
          const [eh, em] = t.end_time.split(':').map(Number);
          return sum + (eh * 60 + em) - (sh * 60 + sm);
        }, 0);

      data.push({
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        completed,
        missed,
        minutes,
      });
    }
    return data;
  }, [scheduledTasks]);

  // Subject distribution
  const subjectData = useMemo(() => {
    return subjects.map(s => ({
      name: s.name,
      value: completedTasks.filter(t => t.subject_id === s.id).length,
      color: s.color,
    })).filter(s => s.value > 0);
  }, [subjects, completedTasks]);

  // Topic priority data
  const topPriorityTopics = useMemo(() => {
    return topics
      .filter(t => t.status !== 'completed')
      .sort((a, b) => b.priority_score - a.priority_score)
      .slice(0, 5)
      .map(t => {
        const s = subjects.find(s => s.id === t.subject_id);
        return { name: t.name, priority: t.priority_score, subject: s?.name || '', color: s?.color || CHART_COLORS[0] };
      });
  }, [topics, subjects]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your study progress and performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Completion Rate" value={`${completionRate}%`} icon={<Target className="w-5 h-5" />} variant="primary" />
        <StatCard title="Total Hours" value={Math.round(totalMinutes / 60 * 10) / 10} icon={<Clock className="w-5 h-5" />} variant="success" />
        <StatCard title="Tasks Done" value={completedTasks.length} icon={<CheckCircle2 className="w-5 h-5" />} variant="default" />
        <StatCard title="Study Days" value={streak.total_study_days} icon={<TrendingUp className="w-5 h-5" />} variant="warning" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h3 className="font-heading font-semibold text-foreground mb-4">Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(210, 10%, 50%)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(210, 10%, 50%)' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(210, 15%, 90%)', fontSize: '12px' }}
              />
              <Bar dataKey="completed" fill="hsl(175, 60%, 40%)" radius={[4, 4, 0, 0]} name="Completed" />
              <Bar dataKey="missed" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} name="Missed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Study Time Trend */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h3 className="font-heading font-semibold text-foreground mb-4">Study Minutes</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(210, 10%, 50%)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(210, 10%, 50%)' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(210, 15%, 90%)', fontSize: '12px' }} />
              <Area type="monotone" dataKey="minutes" stroke="hsl(175, 60%, 40%)" fill="hsl(175, 60%, 40%)" fillOpacity={0.2} name="Minutes" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Distribution */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h3 className="font-heading font-semibold text-foreground mb-4">Subject Distribution</h3>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={subjectData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {subjectData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(210, 15%, 90%)', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
              Complete some tasks to see distribution
            </div>
          )}
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {subjectData.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-muted-foreground">{s.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Ranking */}
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h3 className="font-heading font-semibold text-foreground mb-4">Top Priority Topics</h3>
          {topPriorityTopics.length > 0 ? (
            <div className="space-y-3">
              {topPriorityTopics.map((topic, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-heading font-bold text-muted-foreground w-5">{i + 1}</span>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: topic.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{topic.name}</p>
                    <p className="text-xs text-muted-foreground">{topic.subject}</p>
                  </div>
                  <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full">
                    {topic.priority.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">
              Add topics to see priorities
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
