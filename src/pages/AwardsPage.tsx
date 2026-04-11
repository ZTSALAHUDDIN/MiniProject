import { useApp } from '@/contexts/AppContext';
import { AWARD_DEFINITIONS } from '@/lib/awards';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

export default function AwardsPage() {
  const { awards, scheduledTasks, streak } = useApp();
  const earnedTypes = new Set(awards.map(a => a.type));

  const totalCompleted = scheduledTasks.filter(t => t.status === 'completed').length;
  const totalMinutes = scheduledTasks
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => {
      const [sh, sm] = t.start_time.split(':').map(Number);
      const [eh, em] = t.end_time.split(':').map(Number);
      return sum + (eh * 60 + em) - (sh * 60 + sm);
    }, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Awards & Achievements</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your milestones and earn badges</p>
      </div>

      {/* Streak Banner */}
      <div className="gradient-primary rounded-xl p-6 shadow-glow text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Current Streak</p>
            <p className="text-4xl font-heading font-bold">{streak.current_streak} 🔥</p>
            <p className="text-sm opacity-80 mt-1">Best: {streak.longest_streak} days · {streak.total_study_days} total study days</p>
          </div>
          <Trophy className="w-12 h-12 opacity-30" />
        </div>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50 text-center">
          <p className="text-2xl font-heading font-bold text-foreground">{totalCompleted}</p>
          <p className="text-xs text-muted-foreground">Tasks Done</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50 text-center">
          <p className="text-2xl font-heading font-bold text-foreground">{Math.round(totalMinutes / 60)}</p>
          <p className="text-xs text-muted-foreground">Hours Studied</p>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card border border-border/50 text-center">
          <p className="text-2xl font-heading font-bold text-foreground">{awards.length}/{AWARD_DEFINITIONS.length}</p>
          <p className="text-xs text-muted-foreground">Awards Earned</p>
        </div>
      </div>

      {/* Awards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {AWARD_DEFINITIONS.map(def => {
          const earned = earnedTypes.has(def.type);
          const earnedAward = awards.find(a => a.type === def.type);

          return (
            <div
              key={def.type}
              className={cn(
                'bg-card rounded-xl p-5 shadow-card border text-center transition-all',
                earned
                  ? 'border-primary/30 shadow-glow animate-scale-in'
                  : 'border-border/50 opacity-50 grayscale'
              )}
            >
              <span className="text-4xl block mb-2">{def.icon}</span>
              <p className="font-heading font-semibold text-sm text-foreground">{def.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{def.description}</p>
              {earned && earnedAward && (
                <p className="text-xs text-primary mt-2">
                  {new Date(earnedAward.earned_at).toLocaleDateString()}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
