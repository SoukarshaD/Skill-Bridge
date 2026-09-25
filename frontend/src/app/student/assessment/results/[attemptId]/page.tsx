"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Trophy, Target, TrendingUp, AlertTriangle, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SkillPerformance {
  skillName: string;
  percentage: number;
}

interface QuestionData {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
}

interface ResponseData {
  id: string;
  answer: string;
  isCorrect: boolean;
  marksAwarded: number;
  question: QuestionData;
}

interface ResultData {
  id: string;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
  assessment: {
    title: string;
    type: string;
  };
  responses: ResponseData[];
  strongestSkills: SkillPerformance[];
  skillGaps: SkillPerformance[];
  skillsPerformance: SkillPerformance[];
}

export default function AssessmentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await api.get<ResultData>(`/assessments/attempts/${params.attemptId}`);
        setResult(data);
      } catch (error) {
        console.error("Failed to load results:", error);
      } finally {
        setLoading(false);
      }
    };
    if (params.attemptId) fetchResult();
  }, [params.attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <p className="text-muted-foreground animate-pulse">Calculating your results...</p>
        </main>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <p className="text-destructive font-medium">Failed to load assessment results.</p>
        </main>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-12 max-w-5xl">
          
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            
            {/* Left Column - Overall Score */}
            <div className="w-full md:w-1/3">
              <Card className="h-full border-primary/20 shadow-md">
                <CardHeader className="text-center pb-2">
                  <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{result.assessment.title}</p>
                </CardHeader>
                <CardContent className="text-center pt-6">
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-muted/20" />
                      <circle 
                        cx="80" 
                        cy="80" 
                        r="70" 
                        fill="transparent" 
                        stroke="currentColor" 
                        strokeWidth="12" 
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * (result.percentage || 0)) / 100}
                        className="text-primary transition-all duration-1000" 
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold">{Math.round(result.percentage || 0)}%</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-center divide-x">
                    <div className="px-4">
                      <p className="text-sm text-muted-foreground">Score</p>
                      <p className="font-semibold text-lg">{result.score}</p>
                    </div>
                    <div className="px-4">
                      <p className="text-sm text-muted-foreground">Max</p>
                      <p className="font-semibold text-lg">{result.maxScore}</p>
                    </div>
                  </div>

                  <div className="mt-8 bg-muted/50 p-4 rounded-lg text-sm text-left">
                    <p className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      Your Student Skill Profile has been successfully updated based on these results.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Skills Breakdown */}
            <div className="w-full md:w-2/3 space-y-6">
              
              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-green-500" /> Strongest Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {result.strongestSkills && result.strongestSkills.length > 0 ? (
                    result.strongestSkills.map((skill, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{skill.skillName}</span>
                          <span className="text-green-600 font-medium">{Math.round(skill.percentage)}%</span>
                        </div>
                        <Progress value={skill.percentage} className="h-2 bg-muted/50 [&>div]:bg-green-500" />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific strengths identified in this assessment.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="w-5 h-5 text-orange-500" /> Skill Gaps (Areas to Improve)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {result.skillGaps && result.skillGaps.length > 0 ? (
                    result.skillGaps.map((skill, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{skill.skillName}</span>
                          <span className="text-orange-600 font-medium">{Math.round(skill.percentage)}%</span>
                        </div>
                        <Progress value={skill.percentage} className="h-2 bg-muted/50 [&>div]:bg-orange-500" />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No critical skill gaps identified in this assessment.</p>
                  )}
                </CardContent>
                <CardFooter className="bg-muted/30 pt-4 pb-4">
                  <p className="text-xs text-muted-foreground w-full text-center">
                    These gaps have automatically fed your Learning Recommendations.
                  </p>
                </CardFooter>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button className="flex-1" variant="outline" onClick={() => router.push("/student/dashboard")}>
                  Return to Dashboard
                </Button>
                <Button className="flex-1" onClick={() => router.push("/student/learning")}>
                  View New Recommendations
                </Button>
              </div>

            </div>
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Detailed Feedback</h2>
            <div className="space-y-6">
              {result.responses.map((response, index) => {
                const q = response.question;
                return (
                  <Card key={response.id} className={cn("border-l-4 shadow-sm", response.isCorrect ? "border-l-green-500" : "border-l-red-500")}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-4">
                            <span className="text-muted-foreground mr-2">{index + 1}.</span> 
                            {q.questionText}
                          </h3>
                          <div className="space-y-2">
                            {q.options.map((opt, i) => {
                              let optionClass = "p-3 rounded-md border text-sm flex justify-between items-center";
                              let icon = null;
                              
                              if (opt === q.correctAnswer && opt === response.answer) {
                                optionClass += " bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-900 dark:text-green-100";
                                icon = <Check className="w-5 h-5 text-green-600 dark:text-green-400" />;
                              } else if (opt === q.correctAnswer && opt !== response.answer) {
                                optionClass += " bg-green-50/50 border-green-200 border-dashed text-green-900 dark:bg-green-900/10 dark:border-green-900 dark:text-green-100";
                                icon = <Check className="w-5 h-5 text-green-600/50 dark:text-green-400/50" />;
                              } else if (opt === response.answer && opt !== q.correctAnswer) {
                                optionClass += " bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-900 dark:text-red-100";
                                icon = <X className="w-5 h-5 text-red-600 dark:text-red-400" />;
                              } else {
                                optionClass += " bg-muted/20 border-transparent text-muted-foreground";
                              }
                              
                              return (
                                <div key={i} className={optionClass}>
                                  <span>{opt}</span>
                                  {icon}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

        </main>
      </div>
    </ProtectedRoute>
  );
}
