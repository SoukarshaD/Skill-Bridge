"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trophy, Calendar, Users, Building2, Upload, ExternalLink, CheckCircle2, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function ChallengeDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [challenge, setChallenge] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [submitOpen, setSubmitOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", technicalApproach: "", repositoryUrl: "", demoUrl: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const oppData = await api.get<any>(`/opportunities/${id}`);
      setChallenge(oppData.opportunity);
      
      const subData = await api.get<any>("/challenges/my-submissions");
      const existing = subData.submissions?.find((s: any) => s.challengeId === id);
      if (existing) setSubmission(existing);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) return toast.error("Title and description are required");
    setSubmitting(true);
    try {
      await api.post(`/challenges/${id}/submit`, formData);
      toast.success("Solution submitted successfully!");
      setSubmitOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit solution");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading...</div>;
  if (!challenge) return <div className="p-12 text-center">Challenge not found</div>;

  const isClosed = challenge.deadline && new Date() > new Date(challenge.deadline);

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-8 max-w-5xl space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-blue-500/10 text-blue-600"><Trophy className="mr-1 h-3 w-3" /> Innovation Challenge</Badge>
                {isClosed && <Badge variant="destructive">Closed</Badge>}
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{challenge.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" /> <span>{challenge.organization?.name}</span>
              </div>
            </div>

            <Card>
              <CardHeader><CardTitle>Problem Statement & Details</CardTitle></CardHeader>
              <CardContent><p className="whitespace-pre-wrap">{challenge.description}</p></CardContent>
            </Card>

            {challenge.rules && (
              <Card>
                <CardHeader><CardTitle>Rules & Guidelines</CardTitle></CardHeader>
                <CardContent><p className="whitespace-pre-wrap">{challenge.rules}</p></CardContent>
              </Card>
            )}

            {challenge.evaluationCriteria && (
              <Card>
                <CardHeader><CardTitle>Evaluation Criteria</CardTitle></CardHeader>
                <CardContent><p className="whitespace-pre-wrap">{challenge.evaluationCriteria}</p></CardContent>
              </Card>
            )}
          </div>

          <div className="w-full md:w-80 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4 text-sm">
                {challenge.deadline && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Submission Deadline</p>
                      <p className="text-muted-foreground">{format(new Date(challenge.deadline), "PPP")}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Users className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Team Size</p>
                    <p className="text-muted-foreground">{challenge.minTeamSize} - {challenge.maxTeamSize} members</p>
                  </div>
                </div>
                {challenge.prizes && (
                  <div className="flex items-start gap-3">
                    <Trophy className="h-4 w-4 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Prizes</p>
                      <p className="text-muted-foreground">{challenge.prizes}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {submission ? (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader><CardTitle className="text-lg">Your Submission</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Status</p>
                    <Badge variant="outline" className="mt-1">{submission.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Title</p>
                    <p>{submission.title}</p>
                  </div>
                  {submission.score && (
                    <div>
                      <p className="font-medium text-muted-foreground">Score</p>
                      <p className="font-bold text-lg">{submission.score}/100</p>
                    </div>
                  )}
                  {submission.feedback && (
                    <div>
                      <p className="font-medium text-muted-foreground">Evaluator Feedback</p>
                      <p className="italic">{submission.feedback}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Button className="w-full" size="lg" onClick={() => setSubmitOpen(true)} disabled={isClosed}>
                {isClosed ? "Deadline Passed" : "Submit Solution"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Solution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Solution Title *</Label>
              <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. AI-driven Smart Campus System" />
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe your solution..." rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Technical Approach</Label>
              <Textarea value={formData.technicalApproach} onChange={e => setFormData({...formData, technicalApproach: e.target.value})} placeholder="Tech stack, architecture..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Repository URL</Label>
                <Input value={formData.repositoryUrl} onChange={e => setFormData({...formData, repositoryUrl: e.target.value})} placeholder="https://github.com/..." />
              </div>
              <div className="space-y-2">
                <Label>Live Demo URL</Label>
                <Input value={formData.demoUrl} onChange={e => setFormData({...formData, demoUrl: e.target.value})} placeholder="https://..." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit Solution"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
