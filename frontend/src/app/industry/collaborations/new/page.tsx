"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

function NewIndustryCollaborationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const academicianId = searchParams.get("academicianId");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "CONSULTANCY",
    expectedOutcomes: "",
    duration: "",
    expertise: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!academicianId) {
      toast.error("No academician selected.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        academicianId,
        title: formData.title,
        description: formData.description,
        type: formData.type,
        expectedOutcomes: formData.expectedOutcomes,
        duration: formData.duration,
        expertise: formData.expertise ? formData.expertise.split(",").map(s => s.trim()).filter(Boolean) : [],
      };

      await api.post("/collaborations/propose", payload);
      toast.success("Proposal sent successfully!");
      router.push("/industry/collaborations");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["INDUSTRY", "ADMIN"]}>
      <div className="min-h-screen bg-muted/20">
        <Navbar />
        <main className="container mx-auto py-8 max-w-2xl">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Propose Curriculum Alignment / Joint Training</CardTitle>
              <CardDescription>
                Send a joint training or curriculum alignment proposal to the selected academician.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="type">Collaboration Type</Label>
                  <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONSULTANCY">Consultancy</SelectItem>
                      <SelectItem value="RESEARCH_COLLABORATION">Collaborative Research</SelectItem>
                      <SelectItem value="FACULTY_INTERNSHIP">Faculty Internship</SelectItem>
                      <SelectItem value="INDUSTRIAL_TRAINING">Industrial Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title / Problem Statement</Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., AI Model Optimization Consultancy"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea
                    id="description"
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the scope of work, background, and specific requirements..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expertise">Target Skills (comma-separated)</Label>
                  <Input
                    id="expertise"
                    value={formData.expertise}
                    onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    placeholder="e.g., Machine Learning, Optimization, Python"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Expected Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 3 months"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedOutcomes">Expected Deliverables</Label>
                    <Input
                      id="expectedOutcomes"
                      value={formData.expectedOutcomes}
                      onChange={(e) => setFormData({ ...formData, expectedOutcomes: e.target.value })}
                      placeholder="e.g., Research paper, working prototype"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Sending Proposal..." : "Send Proposal"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}

export default function NewIndustryCollaboration() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-muted/20 flex items-center justify-center font-sans">Loading...</div>}>
      <NewIndustryCollaborationForm />
    </Suspense>
  );
}
