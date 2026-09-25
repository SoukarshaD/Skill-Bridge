"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Edit } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle, AlertTriangle, ShieldAlert } from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";

export default function IndustryProgramDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [program, setProgram] = useState<any>(null);
  const [alignment, setAlignment] = useState<any>(null);
  const [reviewFlags, setReviewFlags] = useState<any[]>([]);
  const [employerValidation, setEmployerValidation] = useState<any>(null);
  const [outcomes, setOutcomes] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgram();
  }, [id]);

  const fetchProgram = async () => {
    try {
      const [progRes, alignRes, reviewRes, empRes, outRes] = await Promise.all([
        api.get(`/programs/${id}`),
        api.get<{ alignment: any }>(`/lmi/program-alignment/${id}`).catch(() => null),
        api.get<{ review: any }>(`/lmi/programs/${id}/review-flags`).catch(() => null),
        api.get<any>(`/lmi/programs/${id}/employer-validations`).catch(() => null),
        api.get<any>(`/lmi/programs/${id}/outcomes`).catch(() => null)
      ]);
      setProgram(progRes);
      if (alignRes?.alignment) setAlignment(alignRes.alignment);
      if (reviewRes?.review?.flags) setReviewFlags(reviewRes.review.flags);
      if (empRes?.success) setEmployerValidation(empRes);
      if (outRes?.success) setOutcomes(outRes);
    } catch (e) {
      toast.error("Failed to load program details");
      router.push("/academician/programs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 px-4 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!program) return null;

  return (
    <ProtectedRoute allowedRoles={["ACADEMICIAN"]}>
      <Navbar />
    <div className="container mx-auto py-8 px-4 md:px-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/academician/programs" className="hover:text-primary transition-colors">Programs</Link>
          <span>/</span>
          <span className="text-foreground">{program.title}</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/academician/programs/${id}/participants`}>
            <Button variant="outline">View Participants</Button>
          </Link>
          <Button disabled variant="secondary"><Edit className="mr-2 h-4 w-4" /> Edit Program</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className="bg-primary/10 text-primary uppercase">
                {program.type.replace('_', ' ')}
              </Badge>
              <Badge variant={program.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                {program.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{program.title}</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{program.description}</p>
            </CardContent>
          </Card>

          {program.requiredSkills && program.requiredSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Target Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {program.requiredSkills.map((s: any) => (
                    <Badge key={s.id} variant="secondary">
                      {s.skill?.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {alignment && (
            <Card className="border-border/50 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Industry Alignment
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      Platform-derived curriculum alignment insights based on current labour market demand.
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{alignment.alignmentScore}%</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Alignment Score</div>
                  </div>
                </div>
                <Progress value={alignment.alignmentScore} className="h-1.5 mt-4" />
              </CardHeader>
              <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Covered high-demand skills
                  </h4>
                  {alignment.coveredSkills.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No top-demanded skills are covered.</p>
                  ) : (
                    <ul className="space-y-2">
                      {alignment.coveredSkills.slice(0, 5).map((sk: any) => (
                        <li key={sk.skillId} className="flex justify-between items-center bg-muted/20 px-2.5 py-1.5 rounded-md text-sm">
                          <span>{sk.skillName}</span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">Covered</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Skills to consider
                  </h4>
                  {alignment.missingSkills.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Curriculum fully aligns with highest demand.</p>
                  ) : (
                    <ul className="space-y-2">
                      {alignment.missingSkills.slice(0, 5).map((sk: any) => (
                        <li key={sk.skillId} className="flex justify-between items-center bg-muted/20 px-2.5 py-1.5 rounded-md text-sm">
                          <span>{sk.skillName}</span>
                          <span className="text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">Missing</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-3 italic leading-tight">
                    * Skills to consider for curriculum review. Does not require immediate syllabus removal.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {reviewFlags.length > 0 && reviewFlags.some(f => f.flagType !== 'BALANCED') && (
            <Card className="border-border/50 shadow-sm border-amber-200">
              <CardHeader className="bg-amber-50/50 pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                  <AlertTriangle className="w-5 h-5" />
                  Curriculum Review Signals
                </CardTitle>
                <CardDescription className="text-amber-700/80">
                  Important observations based on platform intelligence.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {reviewFlags.filter(f => f.flagType !== 'BALANCED').map((flag, idx) => (
                  <div key={idx} className="bg-background rounded-md p-4 border border-amber-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      {flag.flagType === 'POTENTIAL_OBSOLESCENCE' ? (
                        <ShieldAlert className="w-5 h-5 text-destructive" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      )}
                      <h4 className="font-semibold text-base">{flag.flagType.replace('_', ' ')}</h4>
                      <Badge variant={flag.severity === 'HIGH' ? 'destructive' : 'outline'} className="ml-auto text-xs">
                        {flag.severity} Severity
                      </Badge>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground block mb-1">Why:</span>
                        <p>{flag.explanation}</p>
                      </div>
                      
                      {flag.evidence && (
                        <div className="bg-muted/50 p-2.5 rounded text-xs flex gap-4">
                           {flag.evidence.ratio !== undefined && <span><strong>Supply/Demand:</strong> {flag.evidence.ratio}x</span>}
                           {flag.evidence.demandTrend && <span><strong>Trend:</strong> {flag.evidence.demandTrend}</span>}
                        </div>
                      )}

                      <div>
                        <span className="font-medium text-muted-foreground block mb-1">Confidence:</span>
                        <p>{flag.confidence} (based on available signal volume)</p>
                      </div>

                      <div className="bg-amber-50 text-amber-900 p-3 rounded-md mt-2 border border-amber-100/50">
                        <span className="font-semibold block mb-1">Suggested Review:</span>
                        <p>{flag.recommendedAction}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* PHASE 15: Employer Validation & Outcomes */}
          {(employerValidation || outcomes) && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-slate-50/50 pb-4 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Employer Validation & Outcomes
                </CardTitle>
                <CardDescription>
                  Real-world validation and observed participant outcomes.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Validation Section */}
                {employerValidation && employerValidation.totalCount > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-3">Industry Validation Evidence</h4>
                    <div className="flex gap-4 p-3 bg-muted/50 rounded-md border text-sm">
                      <div>
                         <div className="text-muted-foreground">Validations</div>
                         <div className="text-lg font-bold">{employerValidation.totalCount}</div>
                      </div>
                      <div>
                         <div className="text-muted-foreground">Confidence</div>
                         <Badge variant="outline">{employerValidation.confidence}</Badge>
                      </div>
                      <div className="ml-auto flex gap-3 text-right">
                         <div><span className="text-emerald-600 font-medium">{employerValidation.breakdown.RELEVANT}</span> Relevant</div>
                         <div><span className="text-amber-600 font-medium">{employerValidation.breakdown.LOW_RELEVANCE}</span> Low Relevance</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Outcomes Section */}
                {outcomes && (
                  <div className="pt-2 border-t">
                    <h4 className="font-semibold text-sm mb-3 mt-4">Observed Training Outcomes</h4>
                    <div className="text-sm text-muted-foreground mb-3">{outcomes.note}</div>
                    
                    {outcomes.evidenceStatus === 'INSUFFICIENT_DATA' ? (
                      <div className="p-3 bg-amber-50 text-amber-800 rounded border border-amber-100 text-sm">
                        Insufficient outcome data (requires at least 5 tracked participants).
                      </div>
                    ) : (
                      <div className="space-y-3">
                         <div className="flex justify-between items-center">
                           <span className="text-sm font-medium">Completion Rate</span>
                           <span className="text-sm">{outcomes.rates.completionRate}%</span>
                         </div>
                         <Progress value={outcomes.rates.completionRate} className="h-2 bg-muted" />

                         <div className="flex justify-between items-center mt-4">
                           <span className="text-sm font-medium">Employment Rate</span>
                           <span className="text-sm">{outcomes.rates.employmentRate}%</span>
                         </div>
                         <Progress value={outcomes.rates.employmentRate} className="h-2 bg-muted" />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>

        <div className="w-full md:w-80 space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3 text-sm">
                {program.startDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Dates</p>
                      <p className="text-muted-foreground">
                        {format(new Date(program.startDate), "MMM d, yyyy")}
                        {program.endDate && ` - ${format(new Date(program.endDate), "MMM d, yyyy")}`}
                      </p>
                    </div>
                  </div>
                )}
                {program.duration && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-muted-foreground">{program.duration}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{program.mode} {program.location ? `- ${program.location}` : ""}</p>
                  </div>
                </div>
                {program.capacity && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-muted-foreground">{program.capacity} seats</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}