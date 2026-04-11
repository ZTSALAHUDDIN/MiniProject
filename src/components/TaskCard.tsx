import { useApp } from '@/contexts/AppContext';
import { formatTime } from '@/lib/scheduler';
import { cn } from '@/lib/utils';
import { Check, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskCardProps {
  taskId: string;
}

export function TaskCard({ taskId }: TaskCardProps) {
  const { scheduledTasks, topics, subjects, markTask } = useApp();
  const task = scheduledTasks.find(t => t.id === taskId);
  if (!task) return null;

  const topic = topics.find(t => t.id === task.topic_id);
  const subject = subjects.find(s => s.id === task.subject_id);

  return (
    <div className={cn(
      'rounded-xl p-4 shadow-card border border-border/50 bg-card animate-fade-in transition-all',
      task.status === 'completed' && 'opacity-70 border-success/30',
      task.status === 'missed' && 'opacity-70 border-destructive/30',
      task.status === 'difficult' && 'border-warning/30',
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {subject && (
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
            )}
            <span className="text-xs font-medium text-muted-foreground truncate">
              {subject?.name || 'Unknown'}
            </span>
            {task.is_revision && (
              <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                Rev #{task.revision_count}
              </span>
            )}
          </div>
          <p className="font-heading font-semibold text-sm text-card-foreground truncate">
            {topic?.name || 'Unknown Topic'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatTime(task.start_time)} – {formatTime(task.end_time)}
          </p>
        </div>

        {task.status === 'scheduled' && (
          <div className="flex gap-1 flex-shrink-0">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-success hover:bg-success/10"
              onClick={() => markTask(task.id, 'completed')}
              title="Mark completed"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={() => markTask(task.id, 'missed')}
              title="Mark missed"
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-warning hover:bg-warning/10"
              onClick={() => markTask(task.id, 'difficult')}
              title="Mark difficult"
            >
              <AlertTriangle className="w-4 h-4" />
            </Button>
          </div>
        )}

        {task.status !== 'scheduled' && (
          <span className={cn(
            'text-xs px-2 py-1 rounded-full font-medium',
            task.status === 'completed' && 'bg-success/10 text-success',
            task.status === 'missed' && 'bg-destructive/10 text-destructive',
            task.status === 'difficult' && 'bg-warning/10 text-warning',
          )}>
            {task.status}
          </span>
        )}
      </div>
    </div>
  );
}
