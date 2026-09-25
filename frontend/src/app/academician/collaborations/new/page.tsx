"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function NewCollaborationProposal() {
  const router = useRouter();
  
  const [industries, setIndustries] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingIndustries, setIsLoadingIndustries] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    industryId: "",
    type: "RESEARCH_COLLABORATION",
    description: "",
    expectedOutcomes: "",
    duration: "",
    expertise: "",
  });

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const data = await api.get<any>("/collaborations/organizations");
        setIndustries(data.industries || []);
      } catch (error) {
        console.error("Failed to load industries", error);
      } finally {
        setIsLoadingIndustries(false);
      }
    };
    fetchOrgs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        expertise: formData.expertise.split(',').map(s => s.trim()).filter(s => s)
      };
      
      await api.post("/collaborations/propose", payload);
      
      toast.success("Proposal Submitted", {
        description: "Your collaboration proposal has been sent to the industry partner.",
      });
      
      router.push("/academician/collaborations");
    } catch (error: any) {
      toast.error("Submission Failed", {
        description: error.message || "Something went wrong.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ACADEMICIAN"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Propose Collaboration
            </h1>
            <p className="text-muted-foreground mt-1 text-base">
              Submit a formal proposal for research, consultancy, or training to an industry partner.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle>Proposal Details</CardTitle>
                <CardDescription>All fields are required unless marked optional.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-2">
                  <Label htmlFor="title">Proposal Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. AI-driven Supply Chain Optimization Research" 
                    required 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Target Industry Partner</Label>
                    <Select 
                      disabled={isLoadingIndustries} 
                      value={formData.industryId}
                      onValueChange={(val) => setFormData({...formData, industryId: val})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map(ind => (
                          <SelectItem key={ind.id} value={ind.id}>{ind.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Collaboration Type</Label>
                    <Select 
                      value={formData.type}
                      onValueChange={(val) => setFormData({...formData, type: val})}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RESEARCH_COLLABORATION">Research Collaboration</SelectItem>
                        <SelectItem value="CONSULTANCY">Consultancy</SelectItem>
                        <SelectItem value="FDP">Faculty Development Program</SelectItem>
                        <SelectItem value="INDUSTRIAL_TRAINING">Industrial Training</SelectItem>
                        <SelectItem value="FACULTY_INTERNSHIP">Faculty Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the problem statement, methodology, and objectives..." 
                    className="min-h-[150px]"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outcomes">Expected Outcomes</Label>
                  <Textarea 
                    id="outcomes" 
                    placeholder="What will be the deliverables or results of this collaboration?" 
                    className="min-h-[100px]"
                    required
                    value={formData.expectedOutcomes}
                    onChange={(e) => setFormData({...formData, expectedOutcomes: e.target.value})}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expertise">Relevant Expertise (Comma separated)</Label>
                    <Input 
                      id="expertise" 
                      placeholder="e.g. Machine Learning, Python, Operations Research"
                      value={formData.expertise}
                      onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Estimated Duration</Label>
                    <Input 
                      id="duration" 
                      placeholder="e.g. 6 Months"
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    />
                  </div>
                </div>

              </CardContent>
              <CardFooter className="flex justify-between bg-muted/20 border-t p-6">
                <Button variant="ghost" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !formData.industryId}>
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                  ) : "Submit Proposal"}
                </Button>
              </CardFooter>
            </Card>
          </form>

        </main>
      </div>
    </ProtectedRoute>
  );
}
