"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Building2, CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck } from "lucide-react";

export default function EmployerValidationAdminPage() {
  const [skillIdInput, setSkillIdInput] = useState("");
  const [skillData, setSkillData] = useState<any>(null);
  const [programIdInput, setProgramIdInput] = useState("");
  const [programData, setProgramData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillIdInput) return;
    setLoading(true);
    try {
      const res = await api.get<any>(`/lmi/skills/${skillIdInput}/employer-validations`);
      setSkillData(res);
    } catch (err) {
      console.error(err);
      setSkillData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programIdInput) return;
    setLoading(true);
    try {
      const res = await api.get<any>(`/lmi/programs/${programIdInput}/employer-validations`);
      setProgramData(res);
    } catch (err) {
      console.error(err);
      setProgramData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-primary" />
              Employer Validation & Outcomes
            </h1>
            <p className="text-muted-foreground mt-2 max-w-3xl">
              Inspect platform-observed employer validation for skills and programs. This evidence represents explicit feedback provided by industry partners, separate from raw demand aggregation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* SKILL LOOKUP */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Validation Lookup</CardTitle>
                <CardDescription>Enter a Skill ID to view employer consensus.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={fetchSkill} className="flex gap-2 mb-6">
                  <input 
                    type="text" 
                    placeholder="e.g. cmugt9fd8000mrib8wqo22rl7" 
                    value={skillIdInput} 
                    onChange={e => setSkillIdInput(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <button type="submit" className="h-10 px-4 bg-primary text-primary-foreground rounded-md font-medium text-sm">
                    Search
                  </button>
                </form>

                {skillData && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Validations</div>
                        <div className="text-3xl font-bold">{skillData.totalCount}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                        <Badge variant={skillData.confidence === 'HIGH' ? 'default' : 'secondary'}>
                          {skillData.confidence}
                        </Badge>
                      </div>
                    </div>
                    
                    {skillData.totalCount > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-center">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                          <div className="text-emerald-800 font-semibold">{skillData.breakdown.RELEVANT}</div>
                          <div className="text-xs text-emerald-600">Relevant</div>
                        </div>
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded text-center">
                          <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                          <div className="text-blue-800 font-semibold">{skillData.breakdown.EMERGING_IMPORTANCE}</div>
                          <div className="text-xs text-blue-600">Emerging</div>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded text-center">
                          <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                          <div className="text-amber-800 font-semibold">{skillData.breakdown.LOW_RELEVANCE}</div>
                          <div className="text-xs text-amber-600">Low Relevance</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* PROGRAM LOOKUP */}
            <Card>
              <CardHeader>
                <CardTitle>Program Validation Lookup</CardTitle>
                <CardDescription>Enter a Program ID to view employer feedback.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={fetchProgram} className="flex gap-2 mb-6">
                  <input 
                    type="text" 
                    placeholder="Program ID" 
                    value={programIdInput} 
                    onChange={e => setProgramIdInput(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <button type="submit" className="h-10 px-4 bg-primary text-primary-foreground rounded-md font-medium text-sm">
                    Search
                  </button>
                </form>

                {programData && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg border">
                      <div>
                        <div className="text-sm text-muted-foreground">Total Validations</div>
                        <div className="text-3xl font-bold">{programData.totalCount}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                        <Badge variant={programData.confidence === 'HIGH' ? 'default' : 'secondary'}>
                          {programData.confidence}
                        </Badge>
                      </div>
                    </div>

                    {programData.validations && programData.validations.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="font-semibold text-sm">Recent Feedback</h4>
                        {programData.validations.map((v: any) => (
                          <div key={v.id} className="p-3 border rounded-md text-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-1 font-medium">
                                <Building2 className="w-4 h-4 text-muted-foreground" />
                                {v.organizationName}
                              </div>
                              <Badge variant="outline">{v.relevance}</Badge>
                            </div>
                            {v.comments && <p className="text-muted-foreground italic">"{v.comments}"</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
