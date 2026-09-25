"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Compass, CheckCircle2, AlertCircle, ArrowRight, BookOpen } from "lucide-react";

interface MatchResult {
  role: {
    id: string;
    title: string;
    category: string;
    description: string;
  };
  score: number;
  matchedSkills: any[];
  missingSkills: any[];
}

export default function CareerGuidancePage() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<MatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ success: boolean; recommendations: MatchResult[] }>("/career-guidance/recommendations");
      if (res.success) {
        setRecommendations(res.recommendations);
      }
    } catch (error) {
      console.error("Failed to load career recommendations", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Career Guidance</h1>
          <p className="text-muted-foreground mt-1">
            Discover career paths based on your current skill profile.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/student/profile">
            <Button variant="outline">Update Skills</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted/50 rounded-t-lg" />
              <CardContent className="h-40" />
            </Card>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <CardTitle>No Career Recommendations</CardTitle>
          <CardDescription className="mt-2 max-w-md">
            Update your skill profile or complete an assessment to receive personalized career recommendations.
          </CardDescription>
          <Link href="/student/profile" className="mt-6">
            <Button>Complete Skill Profile</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {recommendations.map((rec) => (
            <Card key={rec.role.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="secondary" className="mb-2">{rec.role.category}</Badge>
                    <CardTitle className="text-xl">{rec.role.title}</CardTitle>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-primary">{rec.score}%</span>
                    <p className="text-xs text-muted-foreground">Alignment</p>
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {rec.role.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <Progress value={rec.score} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                  <div>
                    <h4 className="font-semibold flex items-center gap-1.5 mb-2 text-green-600 dark:text-green-500">
                      <CheckCircle2 className="h-4 w-4" /> Top Matches
                    </h4>
                    <ul className="space-y-1">
                      {rec.matchedSkills.slice(0, 3).map(skill => (
                        <li key={skill.skillId} className="text-muted-foreground truncate">
                          {skill.name}
                        </li>
                      ))}
                      {rec.matchedSkills.length === 0 && (
                        <li className="text-muted-foreground italic">None yet</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-1.5 mb-2 text-amber-600 dark:text-amber-500">
                      <Compass className="h-4 w-4" /> Key Gaps
                    </h4>
                    <ul className="space-y-1">
                      {rec.missingSkills.slice(0, 3).map(skill => (
                        <li key={skill.skillId} className="text-muted-foreground truncate">
                          {skill.name}
                        </li>
                      ))}
                      {rec.missingSkills.length === 0 && (
                        <li className="text-muted-foreground italic text-green-600">Fully aligned!</li>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t bg-muted/10">
                <Link href={`/student/career/${rec.role.id}`} className="w-full">
                  <Button variant="ghost" className="w-full flex justify-between group">
                    View Career Pathway
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
