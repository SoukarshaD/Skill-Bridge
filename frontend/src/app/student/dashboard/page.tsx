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
    skillsCount: 0,
    totalPrograms: 0,
    skillGapsCount: 0,
    recommendedProgramsCount: 0
  });
  const [recentPrograms, setRecentPrograms] = useState<any[]>([]);
  const [recommendedPrograms, setRecommendedPrograms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileData, programsData, recsData, careerData, myRegsData] = await Promise.all([
          api.get<any>("/users/profile"),
          api.get<any>("/programs"),
          api.get<any>("/programs/recommendations").catch(() => ({ recommendations: [] })),
          api.get<any>("/career-guidance/recommendations").catch(() => ({ recommendations: [] })),
          api.get<any[]>("/programs/my-registrations").catch(() => [])
        ]);

        const skillsCount = profileData.user?.studentProfile?.studentSkills?.length || 0;
        
        let programs = [];
        if (Array.isArray(programsData)) programs = programsData;
        else if (programsData.programs) programs = programsData.programs;
        
        const totalPrograms = programs.length;
        
        const recs = recsData.recommendations || [];
        
        let skillGapsSet = new Set();
        if (careerData.recommendations) {
          careerData.recommendations.forEach((r: any) => {
            if (r.missingSkills) {
              r.missingSkills.forEach((ms: any) => skillGapsSet.add(ms.skill?.id || ms.skillId));
            }
          });
        }
        
        setStats({
          skillsCount,
          totalPrograms,
          skillGapsCount: skillGapsSet.size,
          recommendedProgramsCount: recs.length
        });

        // Get top 3 recent programs
        const regs = Array.isArray(myRegsData) ? myRegsData : [];
        setRecentPrograms(regs.sort((a: any, b: any) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()).slice(0, 3));
        
        // Get top 3 recommendations
        setRecommendedPrograms(recs.slice(0, 3));

      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'COMPLETED' || status === 'APPROVED') return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
    if (status === 'CANCELLED' || status === 'REJECTED') return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
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
                Here's your progress on skill development and career alignment.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link href="/student/assessment">
                <Button variant="default" className="shadow-sm h-9">Explore Skill Gaps</Button>
              </Link>
              <Link href="/student/programs">
                <Button variant="outline" className="bg-background shadow-sm h-9">Find Programs</Button>
              </Link>
              <Link href="/student/learning">
                <Button variant="outline" className="bg-background shadow-sm h-9">Learning</Button>
              </Link>
              <Link href="/student/career">
                <Button variant="outline" className="bg-background shadow-sm h-9">Career Pathways</Button>
              </Link>
              <Link href="/student/profile">
                <Button variant="outline" className="bg-background shadow-sm h-9">Update Profile</Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Skills Identified</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-500">{isLoading ? "-" : stats.skillsCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Verified in profile</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Training Programs</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? "-" : stats.totalPrograms}</div>
                <p className="text-xs text-muted-foreground mt-1">Available for you</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Skill Gaps</CardTitle>
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-500">{isLoading ? "-" : stats.skillGapsCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Identified across careers</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50 bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Recommended Programs</CardTitle>
                <Sparkles className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{isLoading ? "-" : stats.recommendedProgramsCount}</div>
                <p className="text-xs text-primary/80 mt-1">Aligned with your goals</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Recent Training */}
            <Card className="lg:col-span-2 shadow-sm border-border/50 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recent Training Programs</CardTitle>
                    <CardDescription>Track your latest training activity and learning progress.</CardDescription>
                  </div>
                  <Link href="/student/programs" className="text-sm font-medium text-primary hover:underline">
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
                ) : recentPrograms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <GraduationCap className="h-10 w-10 mb-3 opacity-20" />
                    <p>No recent training activity</p>
                    <Link href="/student/programs" className="mt-4">
                      <Button variant="outline" size="sm">Explore Programs</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentPrograms.map((reg) => (
                      <div key={reg.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-border/50 bg-background hover:border-border transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center shrink-0">
                            <GraduationCap className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <Link href={`/student/programs/${reg.program?.id}`} className="font-medium hover:underline text-foreground">
                              {reg.program?.title}
                            </Link>
                            <p className="text-sm text-muted-foreground">{reg.program?.organizer?.organization?.name || 'Institution'}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                          <div className="flex items-center text-xs text-muted-foreground whitespace-nowrap">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(reg.registeredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                          <Badge variant="outline" className={cn("capitalize rounded-full", getStatusColor(reg.status))}>
                            {reg.status.toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Programs */}
            <Card className="shadow-sm border-border/50 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Recommended Training</CardTitle>
                    <CardDescription>Programs aligned with your development goals.</CardDescription>
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
                ) : recommendedPrograms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground h-full">
                    <Sparkles className="h-10 w-10 mb-3 opacity-20 text-amber-500" />
                    <p className="text-sm max-w-[200px] mb-2 font-medium">Complete your skill profile</p>
                    <p className="text-xs max-w-[200px] mb-4">Add your skills to identify development gaps and discover relevant training programs.</p>
                    <Link href="/student/profile" className="mt-1">
                      <Button variant="outline" size="sm">Update Skills</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recommendedPrograms.map((rec) => (
                      <Link key={rec.program.id} href={`/student/programs/${rec.program.id}`}>
                        <div className="group flex flex-col gap-2 p-3 rounded-lg border border-border/50 bg-background hover:border-primary/30 transition-colors">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {rec.program.title}
                            </h4>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary shrink-0">
                              {Math.round((rec.match.matchedSkills.length / (rec.match.matchedSkills.length + rec.match.missingSkills.length)) * 100) || 0}% Match
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1">{rec.program.organizer?.organization?.name || 'Institution'}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 border-t border-border/50">
                <Link href="/student/programs" className="w-full">
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
