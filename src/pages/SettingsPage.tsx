import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function SettingsPage() {
  const { subjects, topics, routineBlocks, scheduledTasks, user, signOut } = useApp();

  const handleClearSchedule = async () => {
    if (!user) return;
    const { error } = await supabase.from('scheduled_tasks').delete().eq('user_id', user.id);
    if (error) { toast.error('Failed to clear schedule'); return; }
    toast.success('Schedule cleared');
    window.location.reload();
  };

  const handleClearAll = async () => {
    if (!user) return;
    await Promise.all([
      supabase.from('scheduled_tasks').delete().eq('user_id', user.id),
      supabase.from('daily_stats').delete().eq('user_id', user.id),
      supabase.from('awards').delete().eq('user_id', user.id),
      supabase.from('streaks').update({ current_streak: 0, longest_streak: 0, total_study_days: 0, last_active_date: null }).eq('user_id', user.id),
    ]);
    await Promise.all([
      supabase.from('exam_dates').delete().eq('user_id', user.id),
      supabase.from('topics').delete().eq('user_id', user.id),
    ]);
    await supabase.from('subjects').delete().eq('user_id', user.id);
    await supabase.from('routine_blocks').delete().eq('user_id', user.id);
    toast.success('All data reset');
    window.location.reload();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your data and preferences</p>
      </div>

      {/* Account */}
      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <h3 className="font-heading font-semibold text-foreground mb-4">Account</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="text-foreground font-medium">{user?.email}</span></div>
        </div>
        <Button variant="outline" className="mt-4" onClick={signOut}>
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>

      {/* Data Summary */}
      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <h3 className="font-heading font-semibold text-foreground mb-4">Data Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subjects</span><span className="text-foreground font-medium">{subjects.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Topics</span><span className="text-foreground font-medium">{topics.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Routine Blocks</span><span className="text-foreground font-medium">{routineBlocks.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Scheduled Tasks</span><span className="text-foreground font-medium">{scheduledTasks.length}</span></div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50 space-y-4">
        <h3 className="font-heading font-semibold text-foreground">Actions</h3>
        <div className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={handleClearSchedule}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Schedule (keep subjects & routine)
          </Button>
          <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10" onClick={handleClearAll}>
            <Trash2 className="w-4 h-4 mr-2" />
            Reset Everything
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
        <h3 className="font-heading font-semibold text-foreground mb-2">About StudyFlow</h3>
        <p className="text-sm text-muted-foreground">
          Smart Revision Scheduler — an intelligent assistant that plans, tracks, and adapts your study schedule using rule-based logic. All data synced to cloud.
        </p>
        <p className="text-xs text-muted-foreground/70 mt-2">Version 2.0 · Cloud Synced</p>
      </div>
    </div>
  );
}
