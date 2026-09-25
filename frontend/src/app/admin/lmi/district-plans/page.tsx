"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, AlertCircle, AlertTriangle, TrendingUp, Info, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrioritySkill {
  skillId: string;
  skillName: string;
  demandScore: number;
  supplyScore: number;
  gapScore: number;
  priorityLevel: string;
  priorityReason: string;
}

interface RecommendedProgram {
  programId: string;
  programTitle: string;
  alignmentScore: number;
  coveredPrioritySkills: string[];
  priorityReason: string;
}

interface DistrictPlan {
  district: string;
  evidenceStatus: string;
  totalDemandSignals: number;
  totalTrainingPrograms: number;
  prioritySkills: PrioritySkill[];
  recommendedPrograms: RecommendedProgram[];
  oversuppliedSkills: any[];
}

export default function DistrictPlansPage() {
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [plan, setPlan] = useState<DistrictPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      const res = await api.get<{ districts: string[] }>("/lmi/district-plans");
      setDistricts(res.districts || []);
      if (res.districts && res.districts.length > 0) {
        setSelectedDistrict(res.districts[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDistrict) {
      fetchPlan(selectedDistrict);
    }
  }, [selectedDistrict]);

  const fetchPlan = async (district: string) => {
    try {
      const res = await api.get<{ plan: DistrictPlan }>(`/lmi/district-plans/${encodeURIComponent(district)}`);
      setPlan(res.plan);
    } catch (err) {
      console.error(err);
    }
  };

  const exportCSV = () => {
    if (!plan) return;

    const rows: string[][] = [];
    // Header section
    rows.push([`District Training Plan: ${plan.district}`]);
    rows.push([`Generated: ${new Date().toISOString()}`]);
    rows.push([`Evidence Status: ${plan.evidenceStatus}`]);
    rows.push([`Total Demand Signals: ${plan.totalDemandSignals}`, `Total Training Programs: ${plan.totalTrainingPrograms}`]);
    rows.push([]);

    // Priority Skills
    rows.push(["=== PRIORITY SKILLS ==="]);
    rows.push(["Skill", "Demand Score", "Supply Score", "Gap Score", "Priority Level", "Priority Reason"]);
    for (const s of plan.prioritySkills) {
      rows.push([s.skillName, String(s.demandScore), String(s.supplyScore), String(s.gapScore), s.priorityLevel, s.priorityReason]);
    }
    rows.push([]);

    // Recommended Programs
    rows.push(["=== RECOMMENDED PROGRAMS ==="]);
    rows.push(["Program", "Alignment Score", "Covered Priority Skills", "Reason"]);
    for (const p of plan.recommendedPrograms) {
      rows.push([p.programTitle, String(p.alignmentScore) + "%", p.coveredPrioritySkills.join("; "), p.priorityReason]);
    }
    rows.push([]);

    // Oversupply Warnings
    if (plan.oversuppliedSkills.length > 0) {
      rows.push(["=== OVERSUPPLY WARNINGS ==="]);
      rows.push(["Skill", "Supply/Demand Ratio", "Flag", "Explanation"]);
      for (const o of plan.oversuppliedSkills) {
        rows.push([o.skillName, String(o.ratio), o.flag, o.explanation]);
      }
    }

    const csvContent = rows.map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `district-plan-${plan.district.replace(/[^a-zA-Z0-9]/g, '_')}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <MapPin className="w-8 h-8 text-primary" />
                District Training Plans
              </h1>
              <p className="text-muted-foreground mt-2 text-base max-w-2xl">
                Intelligence layer identifying high-priority skills and recommended training focus areas based on observed local market demand vs training supply.
              </p>
            </div>
            
            {districts.length > 0 && (
              <div className="flex items-center gap-3">
                <div className="w-64">
                  <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {plan && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={exportCSV}>
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={async () => {
                        try {
                          await api.post(`/lmi/district-plans/${encodeURIComponent(selectedDistrict)}/snapshot`, {});
                          // We could use toast from sonner here, assuming it's available, but alert is a simple fallback if not imported
                          alert("Snapshot saved successfully to audit history.");
                        } catch (err) {
                          alert("Failed to save snapshot.");
                        }
                      }}
                    >
                      Save Snapshot
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground animate-pulse">Loading intelligence...</div>
          ) : districts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground py-12">
                No district-level demand evidence is currently available.
              </CardContent>
            </Card>
          ) : plan ? (
            <div className="space-y-6">
              
              {/* STATUS BANNER */}
              {plan.evidenceStatus === 'INSUFFICIENT_DATA' ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-md flex gap-3 items-start">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Insufficient Evidence</h3>
                    <p className="text-sm mt-1">Historical/district demand evidence is insufficient for a reliable recommendation. Metrics shown below may be volatile or inaccurate.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Observed Demand Signals</CardDescription>
                      <CardTitle className="text-3xl">{plan.totalDemandSignals}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Active Local/Online Programs</CardDescription>
                      <CardTitle className="text-3xl">{plan.totalTrainingPrograms}</CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              )}

              {/* PRIORITY SKILLS */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" /> Priority Skills for {plan.district}
                  </CardTitle>
                  <CardDescription>Skills with the largest gap between local demand and available training.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Skill</TableHead>
                        <TableHead>Demand</TableHead>
                        <TableHead>Supply</TableHead>
                        <TableHead>Gap</TableHead>
                        <TableHead>Priority</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plan.prioritySkills.length === 0 ? (
                         <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground h-24">No priority skills identified.</TableCell></TableRow>
                      ) : (
                        plan.prioritySkills.map((skill) => (
                          <TableRow key={skill.skillId}>
                            <TableCell className="font-medium">
                              {skill.skillName}
                              <div className="text-xs text-muted-foreground mt-1">{skill.priorityReason}</div>
                            </TableCell>
                            <TableCell>{skill.demandScore}</TableCell>
                            <TableCell>{skill.supplyScore}</TableCell>
                            <TableCell>
                              <span className={skill.gapScore >= 5 ? 'text-destructive font-medium' : ''}>
                                {skill.gapScore > 0 ? '+' : ''}{skill.gapScore}
                              </span>
                            </TableCell>
                            <TableCell>
                              {skill.priorityLevel === 'HIGH' ? <Badge variant="destructive">High</Badge> : 
                               skill.priorityLevel === 'MEDIUM' ? <Badge className="bg-amber-500">Medium</Badge> :
                               <Badge variant="secondary">{skill.priorityLevel}</Badge>}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* RECOMMENDED PROGRAMS */}
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Existing Programs</CardTitle>
                  <CardDescription>Currently published programs that address priority gaps in this district.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Program Title</TableHead>
                        <TableHead>Alignment</TableHead>
                        <TableHead>Covered Priority Skills</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plan.recommendedPrograms.length === 0 ? (
                         <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground h-24">No existing programs cover the priority skills for this district.</TableCell></TableRow>
                      ) : (
                        plan.recommendedPrograms.map((prog) => (
                          <TableRow key={prog.programId}>
                            <TableCell className="font-medium">
                               {prog.programTitle}
                               <div className="text-xs text-muted-foreground mt-1">{prog.priorityReason}</div>
                            </TableCell>
                            <TableCell>
                               {prog.alignmentScore >= 50 ? (
                                  <Badge className="bg-emerald-500 hover:bg-emerald-600">{prog.alignmentScore}%</Badge>
                                ) : prog.alignmentScore >= 20 ? (
                                  <Badge className="bg-amber-500 hover:bg-amber-600">{prog.alignmentScore}%</Badge>
                                ) : (
                                  <Badge variant="secondary">{prog.alignmentScore}%</Badge>
                                )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {prog.coveredPrioritySkills.map(s => (
                                  <Badge key={s} variant="outline" className="text-xs bg-muted/30">{s}</Badge>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* OVERSUPPLY */}
              {plan.oversuppliedSkills.length > 0 && (
                <Card className="border-amber-200">
                  <CardHeader className="bg-amber-50/50 border-b">
                    <CardTitle className="text-amber-800 flex items-center gap-2">
                       <AlertCircle className="w-5 h-5" /> Local Oversupply Warnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {plan.oversuppliedSkills.map((os, i) => (
                        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-md">
                           <div>
                             <h4 className="font-semibold">{os.skillName}</h4>
                             <p className="text-sm text-muted-foreground">{os.explanation}</p>
                           </div>
                           <div className="mt-3 md:mt-0 text-right shrink-0">
                             <div className="text-xs uppercase text-muted-foreground tracking-wider mb-1">Supply Ratio</div>
                             <Badge variant="outline" className="bg-background text-base">{os.ratio}x</Badge>
                           </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* METHODOLOGY INFO */}
              <div className="text-xs text-muted-foreground flex items-start gap-2 bg-muted/30 p-4 rounded border">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground mb-1">Methodology Disclaimer</p>
                  <p>These indicators are calculated from platform-observed demand signals and training supply. They are not official government labour-market statistics. Priority is determined deterministically based on gap size and available signal volume. No automatic policy decisions are made by this system.</p>
                </div>
              </div>

            </div>
          ) : null}

        </main>
      </div>
    </ProtectedRoute>
  );
}
