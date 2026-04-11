import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoutineBlock } from '@/lib/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const BLOCK_TYPES = [
  { value: 'sleep', label: 'Sleep', color: 'bg-muted' },
  { value: 'college', label: 'College/School', color: 'bg-primary/10' },
  { value: 'meal', label: 'Meal', color: 'bg-warning/10' },
  { value: 'commute', label: 'Commute', color: 'bg-accent/10' },
  { value: 'other', label: 'Other', color: 'bg-secondary' },
];

export default function RoutinePage() {
  const { routineBlocks, addRoutineBlock, removeRoutineBlock } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    label: '',
    type: 'other' as RoutineBlock['type'],
    start_time: '09:00',
    end_time: '17:00',
    days: [1, 2, 3, 4, 5] as number[],
  });

  const handleAdd = () => {
    if (!form.label.trim() || form.days.length === 0) return;
    addRoutineBlock(form);
    setForm({ label: '', type: 'other', start_time: '09:00', end_time: '17:00', days: [1, 2, 3, 4, 5] });
    setDialogOpen(false);
  };

  const toggleDay = (day: number) => {
    setForm(p => ({
      ...p,
      days: p.days.includes(day) ? p.days.filter(d => d !== day) : [...p.days, day],
    }));
  };

  // Group blocks by type
  const grouped = BLOCK_TYPES.map(bt => ({
    ...bt,
    blocks: routineBlocks.filter(b => b.type === bt.value),
  })).filter(g => g.blocks.length > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Daily Routine</h1>
          <p className="text-muted-foreground text-sm mt-1">Define your fixed schedule so we only plan study in free time</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />Add Block
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Routine Block</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Label</Label>
                <Input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g., College Classes" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BLOCK_TYPES.map(bt => <SelectItem key={bt.value} value={bt.value}>{bt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start Time</Label>
                  <Input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Days</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DAYS.map((day, i) => (
                    <button
                      key={i}
                      onClick={() => toggleDay(i)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                        form.days.includes(i)
                          ? 'gradient-primary text-primary-foreground border-transparent'
                          : 'bg-muted text-muted-foreground border-border hover:border-primary/30'
                      )}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full gradient-primary text-primary-foreground">Add Block</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {routineBlocks.length === 0 ? (
        <div className="bg-card rounded-xl p-12 shadow-card border border-border/50 text-center">
          <Clock className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium text-lg">No routine blocks set</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Add your sleep, college, and meal times to help us plan around them</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(group => (
            <div key={group.value}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">{group.label}</h3>
              <div className="space-y-2">
                {group.blocks.map(block => (
                  <div key={block.id} className={cn('rounded-xl p-4 shadow-card border border-border/50 bg-card flex items-center justify-between')}>
                    <div>
                      <p className="font-heading font-semibold text-sm text-foreground">{block.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {block.start_time} – {block.end_time} · {block.days.map(d => DAYS[d].slice(0, 3)).join(', ')}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => removeRoutineBlock(block.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visual timeline preview */}
      {routineBlocks.length > 0 && (
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/50">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Today's Timeline</h3>
          <div className="relative h-16">
            <div className="absolute inset-0 bg-success/5 rounded-lg border border-success/20" />
            {/* Time labels */}
            <div className="absolute top-full mt-1 left-0 text-xs text-muted-foreground">7 AM</div>
            <div className="absolute top-full mt-1 right-0 text-xs text-muted-foreground">11 PM</div>
            {/* Blocks */}
            {routineBlocks
              .filter(b => b.days.includes(new Date().getDay()))
              .map(block => {
                const [sh, sm] = block.start_time.split(':').map(Number);
                const [eh, em] = block.end_time.split(':').map(Number);
                const startMin = sh * 60 + sm;
                const endMin = eh * 60 + em;
                const dayStart = 7 * 60;
                const dayEnd = 23 * 60;
                const left = ((startMin - dayStart) / (dayEnd - dayStart)) * 100;
                const width = ((endMin - startMin) / (dayEnd - dayStart)) * 100;
                if (left < 0 || left > 100) return null;

                return (
                  <div
                    key={block.id}
                    className="absolute top-1 bottom-1 rounded-md bg-destructive/15 border border-destructive/20 flex items-center justify-center overflow-hidden"
                    style={{ left: `${Math.max(0, left)}%`, width: `${Math.min(width, 100 - left)}%` }}
                  >
                    <span className="text-xs text-destructive font-medium truncate px-1">{block.label}</span>
                  </div>
                );
              })}
          </div>
          <p className="text-xs text-muted-foreground mt-6">
            <span className="inline-block w-3 h-3 rounded bg-success/20 border border-success/30 mr-1 align-middle" /> Free time
            <span className="inline-block w-3 h-3 rounded bg-destructive/15 border border-destructive/20 mr-1 ml-3 align-middle" /> Blocked
          </p>
        </div>
      )}
    </div>
  );
}
