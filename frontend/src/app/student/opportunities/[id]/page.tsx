"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { api } from "@/lib/api";

export default function OpportunityDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const json = await api.get<any>(`/opportunities/${id}`);
        setData(json);
      } catch (err: any) {
        setError(err.message || "Failed to fetch opportunity details.");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await api.post("/applications", { opportunityId: id });
      toast.success("Application submitted successfully!");
      // Refresh data to show applied status
      setData({ ...data, applicationStatus: 'APPLIED' });
    } catch (err: any) {
      toast.error(err.message || "Failed to apply");
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (error || !data?.opportunity) return <div className="p-8 text-center text-red-500">{error || "Opportunity not found"}</div>;

  const { opportunity, match, applicationStatus } = data;

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← Back
          </Button>

          <Card className="mb-8 border-t-4 border-t-primary">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl mb-2">{opportunity.title}</CardTitle>
                  <CardDescription className="text-lg text-foreground">
                    {opportunity.organization?.name}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge className="text-sm px-3 py-1">{opportunity.type}</Badge>
                  {match?.overallMatchPercentage !== null && match?.overallMatchPercentage !== undefined && (
                    <Badge variant="outline" className="text-sm font-semibold">
                      Match Score: {match.overallMatchPercentage}%
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{opportunity.location || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Work Mode</p>
                  <p className="font-medium">{opportunity.workMode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Compensation</p>
                  <p className="font-medium">{opportunity.compensation || "Unpaid / Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{opportunity.duration || "Not specified"}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Description</h3>
                <div className="whitespace-pre-wrap text-muted-foreground">
                  {opportunity.description}
                </div>
              </div>

              {match && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Skill Match Analysis</h3>
                  
                  {match.matchedSkills?.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-green-600 mb-2">You matched these requirements:</h4>
                      <div className="flex flex-wrap gap-2">
                        {match.matchedSkills.map((s: any) => (
                          <Badge key={s.skillId} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            {s.name} (Lvl {s.studentProficiency})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {match.missingSkills?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-orange-600 mb-2">Skill gaps identified:</h4>
                      <div className="flex flex-wrap gap-2">
                        {match.missingSkills.map((s: any) => (
                          <Badge key={s.skillId} variant="outline" className="border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300">
                            {s.name} (Req: {s.requiredProficiency}, Have: {s.studentProficiency})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-6 border-t flex justify-end gap-4">
                <Link 
                  href={`/student/opportunities/${id}/learning`}
                  className={buttonVariants({ variant: "outline", className: "w-full md:w-auto" })}
                >
                  View Learning Recommendations
                </Link>
                
                {applicationStatus ? (
                  <Button disabled variant="secondary" className="w-full md:w-auto">
                    Status: {applicationStatus}
                  </Button>
                ) : (
                  <Button onClick={handleApply} disabled={isApplying} className="w-full md:w-auto text-lg px-8 py-6">
                    {isApplying ? "Applying..." : "Apply Now"}
                  </Button>
                )}
              </div>

            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
