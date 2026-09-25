"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, ArrowLeft, BookOpen, Briefcase, Award, Folder } from "lucide-react";

export default function CareerPathwayPage() {
  const { roleId } = useParams();
  const { user } = useAuth();
  const [pathway, setPathway] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && roleId) {
      loadPathway();
    }
  }, [user, roleId]);

  const loadPathway = async () => {
    try {
      setIsLoading(true);
      const res = await api.get<{ success: boolean; pathway: any }>(`/career-guidance/path/${roleId}`);
      if (res.success) {
        setPathway(res.pathway);
      }
    } catch (error) {
      console.error("Failed to load career pathway", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="h-8 w-24 bg-muted animate-pulse rounded mb-6" />
        <Card className="animate-pulse h-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="animate-pulse h-48" />
          <Card className="animate-pulse h-48" />
        </div>
      </div>
    );
  }

  if (!pathway) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold">Pathway not found</h2>
        <Link href="/student/career" className="mt-4 inline-block">
          <Button variant="outline">Back to Careers</Button>
        </Link>
      </div>
    );
  }

  const { role, readinessPercentage, strongMatches, skillGaps, recommendedLearning, relevantOpportunities, evidence } = pathway;

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl space-y-8">
      <div>
        <Link href="/student/career" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Recommendations
        </Link>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <Badge variant="secondary" className="mb-2">{role.category}</Badge>
            <h1 className="text-3xl font-bold">{role.title}</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl">{role.description}</p>
          </div>
          <Card className="w-full md:w-64 shrink-0 bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">Career Readiness</p>
              <div className="text-4xl font-bold text-primary mb-2">{readinessPercentage}%</div>
              <Progress value={readinessPercentage} className="h-2" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" /> Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strongMatches.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">No strong matches yet.</p>
            ) : (
              <ul className="space-y-3">
                {strongMatches.map((skill: any) => (
                  <li key={skill.skillId} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                      Level {skill.studentProficiency} / {skill.requiredProficiency}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Gaps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" /> Skills to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            {skillGaps.length === 0 ? (
              <p className="text-muted-foreground text-sm italic text-green-600">You meet all skill requirements!</p>
            ) : (
              <ul className="space-y-3">
                {skillGaps.map((skill: any) => (
                  <li key={skill.skillId} className="flex justify-between items-center text-sm">
                    <span className="font-medium">{skill.name}</span>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
                      Level {skill.studentProficiency} / {skill.requiredProficiency}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Learning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> What to Learn Next
          </CardTitle>
          <CardDescription>Courses and resources to close your skill gaps.</CardDescription>
        </CardHeader>
        <CardContent>
          {recommendedLearning.length === 0 ? (
            <p className="text-muted-foreground text-sm">No specific resources found for your current gaps.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendedLearning.map((resource: any) => (
                <div key={resource.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors">
                  <h4 className="font-medium mb-1 line-clamp-1">{resource.title}</h4>
                  <p className="text-xs text-muted-foreground mb-3">{resource.provider}</p>
                  <Link href={`/student/learning?q=${resource.title}`}>
                    <Button variant="secondary" size="sm" className="w-full">View Resource</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relevant Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" /> Relevant Opportunities
          </CardTitle>
          <CardDescription>Internships, jobs, and challenges matching this career.</CardDescription>
        </CardHeader>
        <CardContent>
          {relevantOpportunities.length === 0 ? (
            <p className="text-muted-foreground text-sm">No open opportunities found at this time.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {relevantOpportunities.map((opp: any) => (
                <div key={opp.id} className="p-4 border rounded-lg flex flex-col justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2">{opp.type}</Badge>
                    <h4 className="font-medium line-clamp-1">{opp.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4">{opp.organization.name}</p>
                  </div>
                  <Link href={`/student/opportunities/${opp.id}`}>
                    <Button variant="outline" size="sm" className="w-full">View Details</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Evidence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" /> Your Portfolio Evidence
          </CardTitle>
          <CardDescription>Your existing achievements related to this career path.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {evidence.portfolio.length === 0 && evidence.certificates.length === 0 && evidence.internships.length === 0 && evidence.projectWorkspaces.length === 0 ? (
              <p className="text-muted-foreground text-sm">You haven't added any related projects, internships, or certificates yet.</p>
            ) : (
              <>
                {evidence.internships.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Internships & Jobs</h4>
                    <div className="space-y-2">
                      {evidence.internships.map((int: any) => (
                        <div key={int.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-md border">
                          <Briefcase className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{int.opportunity.title}</span>
                          <Badge variant="secondary" className="ml-auto text-[10px]">{int.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {evidence.projectWorkspaces.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Live Projects</h4>
                    <div className="space-y-2">
                      {evidence.projectWorkspaces.map((proj: any) => (
                        <div key={proj.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-md border">
                          <Folder className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{proj.opportunity.title}</span>
                          <Badge variant="secondary" className="ml-auto text-[10px]">{proj.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {evidence.certificates.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Certifications</h4>
                    <div className="space-y-2">
                      {evidence.certificates.map((cert: any) => (
                        <div key={cert.id} className="flex items-center gap-2 p-3 bg-muted/30 rounded-md border">
                          <Award className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">{cert.title}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{cert.issuer}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
