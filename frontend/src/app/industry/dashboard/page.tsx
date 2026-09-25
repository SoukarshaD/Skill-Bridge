"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  Briefcase, 
  ArrowRight, 
  TrendingUp,
  FileText,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function IndustryDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activePostings: 0,
    totalApplications: 0,
    pendingValidations: 0
  });
  const [recentOpportunities, setRecentOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await api.get<any>("/opportunities/organization");
        const opps = data.opportunities || [];
        
        const active = opps.filter((o: any) => o.status === 'PUBLISHED').length;
        
        let totalApps = 0;
        opps.forEach((o: any) => {
          totalApps += (o._count?.applications || 0);
        });

        const collabData = await api.get<any>("/collaborations/industry").catch(() => ({ collaborations: [] }));
        const pending = (collabData.collaborations || []).filter((c: any) => c.status === 'PROPOSED' || c.status === 'REVIEWING').length;

        setStats({
          activePostings: active,
          totalApplications: totalApps,
          pendingValidations: pending
        });

        // Top 3 most recent
        setRecentOpportunities(opps.slice(0, 3));
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["INDUSTRY"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Company Dashboard
              </h1>
              <p className="text-muted-foreground mt-1 text-base">
                Manage your skill requirements, curriculum validations, and joint training.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/industry/collaborations">
                <Button variant="outline" className="bg-background shadow-sm h-9">Review Proposals</Button>
              </Link>
              <Link href="/industry/opportunities/new">
                <Button className="h-9 shadow-sm">Publish Requirements</Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Skill Postings</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "-" : stats.activePostings}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently published skill requirements</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Applications</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "-" : stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground mt-1">Participants across all postings</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50 bg-blue-500/5 border-blue-500/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Pending Validations</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{isLoading ? "-" : stats.pendingValidations}</div>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">Curriculum proposals awaiting review</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Recent Postings */}
            <Card className="lg:col-span-2 shadow-sm border-border/50 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recent Skill Postings</CardTitle>
                    <CardDescription>Overview of your latest published skill requirements.</CardDescription>
                  </div>
                  <Link href="/industry/opportunities" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    View all
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex items-center gap-4 h-16 bg-muted/50 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : recentOpportunities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <Building2 className="h-10 w-10 mb-3 opacity-20" />
                    <p>No active skill postings</p>
                    <Link href="/industry/opportunities/new" className="mt-4">
                      <Button variant="outline" size="sm">Publish Skill Requirement</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOpportunities.map((opp) => (
                      <div key={opp.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/50 bg-background hover:border-blue-500/30 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <span className="font-medium text-foreground">
                              {opp.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-muted">
                                {opp.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground flex items-center">
                                <Users className="h-3 w-3 mr-1" />
                                {opp._count?.applications || 0} Applications
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                          <Badge variant="outline" className={cn(
                            "capitalize rounded-full",
                            opp.status === 'PUBLISHED' ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" : "bg-muted"
                          )}>
                            {opp.status.toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Platform Insights or Action Items */}
            <Card className="shadow-sm border-border/50 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Action Items</CardTitle>
                    <CardDescription>Tasks requiring your attention.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex gap-3 p-3 rounded-lg border border-border/50 bg-background">
                  <div className="mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Review {stats.pendingValidations} pending validations</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Curriculum proposals awaiting your endorsement</p>
                  </div>
                </div>
                
                <div className="flex gap-3 p-3 rounded-lg border border-border/50 bg-background">
                  <div className="mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Complete Company Profile</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Add a logo and description to attract more talent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
