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
import { Plus, Target, MessageSquare, CheckCircle2, BookmarkPlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export function InternshipWorkspace({ id, role }: { id: string; role: 'INDUSTRY' | 'STUDENT' }) {
  const [internship, setInternship] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [newMilestone, setNewMilestone] = useState("");
  const [newUpdate, setNewUpdate] = useState("");
  const [feedback, setFeedback] = useState("");
  const [summary, setSummary] = useState("");
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/internships/${id}`);
      setInternship(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    if (!newMilestone.trim()) return;
    try {
      await api.post(`/internships/${id}/milestones`, { title: newMilestone });
      setNewMilestone("");
      setMilestoneDialogOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
      await api.patch(`/internships/${id}/milestones/${milestoneId}`, { status: newStatus });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;
    try {
      await api.post(`/internships/${id}/updates`, { content: newUpdate });
      setNewUpdate("");
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async () => {
    if (!feedback.trim() || !summary.trim()) return;
    try {
      await api.post(`/internships/${id}/complete`, { feedback, summary });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddToPortfolio = async () => {
    try {
      await api.post(`/internships/${id}/portfolio`, {});
      alert("Added to portfolio!");
    } catch (e: any) {
      alert(e.response?.data?.error || "Failed to add to portfolio");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex flex-col bg-background"><Navbar /><main className="flex-1 p-8 text-center">Loading...</main></div>;
  }

  if (!internship) {
    return <div className="min-h-screen flex flex-col bg-background"><Navbar /><main className="flex-1 p-8 text-center text-red-500">Internship not found.</main></div>;
  }

  const isCompleted = internship.status === 'COMPLETED';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-5xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{internship.opportunity.title}</h1>
            <p className="text-muted-foreground mt-1">
              {role === 'INDUSTRY' ? `Intern: ${internship.student.name}` : `Organization: ${internship.organization.name}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full font-medium border border-green-200">
                  <CheckCircle2 className="w-5 h-5" /> Internship Completed
                </div>
                {role === 'STUDENT' && (
                  <Button onClick={handleAddToPortfolio} variant="outline" className="flex items-center gap-2">
                    <BookmarkPlus className="w-4 h-4" /> Add to Portfolio
                  </Button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-primary bg-primary/10 px-4 py-2 rounded-full font-medium border border-primary/20">
                <Target className="w-5 h-5" /> Active Internship
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Started</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(internship.startDate), "MMMM d, yyyy")}</p>
                </div>
                {isCompleted && internship.actualEndDate && (
                  <div>
                    <p className="text-sm font-medium">Completed</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(internship.actualEndDate), "MMMM d, yyyy")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {role === 'INDUSTRY' && !isCompleted && (
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle className="text-lg">Wrap up Internship</CardTitle>
                  <CardDescription>Leave final feedback and a completion summary for the intern.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea 
                    placeholder="Completion Summary (e.g. Worked on...)"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                  <Textarea 
                    placeholder="Constructive Feedback for the student..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                  />
                  <Button onClick={handleComplete} disabled={!feedback.trim() || !summary.trim()} className="w-full">
                    Complete Internship
                  </Button>
                </CardContent>
              </Card>
            )}

            {isCompleted && (
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Completion Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Summary</p>
                    <p className="text-sm text-muted-foreground">{internship.completionSummary}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Feedback</p>
                    <p className="text-sm text-muted-foreground">{internship.mentorFeedback}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="md:col-span-2">
            <Tabs defaultValue="milestones" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="updates">Progress Updates</TabsTrigger>
              </TabsList>
              
              <TabsContent value="milestones" className="mt-6 space-y-4">
                {role === 'INDUSTRY' && !isCompleted && (
                  <div className="flex justify-end">
                    <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
                      <DialogTrigger>
                        <Button className="flex items-center gap-2" variant="outline"><Plus className="w-4 h-4" /> Add Milestone</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>New Milestone</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <Input 
                            placeholder="Milestone title..." 
                            value={newMilestone} 
                            onChange={e => setNewMilestone(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setMilestoneDialogOpen(false)}>Cancel</Button>
                          <Button onClick={handleAddMilestone} disabled={!newMilestone.trim()}>Save</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
                
                <div className="space-y-3 mt-4">
                  {internship.milestones.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No milestones added yet.</p>
                  ) : (
                    internship.milestones.map((m: any) => {
                      const mCompleted = m.status === 'COMPLETED';
                      return (
                        <div key={m.id} className="flex items-center space-x-3 p-4 border rounded-lg bg-card">
                          <Checkbox 
                            id={`milestone-${m.id}`} 
                            checked={mCompleted} 
                            onCheckedChange={() => handleToggleMilestone(m.id, m.status)}
                            disabled={isCompleted}
                          />
                          <label 
                            htmlFor={`milestone-${m.id}`}
                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${mCompleted ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {m.title}
                          </label>
                          {mCompleted && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {m.completedAt ? format(new Date(m.completedAt), "MMM d, yyyy") : ''}
                            </span>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </TabsContent>

              <TabsContent value="updates" className="mt-6 space-y-6">
                {!isCompleted && (
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <Textarea 
                        placeholder={role === 'STUDENT' ? "Post an update on your progress..." : "Post an update or note..."}
                        value={newUpdate}
                        onChange={e => setNewUpdate(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleAddUpdate} disabled={!newUpdate.trim()}>Post Update</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4 relative border-l-2 border-muted ml-3 pl-6">
                  {internship.progressUpdates.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4">No progress updates yet.</p>
                  ) : (
                    internship.progressUpdates.map((u: any) => (
                      <div key={u.id} className="relative">
                        <div className="absolute -left-[35px] top-1 bg-primary text-primary-foreground p-1 rounded-full border-4 border-background">
                          <MessageSquare className="w-3 h-3" />
                        </div>
                        <Card>
                          <CardHeader className="py-3 bg-muted/20 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-semibold">{u.author.name} <span className="font-normal text-muted-foreground text-xs ml-2">({u.author.role})</span></CardTitle>
                            <span className="text-xs text-muted-foreground">{format(new Date(u.createdAt), "MMM d, h:mm a")}</span>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <p className="text-sm whitespace-pre-wrap">{u.content}</p>
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
