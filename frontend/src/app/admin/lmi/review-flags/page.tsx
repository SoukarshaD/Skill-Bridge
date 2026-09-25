"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, ArrowRight, ShieldAlert, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ReviewFlag {
  flagType: string;
  severity: string;
  confidence: string;
  explanation: string;
  recommendedAction: string;
  evidence: any;
}

interface ProgramReview {
  programId: string;
  programName: string;
  flags: ReviewFlag[];
}

export default function LMIReviewFlagsPage() {
  const [reviews, setReviews] = useState<ProgramReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get<{ reviews: ProgramReview[] }>("/lmi/review-flags");
      setReviews(res.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    if (severity === 'HIGH') return <Badge variant="destructive">High</Badge>;
    if (severity === 'MEDIUM') return <Badge className="bg-amber-500 hover:bg-amber-600">Medium</Badge>;
    return <Badge variant="secondary">Low</Badge>;
  };

  const getFlagIcon = (flagType: string) => {
    if (flagType === 'POTENTIAL_OBSOLESCENCE') return <ShieldAlert className="w-4 h-4 text-destructive" />;
    return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "INDUSTRY"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Curriculum Review Flags</h1>
            <p className="text-muted-foreground mt-2 text-base max-w-2xl">
              Platform-derived intelligence identifying potential oversupply or obsolescence based on labor market trends.
              These are review signals, not definitive mandates.
            </p>
          </div>

          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Programs Requiring Attention</CardTitle>
              <CardDescription>Programs exhibiting evidence of severe misalignment or oversupply.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground animate-pulse">Analyzing Programs...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-4 opacity-20" />
                  No critical review flags detected across published programs.
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.programId} className="border rounded-lg p-5 bg-card relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{review.programName}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            {review.flags.map((flag, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md text-sm border">
                                {getFlagIcon(flag.flagType)}
                                <span className="font-medium">{flag.flagType.replace('_', ' ')}</span>
                                {getSeverityBadge(flag.severity)}
                                <Badge variant="outline" className="text-xs">Conf: {flag.confidence}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Link href={`/admin/lmi/program-alignment`}>
                          <Button variant="outline" size="sm">View Alignment</Button>
                        </Link>
                      </div>

                      <div className="space-y-4">
                        {review.flags.map((flag, idx) => (
                          <div key={idx} className="bg-muted/30 rounded-md p-4 text-sm">
                            <p className="font-medium mb-1">Evidence:</p>
                            <p className="text-muted-foreground mb-3">{flag.explanation}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 p-3 bg-background rounded border">
                              {flag.evidence?.ratio !== undefined && (
                                <div>
                                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Supply/Demand Ratio</div>
                                  <div className="font-semibold">{flag.evidence.ratio}x</div>
                                </div>
                              )}
                              {flag.evidence?.demandTrend && (
                                <div>
                                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Historical Trend</div>
                                  <div className="font-semibold">{flag.evidence.demandTrend}</div>
                                </div>
                              )}
                              {flag.evidence?.alignmentScore !== undefined && (
                                <div>
                                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Alignment Score</div>
                                  <div className="font-semibold">{flag.evidence.alignmentScore}%</div>
                                </div>
                              )}
                            </div>

                            <p className="text-primary font-medium text-xs uppercase tracking-wider">Recommended Action:</p>
                            <p className="text-foreground">{flag.recommendedAction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Temporary fallback for CheckCircle2
function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
