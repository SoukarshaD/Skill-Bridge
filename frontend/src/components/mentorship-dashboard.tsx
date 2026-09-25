"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Plus, Target, CalendarDays, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export function MentorshipDashboard({ id, role }: { id: string; role: 'INDUSTRY' | 'STUDENT' }) {
  const [mentorship, setMentorship] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [newGoal, setNewGoal] = useState("");
  const [sessionData, setSessionData] = useState({ date: "", notes: "", nextSteps: "" });
  const [feedback, setFeedback] = useState("");
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/mentorship/${id}`);
      setMentorship(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    try {
      await api.post(`/mentorship/${id}/goals`, { title: newGoal });
      setNewGoal("");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleGoal = async (goalId: string) => {
    try {
      await api.patch(`/mentorship/${id}/goals/${goalId}`, {});
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSession = async () => {
    if (!sessionData.date || !sessionData.notes) return;
    try {
      await api.post(`/mentorship/${id}/sessions`, sessionData);
      setSessionDialogOpen(false);
      setSessionData({ date: "", notes: "", nextSteps: "" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async () => {
    if (!feedback.trim()) return;
    try {
      await api.post(`/mentorship/${id}/complete`, { feedback });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex flex-col bg-background"><Navbar /><main className="flex-1 p-8 text-center">Loading...</main></div>;
  }

  if (!mentorship) {
    return <div className="min-h-screen flex flex-col bg-background"><Navbar /><main className="flex-1 p-8 text-center text-red-500">Mentorship not found.</main></div>;
  }

  const isCompleted = mentorship.status === 'COMPLETED';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-5xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{mentorship.program.title}</h1>
            <p className="text-muted-foreground mt-1">
              {role === 'INDUSTRY' ? `Mentoring ${mentorship.student.name}` : `Mentor: ${mentorship.program.mentor.name}`}
            </p>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full font-medium">
              <CheckCircle2 className="w-5 h-5" /> Mentorship Completed
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Objectives</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic text-muted-foreground">"{mentorship.objectives}"</p>
              </CardContent>
            </Card>

            {role === 'INDUSTRY' && !isCompleted && (
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg">Wrap up Mentorship</CardTitle>
                  <CardDescription>Leave feedback for the student and mark this as completed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea 
                    placeholder="Provide constructive feedback..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                  <Button onClick={handleComplete} disabled={!feedback.trim()} className="w-full">
                    Complete Mentorship
                  </Button>
                </CardContent>
              </Card>
            )}

            {isCompleted && (
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Mentor Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{mentorship.mentorFeedback}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="goals" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="goals">Goals & Milestones</TabsTrigger>
                <TabsTrigger value="sessions">Mentorship Sessions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="goals" className="mt-6 space-y-4">
                {!isCompleted && (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add a new goal or milestone..." 
                      value={newGoal} 
                      onChange={e => setNewGoal(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
                    />
                    <Button onClick={handleAddGoal} size="icon"><Plus className="w-4 h-4" /></Button>
                  </div>
                )}
                
                <div className="space-y-3 mt-4">
                  {mentorship.goals.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No goals added yet.</p>
                  ) : (
                    mentorship.goals.map((g: any) => (
                      <div key={g.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-card">
                        <Checkbox 
                          id={`goal-${g.id}`} 
                          checked={g.isCompleted} 
                          onCheckedChange={() => handleToggleGoal(g.id)}
                          disabled={isCompleted}
                        />
                        <label 
                          htmlFor={`goal-${g.id}`}
                          className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${g.isCompleted ? 'line-through text-muted-foreground' : ''}`}
                        >
                          {g.title}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="sessions" className="mt-6 space-y-6">
                {role === 'INDUSTRY' && !isCompleted && (
                  <div className="flex justify-end">
                    <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
                      <DialogTrigger>
                        <Button className="flex items-center gap-2" variant="outline"><Plus className="w-4 h-4" /> Log Session</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Log Mentorship Session</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <Input type="date" value={sessionData.date} onChange={e => setSessionData({...sessionData, date: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Session Notes</label>
                            <Textarea rows={3} value={sessionData.notes} onChange={e => setSessionData({...sessionData, notes: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Next Steps (Optional)</label>
                            <Textarea rows={2} value={sessionData.nextSteps} onChange={e => setSessionData({...sessionData, nextSteps: e.target.value})} />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSessionDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddSession}>Save Session</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                <div className="space-y-4 relative border-l-2 border-muted ml-3 pl-6">
                  {mentorship.sessions.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4">No sessions logged yet.</p>
                  ) : (
                    mentorship.sessions.map((s: any) => (
                      <div key={s.id} className="relative">
                        <div className="absolute -left-[35px] top-1 bg-primary text-primary-foreground p-1 rounded-full border-4 border-background">
                          <CalendarDays className="w-3 h-3" />
                        </div>
                        <Card>
                          <CardHeader className="py-3 bg-muted/20">
                            <CardTitle className="text-base">{format(new Date(s.date), "MMMM d, yyyy")}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4 space-y-4">
                            <div>
                              <p className="text-sm font-semibold mb-1">Notes</p>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{s.notes}</p>
                            </div>
                            {s.nextSteps && (
                              <div>
                                <p className="text-sm font-semibold mb-1">Next Steps</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{s.nextSteps}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </main>
    </div>
  );
}
