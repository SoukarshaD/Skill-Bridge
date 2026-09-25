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
  ArrowRight, 
  Briefcase, 
  GraduationCap, 
  Clock, 
  CheckCircle2, 
  FileText,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applicationsTotal: 0,
    applicationsPending: 0,
    applicationsOffered: 0,
    recommendationsCount: 0
  });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [topMatches, setTopMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appsData, matchesData] = await Promise.all([
          api.get<any>("/applications/me"),
          api.get<any>("/opportunities/recommendations")
        ]);

        const apps = appsData.applications || [];
        const matches = matchesData.recommendations || [];

        const pending = apps.filter((a: any) => ['APPLIED', 'SHORTLISTED', 'INTERVIEW'].includes(a.status)).length;
        const offered = apps.filter((a: any) => a.status === 'OFFERED').length;

        setStats({
          applicationsTotal: apps.length,
          applicationsPending: pending,
          applicationsOffered: offered,
          recommendationsCount: matches.length
        });

        // Get top 3 recent applications
        setRecentApps(apps.sort((a: any, b: any) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()).slice(0, 3));
        
        // Get top 3 matches
        setTopMatches(matches.slice(0, 3));

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'OFFERED' || status === 'ACCEPTED') return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    if (status === 'REJECTED' || status === 'DECLINED' || status === 'WITHDRAWN') return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
    return "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800";
  };

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          
          {/* Welcome Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Welcome back, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-muted-foreground mt-1 text-base">
                Here's what's happening with your applications and profile today.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link href="/student/career">
                <Button variant="default" className="shadow-sm h-9">Career Guidance</Button>
              </Link>
              <Link href="/student/challenges">
                <Button variant="outline" className="bg-background shadow-sm h-9">Challenges</Button>
              </Link>
              <Link href="/student/projects">
                <Button variant="outline" className="bg-background shadow-sm h-9">Live Projects</Button>
              </Link>
              <Link href="/student/profile">
                <Button variant="outline" className="bg-background shadow-sm h-9">Update Profile</Button>
              </Link>
              <Link href="/student/opportunities/browse">
                <Button variant="outline" className="bg-background shadow-sm h-9">Browse Opportunities</Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "-" : stats.applicationsPending}</div>
                <p className="text-xs text-muted-foreground mt-1">Pending review or interview</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">New Offers</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-500">{isLoading ? "-" : stats.applicationsOffered}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting your response</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Applied</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "-" : stats.applicationsTotal}</div>
                <p className="text-xs text-muted-foreground mt-1">Lifetime applications</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50 bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Skill Matches</CardTitle>
                <Sparkles className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{isLoading ? "-" : stats.recommendationsCount}</div>
                <p className="text-xs text-primary/80 mt-1">Roles matching your profile</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Recent Applications */}
            <Card className="lg:col-span-2 shadow-sm border-border/50 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recent Applications</CardTitle>
                    <CardDescription>Status of your latest opportunity applications.</CardDescription>
                  </div>
                  <Link href="/student/applications" className="text-sm font-medium text-primary hover:underline">
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
                ) : recentApps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <FileText className="h-10 w-10 mb-3 opacity-20" />
                    <p>No recent applications</p>
                    <Link href="/student/opportunities/browse" className="mt-4">
                      <Button variant="outline" size="sm">Start Browsing</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentApps.map((app) => (
                      <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/50 bg-background hover:border-border transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <Link href={`/student/opportunities/${app.opportunity.id}`} className="font-medium hover:underline text-foreground">
                              {app.opportunity.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">{app.opportunity.organization?.name || 'Company'}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                          <Badge variant="outline" className={cn("capitalize rounded-full", getStatusColor(app.status))}>
                            {app.status.toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Matches */}
            <Card className="shadow-sm border-border/50 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Top Matches</CardTitle>
                    <CardDescription>Opportunities curated for you.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => (
                      <div key={i} className="flex gap-3 h-20 bg-muted/50 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : topMatches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground h-full">
                    <AlertCircle className="h-10 w-10 mb-3 opacity-20 text-amber-500" />
                    <p className="text-sm max-w-[200px]">Update your skills to get personalized matches.</p>
                    <Link href="/student/profile" className="mt-4">
                      <Button variant="outline" size="sm">Update Skills</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topMatches.map((rec) => (
                      <Link key={rec.opportunity.id} href={`/student/opportunities/${rec.opportunity.id}`}>
                        <div className="group flex flex-col gap-2 p-3 rounded-lg border border-border/50 bg-background hover:border-primary/30 transition-colors">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {rec.opportunity.title}
                            </h4>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary shrink-0">
                              {rec.match.overallMatchPercentage}% Match
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{rec.opportunity.organization?.name || 'Company'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 border-t border-border/50">
                <Link href="/student/opportunities" className="w-full">
                  <Button variant="ghost" className="w-full h-8 text-xs justify-between group">
                    View all recommendations 
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
