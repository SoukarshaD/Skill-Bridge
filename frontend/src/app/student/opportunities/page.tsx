"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import Link from "next/link";

export default function StudentOpportunities() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await api.get<any>("/opportunities/recommendations");
        setRecommendations(data.recommendations || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch recommendations.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Recommended Opportunities</h1>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          {isLoading ? (
            <div>Loading recommendations...</div>
          ) : recommendations.length === 0 ? (
            <div className="text-muted-foreground">No opportunities available at this time. Make sure your profile is complete!</div>
          ) : (
            <div className="grid gap-6">
              {recommendations.map((rec) => (
                <Card key={rec.opportunity.id} className="overflow-hidden border-l-4 border-l-primary">
                  <CardHeader className="bg-muted/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{rec.opportunity.title}</CardTitle>
                        <CardDescription className="mt-1 font-medium text-foreground">
                          {rec.opportunity.organization?.name || "Unknown Company"}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="text-sm font-semibold px-3 py-1 bg-background">
                          Match: {rec.match.overallMatchPercentage !== null ? `${rec.match.overallMatchPercentage}%` : "N/A"}
                        </Badge>
                        <Badge>{rec.opportunity.type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {rec.opportunity.description}
                    </p>
                    
                    <div className="space-y-4">
                      {rec.match.overallMatchPercentage !== null ? (
                        <>
                          {rec.match.matchedSkills.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-green-600 mb-2">Matched Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {rec.match.matchedSkills.map((s: any) => (
                                  <Badge key={s.skillId} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                    {s.name} (Lvl {s.studentProficiency})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {rec.match.missingSkills.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-orange-600 mb-2">Skill Gaps</h4>
                              <div className="flex flex-wrap gap-2">
                                {rec.match.missingSkills.map((s: any) => (
                                  <Badge key={s.skillId} variant="outline" className="border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300">
                                    {s.name} (Req: Lvl {s.requiredProficiency}, Have: Lvl {s.studentProficiency})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-muted-foreground italic">
                          No skill requirements were provided for this opportunity. Eligibility is based on profile constraints only.
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Link href={`/student/opportunities/${rec.opportunity.id}`}>
                        <Button>View Details</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
