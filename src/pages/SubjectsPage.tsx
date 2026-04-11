import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { SUBJECT_COLORS, Topic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, ChevronDown, ChevronRight, BookOpen, Calendar, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SubjectsPage() {
  const { subjects, topics, examDates, addSubject, removeSubject, addTopic, updateTopic, removeTopic, addExamDate, removeExamDate } = useApp();
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState(SUBJECT_COLORS[0]);
  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [topicDialogOpen, setTopicDialogOpen] = useState(false);
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [newTopic, setNewTopic] = useState({
    subject_id: '', name: '', difficulty: 3 as 1|2|3|4|5, importance: 3 as 1|2|3|4|5,
    confidence: 3 as 1|2|3|4|5, estimated_hours: 2, status: 'pending' as const, deadline: '' as string,
  });
  const [newExamSubjectId, setNewExamSubjectId] = useState('');
  const [newExamDate, setNewExamDate] = useState('');

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    addSubject(newSubjectName.trim(), selectedColor);
    setNewSubjectName('');
    setSubjectDialogOpen(false);
  };

  const handleAddTopic = () => {
    if (!newTopic.name.trim() || !newTopic.subject_id) return;
    const { deadline, ...topicData } = newTopic;
    addTopic({ ...topicData, deadline: deadline || undefined } as any);
    setNewTopic({ subject_id: '', name: '', difficulty: 3, importance: 3, confidence: 3, estimated_hours: 2, status: 'pending', deadline: '' });
    setTopicDialogOpen(false);
  };

  const handleAddExam = () => {
    if (!newExamSubjectId || !newExamDate) return;
    addExamDate(newExamSubjectId, newExamDate);
    setNewExamSubjectId('');
    setNewExamDate('');
    setExamDialogOpen(false);
  };

  const handleToggleStatus = (topic: Topic) => {
    const nextStatus = topic.status === 'pending' ? 'in_progress' : topic.status === 'in_progress' ? 'completed' : 'pending';
    updateTopic(topic.id, { status: nextStatus });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Subjects & Topics</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your syllabus and exam dates</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />Subject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Subject Name</Label>
                  <Input value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} placeholder="e.g., Mathematics" />
                </div>
                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2 mt-2">
                    {SUBJECT_COLORS.map(c => (
                      <button key={c} className={cn('w-8 h-8 rounded-full border-2 transition-all', selectedColor === c ? 'border-foreground scale-110' : 'border-transparent')} style={{ backgroundColor: c }} onClick={() => setSelectedColor(c)} />
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddSubject} className="w-full gradient-primary text-primary-foreground">Add Subject</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={topicDialogOpen} onOpenChange={setTopicDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={subjects.length === 0}>
                <Plus className="w-4 h-4 mr-2" />Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Topic</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Subject</Label>
                  <Select value={newTopic.subject_id} onValueChange={v => setNewTopic(p => ({ ...p, subject_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Topic Name</Label>
                  <Input value={newTopic.name} onChange={e => setNewTopic(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Calculus" />
                </div>
                <div>
                  <Label>Complete By (optional deadline)</Label>
                  <Input type="date" value={newTopic.deadline} onChange={e => setNewTopic(p => ({ ...p, deadline: e.target.value }))} />
                </div>
                <div>
                  <Label>Difficulty ({newTopic.difficulty}/5)</Label>
                  <Slider value={[newTopic.difficulty]} onValueChange={v => setNewTopic(p => ({ ...p, difficulty: v[0] as any }))} min={1} max={5} step={1} className="mt-2" />
                </div>
                <div>
                  <Label>Importance ({newTopic.importance}/5)</Label>
                  <Slider value={[newTopic.importance]} onValueChange={v => setNewTopic(p => ({ ...p, importance: v[0] as any }))} min={1} max={5} step={1} className="mt-2" />
                </div>
                <div>
                  <Label>Confidence ({newTopic.confidence}/5)</Label>
                  <Slider value={[newTopic.confidence]} onValueChange={v => setNewTopic(p => ({ ...p, confidence: v[0] as any }))} min={1} max={5} step={1} className="mt-2" />
                </div>
                <div>
                  <Label>Estimated Hours</Label>
                  <Input type="number" value={newTopic.estimated_hours} onChange={e => setNewTopic(p => ({ ...p, estimated_hours: Number(e.target.value) }))} min={0.5} step={0.5} />
                </div>
                <Button onClick={handleAddTopic} className="w-full gradient-primary text-primary-foreground">Add Topic</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={examDialogOpen} onOpenChange={setExamDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={subjects.length === 0}>
                <Calendar className="w-4 h-4 mr-2" />Exam Date
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Exam Date</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Subject</Label>
                  <Select value={newExamSubjectId} onValueChange={setNewExamSubjectId}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Exam Date</Label>
                  <Input type="date" value={newExamDate} onChange={e => setNewExamDate(e.target.value)} />
                </div>
                <Button onClick={handleAddExam} className="w-full gradient-primary text-primary-foreground">Add Exam Date</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Subjects List */}
      {subjects.length === 0 ? (
        <div className="bg-card rounded-xl p-12 shadow-card border border-border/50 text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium text-lg">No subjects yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Add your first subject to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map(subject => {
            const subTopics = topics.filter(t => t.subject_id === subject.id);
            const subExams = examDates.filter(e => e.subject_id === subject.id);
            const isExpanded = expandedSubject === subject.id;
            const completedCount = subTopics.filter(t => t.status === 'completed').length;
            const progress = subTopics.length > 0 ? Math.round((completedCount / subTopics.length) * 100) : 0;

            return (
              <div key={subject.id} className="bg-card rounded-xl shadow-card border border-border/50 overflow-hidden">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
                    <h3 className="font-heading font-semibold text-foreground truncate">{subject.name}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full flex-shrink-0">
                      {completedCount}/{subTopics.length}
                    </span>
                    {subExams.length > 0 && (
                      <span className="text-xs text-warning bg-warning/10 px-2 py-0.5 rounded-full flex-shrink-0">
                        Exam: {new Date(subExams[0].exam_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-20 hidden sm:block">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: subject.color }} />
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={e => { e.stopPropagation(); removeSubject(subject.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border/50 p-4 space-y-3 animate-fade-in">
                    {subTopics.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No topics yet. Add one above!</p>
                    ) : (
                      subTopics.sort((a, b) => b.priority_score - a.priority_score).map(topic => (
                        <div key={topic.id} className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm text-foreground truncate">{topic.name}</p>
                              {(topic as any).deadline && (
                                <span className="text-xs text-warning bg-warning/10 px-1.5 py-0.5 rounded flex-shrink-0">
                                  <Target className="w-3 h-3 inline mr-0.5" />
                                  {new Date((topic as any).deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                              <span>Diff: {topic.difficulty}/5</span>
                              <span>Imp: {topic.importance}/5</span>
                              <span>Conf: {topic.confidence}/5</span>
                              <span className="text-primary font-medium">Priority: {topic.priority_score.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleToggleStatus(topic)}
                              className={cn(
                                'text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer transition-all hover:scale-105',
                                topic.status === 'completed' ? 'bg-success/10 text-success' :
                                topic.status === 'in_progress' ? 'bg-primary/10 text-primary' :
                                'bg-muted text-muted-foreground hover:bg-muted/80'
                              )}
                            >
                              {topic.status === 'completed' ? '✓ Done' : topic.status === 'in_progress' ? '⏳ In Progress' : '○ Pending'}
                            </button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeTopic(topic.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}

                    {subExams.length > 0 && (
                      <div className="pt-2 border-t border-border/30">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Exam Dates</p>
                        {subExams.map(exam => (
                          <div key={exam.id} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{new Date(exam.exam_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeExamDate(exam.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
