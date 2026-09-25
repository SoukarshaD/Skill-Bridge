"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function OpportunityApplicants() {
  const { id } = useParams();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplicants = async () => {
    try {
      const data = await api.get<any>(`/opportunities/${id}/applicants/ranked`);
      setApplicants(data.applicants || []);
    } catch (err: any) {
      setError(err.message || "Failed to load applicants.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchApplicants();
    }
  }, [id]);

  const handleUpdateStatus = async (applicationId: string, newStatus: string) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status: newStatus });
      fetchApplicants();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["INDUSTRY", "ADMIN"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Applicants Ranked</h1>
              <p className="text-muted-foreground mt-2">Ranked by Match Engine Algorithm</p>
            </div>
            <Button variant="outline" onClick={() => window.history.back()}>Back to Postings</Button>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          {isLoading ? (
            <div>Loading applicants...</div>
          ) : applicants.length === 0 ? (
            <div className="text-muted-foreground">No applicants have applied yet.</div>
          ) : (
            <div className="grid gap-6">
              {applicants.map((app, index) => (
                <Card key={app.applicationId} className="overflow-hidden border-l-4 border-l-primary">
                  <CardHeader className="bg-muted/30">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{app.name}</CardTitle>
                          <CardDescription className="mt-1 font-medium text-foreground">
                            {app.email}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="text-sm font-semibold px-3 py-1 bg-background">
                          Match: {app.match?.overallMatchPercentage !== null ? `${app.match?.overallMatchPercentage}%` : "N/A"}
                        </Badge>
                        <Badge variant="secondary">{app.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {app.match?.overallMatchPercentage !== null && app.match?.overallMatchPercentage !== undefined ? (
                        <>
                          {app.match.matchedSkills?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-green-600 mb-2">Matched Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {app.match.matchedSkills.map((s: any) => (
                                  <Badge key={s.skillId} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                    {s.name} (Lvl {s.studentProficiency})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {app.match.missingSkills?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-orange-600 mb-2">Skill Gaps (Severity Ranked)</h4>
                              <div className="flex flex-wrap gap-2">
                                {app.match.missingSkills.map((s: any) => (
                                  <Badge key={s.skillId} variant="outline" className="border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300">
                                    {s.name} (Req: Lvl {s.requiredProficiency}, Have: Lvl {s.studentProficiency})
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : app.academicProfile ? (
                        <div className="space-y-4">
                          {app.academicProfile.expertise?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Core Expertise</h4>
                              <div className="flex flex-wrap gap-2">
                                {app.academicProfile.expertise.map((exp: string, i: number) => (
                                  <Badge key={i} variant="secondary">{exp}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {app.academicProfile.researchAreas?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Research Areas</h4>
                              <div className="flex flex-wrap gap-2">
                                {app.academicProfile.researchAreas.map((area: string, i: number) => (
                                  <Badge key={i} variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">{area}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground italic">
                          No skill requirements were provided for this opportunity. Applicant ranked by application date.
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex justify-between items-center border-t pt-4">
                      <Button variant="outline">View Full Profile</Button>
                      
                      <div className="flex gap-2">
                        {app.status === 'APPLIED' && (
                          <>
                            <Button onClick={() => handleUpdateStatus(app.applicationId, 'SHORTLISTED')}>Shortlist</Button>
                            <Button variant="destructive" onClick={() => handleUpdateStatus(app.applicationId, 'REJECTED')}>Reject</Button>
                          </>
                        )}
                        {app.status === 'SHORTLISTED' && (
                          <>
                            <Button onClick={() => handleUpdateStatus(app.applicationId, 'INTERVIEW')}>Move to Interview</Button>
                            <Button variant="destructive" onClick={() => handleUpdateStatus(app.applicationId, 'REJECTED')}>Reject</Button>
                          </>
                        )}
                        {app.status === 'INTERVIEW' && (
                          <>
                            <Button onClick={() => handleUpdateStatus(app.applicationId, 'OFFERED')} className="bg-green-600 hover:bg-green-700">Extend Offer</Button>
                            <Button variant="destructive" onClick={() => handleUpdateStatus(app.applicationId, 'REJECTED')}>Reject</Button>
                          </>
                        )}
                        {app.status === 'OFFERED' && (
                          <Button variant="destructive" onClick={() => handleUpdateStatus(app.applicationId, 'REJECTED')}>Rescind Offer</Button>
                        )}
                        {app.status === 'ACCEPTED' && (
                          <Button onClick={async () => {
                            try {
                              const res = await api.post<any>(`/internships/start/${app.applicationId}`, {});
                              window.location.href = `/industry/internships/${res.id}`;
                            } catch (e: any) {
                              alert(e.message || "Failed to start internship");
                            }
                          }} className="bg-primary text-primary-foreground hover:bg-primary/90">Start Internship</Button>
                        )}
                        {['DECLINED', 'REJECTED', 'WITHDRAWN'].includes(app.status) && (
                          <span className="text-sm text-muted-foreground italic self-center px-4">Terminal State</span>
                        )}
                      </div>
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
