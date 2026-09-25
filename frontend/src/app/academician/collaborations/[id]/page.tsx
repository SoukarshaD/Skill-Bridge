"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Clock, CheckCircle2, XCircle, Building2, Briefcase, FileText, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AcademicianCollaborationDetail() {
  const { id } = useParams();
  const router = useRouter();

  const [collab, setCollab] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await api.get<any>(`/collaborations/${id}`);
        setCollab(data.collaboration);
      } catch (error) {
        console.error("Failed to load details", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const updateStatus = async (status: string) => {
    setIsUpdating(true);
    try {
      const data = await api.patch<any>(`/collaborations/${id}/status`, { status });
      setCollab(data.collaboration);
      toast.success("Status Updated", {
        description: `Proposal has been marked as ${status}.`,
      });
    } catch (error: any) {
      toast.error("Update Failed", {
        description: error.message || "Failed to update status",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["ACADEMICIAN"]}>
        <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!collab) {
    return (
      <ProtectedRoute allowedRoles={["ACADEMICIAN"]}>
        <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl text-center">
            <h2 className="text-2xl font-bold mt-12">Proposal Not Found</h2>
            <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["ACADEMICIAN"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-5xl">
          <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 -ml-4 text-muted-foreground">
              <ChevronLeft className="mr-1 h-4 w-4" /> Back to Proposals
            </Button>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  {collab.title}
                </h1>
                <div className="flex items-center gap-3 mt-3">
                  <Badge variant="secondary" className="uppercase">{collab.type.replace('_', ' ')}</Badge>
                  <span className="text-sm text-muted-foreground">
                    Submitted on {new Date(collab.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <Badge className={cn("px-3 py-1.5 text-sm", collab.status === 'ACCEPTED' || collab.status === 'ACTIVE' ? "bg-green-100 text-green-700" : collab.status === 'REJECTED' ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700")}>
                Status: {collab.status}
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            {/* Left Column: Proposal Details */}
            <div className="md:col-span-2 space-y-6">
              <Card className="shadow-sm border-border/50">
                <CardHeader>
                  <CardTitle>Proposal Description & Curriculum Changes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">{collab.description}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/50">
                <CardHeader>
                  <CardTitle>Expected Outcomes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">{collab.expectedOutcomes || "Not specified"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Industry Info & Actions */}
            <div className="space-y-6">
              <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-4 border-b border-border/50">
                  <CardTitle className="text-base flex items-center">
                    <Building2 className="mr-2 h-5 w-5 text-muted-foreground" />
                    Industry Partner
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg">{collab.industry?.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {collab.industry?.domain || 'Organization'}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    <a href={`mailto:${collab.industry?.email}`} className="text-primary hover:underline">
                      {collab.industry?.email}
                    </a>
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-4 border-b border-border/50">
                  <CardTitle className="text-base">Details</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{collab.duration || "Not specified"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Target Skills</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {collab.expertise?.length > 0 ? (
                        collab.expertise.map((exp: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-muted/50">{exp}</Badge>
                        ))
                      ) : (
                        <span className="text-sm font-medium">Any</span>
                      )}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex-col gap-3 pt-2 border-t border-border/50 bg-muted/10">
                  {collab.status === 'PROPOSED' && (
                    <>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        onClick={() => updateStatus('REVIEWING')}
                        disabled={isUpdating}
                      >
                        Start Industry Review
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" 
                        onClick={() => updateStatus('REJECTED')}
                        disabled={isUpdating}
                      >
                        Withdraw / Reject Proposal
                      </Button>
                    </>
                  )}
                  {collab.status === 'REVIEWING' && (
                    <>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700" 
                        onClick={() => updateStatus('ACCEPTED')}
                        disabled={isUpdating}
                      >
                        Validate & Endorse Proposal
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" 
                        onClick={() => updateStatus('REJECTED')}
                        disabled={isUpdating}
                      >
                        Withdraw / Reject Proposal
                      </Button>
                    </>
                  )}
                  {collab.status === 'ACCEPTED' && (
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700" 
                      onClick={() => updateStatus('ACTIVE')}
                      disabled={isUpdating}
                    >
                      Start Joint Skill Development
                    </Button>
                  )}
                  {collab.status === 'ACTIVE' && (
                    <div className="flex flex-col gap-2 w-full">
                      <Button 
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" 
                        onClick={() => router.push('/academician/programs/new')}
                      >
                        <Briefcase className="mr-2 h-4 w-4" /> Create Associated Skill Program
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full" 
                        onClick={() => updateStatus('COMPLETED')}
                        disabled={isUpdating}
                      >
                        Complete Joint Training
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </div>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
