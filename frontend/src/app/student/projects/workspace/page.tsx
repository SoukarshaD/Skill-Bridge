"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Folder, Clock, CheckCircle2, ChevronDown, ChevronUp, Upload, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ProjectWorkspacePage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [submitOpen, setSubmitOpen] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<any>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState("");

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const fetchWorkspace = async () => {
    try {
      const data = await api.get<any[]>("/projects");
      // Fetch details for each project to get milestones
      const detailed = await Promise.all(
        data.map(async (p) => {
          const det = await api.get<any>(`/projects/${p.id}`);
          return det;
        })
      );
      setProjects(detailed);
      if (detailed.length > 0 && !expandedId) {
        setExpandedId(detailed[0].id);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMilestone = async () => {
    if (!deliverableUrl) return toast.error("URL required");
    try {
      await api.patch(`/projects/${activeProject}/milestones/${activeMilestone.id}`, {
        status: "SUBMITTED",
        deliverableUrl
      });
      toast.success("Deliverable submitted!");
      setSubmitOpen(false);
      fetchWorkspace();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-8 max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Project Workspace</h1>
          <p className="text-muted-foreground">Manage your active live projects and submit milestone deliverables.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : projects.length > 0 ? (
          <div className="space-y-6">
            {projects.map(project => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader 
                  className="bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors flex flex-row items-center justify-between"
                  onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{project.status}</Badge>
                      <span className="text-sm text-muted-foreground">{project.organization?.name}</span>
                    </div>
                    <CardTitle className="text-xl">{project.opportunity?.title}</CardTitle>
                  </div>
                  {expandedId === project.id ? <ChevronUp /> : <ChevronDown />}
                </CardHeader>
                
                {expandedId === project.id && (
                  <CardContent className="pt-6 border-t">
                    <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Started On</p>
                        <p className="font-medium">{format(new Date(project.startDate), "MMM d, yyyy")}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Mentor</p>
                        <p className="font-medium">{project.mentor?.name || "Unassigned"}</p>
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg mb-4">Milestones</h3>
                    {project.milestones?.length > 0 ? (
                      <div className="space-y-4">
                        {project.milestones.map((ms: any) => (
                          <div key={ms.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg bg-card gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{ms.title}</h4>
                                <Badge variant="secondary" className="text-xs">{ms.status}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{ms.description}</p>
                              {ms.feedback && (
                                <p className="text-sm italic mt-2 text-primary">" {ms.feedback} "</p>
                              )}
                            </div>
                            
                            <div className="flex shrink-0">
                              {ms.status === "PENDING" || ms.status === "IN_PROGRESS" ? (
                                <Button size="sm" onClick={() => { setActiveProject(project.id); setActiveMilestone(ms); setSubmitOpen(true); setDeliverableUrl(""); }}>
                                  <Upload className="mr-2 h-4 w-4" /> Submit Work
                                </Button>
                              ) : ms.deliverableUrl ? (
                                <a href={ms.deliverableUrl} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="outline"><ExternalLink className="mr-2 h-4 w-4" /> View Submission</Button>
                                </a>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No milestones have been assigned yet.</p>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-lg bg-muted/20">
            <Folder className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No Active Projects</h3>
            <p className="text-muted-foreground">You don't have any active live projects right now.</p>
          </div>
        )}
      </div>

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Deliverable</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Milestone</Label>
              <Input value={activeMilestone?.title || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Deliverable URL (GitHub / Drive / Live Demo)</Label>
              <Input value={deliverableUrl} onChange={e => setDeliverableUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitMilestone}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
