"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, ArrowRight, CheckCircle2, ChevronLeft, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProgramListAlignment {
  programId: string;
  programName: string;
  alignmentScore: number;
  missingHighGapCount: number;
}

interface ProgramDetail {
  programId: string;
  programName: string;
  alignmentScore: number;
  totalRequiredSkills: number;
  coveredSkills: {
    skillId: string;
    skillName: string;
    demandScore: number;
    gapScore: number;
    gapClassification: string;
  }[];
  missingSkills: {
    skillId: string;
    skillName: string;
    demandScore: number;
    gapScore: number;
    gapClassification: string;
    reason: string;
  }[];
  methodology: any;
}

export default function LMIProgramAlignmentPage() {
  const [list, setList] = useState<ProgramListAlignment[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProgramDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchList = async () => {
    setLoadingList(true);
    try {
      const res = await api.get<{ alignments: ProgramListAlignment[] }>("/lmi/program-alignment");
      setList(res.alignments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchDetail = async (id: string) => {
    setSelectedProgramId(id);
    setLoadingDetail(true);
    try {
      const res = await api.get<{ alignment: ProgramDetail }>(`/lmi/program-alignment/${id}`);
      setDetail(res.alignment);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-destructive";
  };

  const renderDetailView = () => {
    if (loadingDetail) return <div className="p-8 text-center animate-pulse">Analyzing Curriculum Alignment...</div>;
    if (!detail) return null;

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedProgramId(null)} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Programs
        </Button>

        <div className="flex flex-col md:flex-row gap-6">
          <Card className="flex-1 shadow-sm border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">{detail.programName}</CardTitle>
              <CardDescription>Platform-derived curriculum alignment insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mt-4 mb-2">
                <div className={`text-4xl font-bold ${getScoreColor(detail.alignmentScore)}`}>
                  {detail.alignmentScore}%
                </div>
                <div className="text-sm text-muted-foreground leading-tight max-w-[200px]">
                  Alignment with highest demanded skills
                </div>
              </div>
              <Progress value={detail.alignmentScore} className="h-2" />
              <p className="text-xs text-muted-foreground mt-4 italic">
                * Evaluated against {detail.totalRequiredSkills} top demanded skills. 
                Values represent internal platform alignment, not official government outcomes.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Covered Demanded Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {detail.coveredSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground">No top demanded skills are covered by this program.</p>
              ) : (
                <ul className="space-y-3">
                  {detail.coveredSkills.map(sk => (
                    <li key={sk.skillId} className="flex justify-between items-center bg-muted/30 p-3 rounded-md">
                      <div>
                        <div className="font-medium">{sk.skillName}</div>
                        <div className="text-xs text-muted-foreground">Demand Score: {sk.demandScore}</div>
                      </div>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600">Covered</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Skills to Consider
              </CardTitle>
              <CardDescription>Demanded skills absent from this program</CardDescription>
            </CardHeader>
            <CardContent>
              {detail.missingSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground">This program covers all top demanded skills!</p>
              ) : (
                <ul className="space-y-3">
                  {detail.missingSkills.map(sk => (
                    <li key={sk.skillId} className="flex justify-between items-center bg-muted/30 p-3 rounded-md">
                      <div>
                        <div className="font-medium">{sk.skillName}</div>
                        <div className="text-xs text-muted-foreground">Gap Status: {sk.gapClassification}</div>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600">Missing</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <Card className="shadow-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Active Training Programs</CardTitle>
        <CardDescription>Review how well current active programs align with LMI demand signals.</CardDescription>
      </CardHeader>
      <CardContent>
        {loadingList ? (
          <div className="text-center py-8 text-muted-foreground animate-pulse">Loading Programs...</div>
        ) : list.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No active programs found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program Name</TableHead>
                <TableHead>Alignment Score</TableHead>
                <TableHead>Missing High-Gap Skills</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map(p => (
                <TableRow key={p.programId}>
                  <TableCell className="font-medium">{p.programName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`font-bold ${getScoreColor(p.alignmentScore)}`}>
                        {p.alignmentScore}%
                      </div>
                      <Progress value={p.alignmentScore} className="w-24 h-2" />
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.missingHighGapCount > 0 ? (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                        {p.missingHighGapCount} Skills
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => fetchDetail(p.programId)}>
                      Analyze
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "INDUSTRY"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          {!selectedProgramId && (
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Course Alignment</h1>
              <p className="text-muted-foreground mt-2 text-base max-w-2xl">
                Identify which training programs address high-demand skills, and which skills are currently missing from the curriculum based on LMI signals.
              </p>
            </div>
          )}

          {selectedProgramId ? renderDetailView() : renderListView()}
        </main>
      </div>
    </ProtectedRoute>
  );
}
