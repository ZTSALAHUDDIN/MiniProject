import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
}

export function StatCard({ title, value, subtitle, icon, variant = 'default' }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-xl p-5 shadow-card border border-border/50 animate-fade-in transition-all hover:shadow-elevated',
      variant === 'primary' && 'bg-card border-primary/20',
      variant === 'success' && 'bg-card border-success/20',
      variant === 'warning' && 'bg-card border-warning/20',
      variant === 'destructive' && 'bg-card border-destructive/20',
      variant === 'default' && 'bg-card',
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-heading font-bold mt-1 text-card-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          variant === 'primary' && 'gradient-primary text-primary-foreground',
          variant === 'success' && 'bg-success/10 text-success',
          variant === 'warning' && 'bg-warning/10 text-warning',
          variant === 'destructive' && 'bg-destructive/10 text-destructive',
          variant === 'default' && 'bg-muted text-muted-foreground',
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
