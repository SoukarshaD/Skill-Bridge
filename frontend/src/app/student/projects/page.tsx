"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, Building2, CheckCircle2, ChevronRight, Upload, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function StudentProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const data = await api.get<any>("/opportunities/browse?type=LIVE_PROJECT");
      const sorted = (data.opportunities || data.results || data).sort((a: any, b: any) => 
        (b.match?.overallMatchPercentage || 0) - (a.match?.overallMatchPercentage || 0)
      );
      setProjects(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Live Projects</h1>
          <p className="text-muted-foreground">Gain practical experience by working on real-world industry projects with expert mentorship.</p>
        </div>

        {loading ? (
           <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {projects.map((item: any) => {
                const opp = item.opportunity || item;
                const match = item.match;
                return (
                  <Card key={opp.id} className="overflow-hidden hover:shadow-sm transition-all">
                    <CardHeader className="bg-muted/30 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="bg-background">LIVE PROJECT</Badge>
                        {match?.overallMatchPercentage >= 60 && (
                           <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                             {match.overallMatchPercentage}% Match
                           </Badge>
                        )}
                      </div>
                      <CardTitle className="text-2xl">{opp.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Building2 className="h-4 w-4" /> {opp.organization?.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground mb-6 line-clamp-3">{opp.description}</p>
                      
                      <div className="flex flex-wrap gap-y-4 gap-x-8 text-sm">
                        {opp.duration && (
                          <div>
                            <p className="font-medium mb-1">Duration</p>
                            <p className="text-muted-foreground flex items-center"><Clock className="mr-2 h-4 w-4" />{opp.duration}</p>
                          </div>
                        )}
                        {opp.workMode && (
                          <div>
                            <p className="font-medium mb-1">Work Mode</p>
                            <p className="text-muted-foreground">{opp.workMode}</p>
                          </div>
                        )}
                        {opp.deadline && (
                           <div>
                             <p className="font-medium mb-1">Apply By</p>
                             <p className="text-muted-foreground">{format(new Date(opp.deadline), "MMM d, yyyy")}</p>
                           </div>
                        )}
                      </div>

                      {opp.requiredSkills?.length > 0 && (
                        <div className="mt-6">
                          <p className="font-medium text-sm mb-2">Required Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {opp.requiredSkills.map((rs: any) => (
                               <Badge key={rs.id} variant="secondary">{rs.skill.name}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 pt-6 border-t flex justify-end gap-3">
                         <Link href={`/student/opportunities/${opp.id}`}>
                           <Button variant="outline">View Details</Button>
                         </Link>
                         <Link href={`/student/opportunities/${opp.id}`}>
                           <Button>Apply Now <ChevronRight className="ml-2 h-4 w-4" /></Button>
                         </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Projects</CardTitle>
                  <CardDescription>Your active and completed live projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                     <p className="text-sm text-muted-foreground mb-4">View your workspace and manage milestones for accepted projects.</p>
                     <Link href="/student/projects/workspace">
                       <Button variant="outline" className="w-full">Go to Workspace</Button>
                     </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 border rounded-lg bg-muted/20">
             <h3 className="text-lg font-medium">No live projects currently available</h3>
             <p className="text-muted-foreground mt-1">Check back soon for new opportunities from our industry partners.</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
