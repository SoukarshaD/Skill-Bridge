"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import Link from "next/link";
import { Clock, CheckCircle2, XCircle, ArrowRight, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function IndustryCollaborations() {
  const [collaborations, setCollaborations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCollaborations = async () => {
      try {
        const data = await api.get<any>("/collaborations/industry");
        setCollaborations(data.collaborations || []);
      } catch (error) {
        console.error("Failed to load collaborations", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCollaborations();
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PROPOSED': return { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Clock };
      case 'REVIEWING': return { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock };
      case 'ACCEPTED': return { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 };
      case 'ACTIVE': return { color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: CheckCircle2 };
      case 'COMPLETED': return { color: "bg-gray-100 text-gray-700 border-gray-200", icon: CheckCircle2 };
      case 'REJECTED': return { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle };
      default: return { color: "bg-muted", icon: Clock };
    }
  };

  return (
    <ProtectedRoute allowedRoles={["INDUSTRY", "ADMIN"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Industry Validation & Curriculum Alignment
            </h1>
            <p className="text-muted-foreground mt-1 text-base">
              Review curriculum alignment proposals and validate training requirements.
            </p>
          </div>

          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Curriculum Review & Active Joint Training</CardTitle>
              <CardDescription>Review curriculum redesign, skill-development, and joint training proposals sent to your organization.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : collaborations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <UserCircle className="h-12 w-12 mb-4 opacity-20" />
                  <p>No proposals received yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {collaborations.map((collab) => {
                    const StatusIcon = getStatusConfig(collab.status).icon;
                    return (
                      <div key={collab.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border/50 bg-background hover:border-blue-500/30 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                            <span className="font-semibold text-blue-700 text-lg">
                              {collab.academician?.name?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <div>
                            <Link href={`/industry/collaborations/${collab.id}`}>
                              <h4 className="font-semibold text-lg hover:underline cursor-pointer text-foreground">
                                {collab.title}
                              </h4>
                            </Link>
                            <p className="text-sm font-medium text-muted-foreground mt-1">
                              From: <span className="text-foreground">{collab.academician?.name}</span> • {collab.academician?.academicProfile?.institution || 'Unknown Institution'}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-[10px] uppercase">
                                {collab.type.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(collab.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                          <Badge variant="outline" className={cn("px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5", getStatusConfig(collab.status).color)}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {collab.status}
                          </Badge>
                          <Link href={`/industry/collaborations/${collab.id}`}>
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
