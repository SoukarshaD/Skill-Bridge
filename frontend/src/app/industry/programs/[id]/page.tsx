"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Edit, CheckCircle2, ShieldCheck, TrendingUp, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function IndustryProgramDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Validation state
  const [validationData, setValidationData] = useState<any>(null);
  const [selectedRelevance, setSelectedRelevance] = useState<string>("");
  const [validationComment, setValidationComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Per-skill validation
  const [skillRelevance, setSkillRelevance] = useState<Record<string, string>>({});
  const [skillSubmitting, setSkillSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetchProgram();
  }, [id]);

  const fetchProgram = async () => {
    try {
      const [progData, valData] = await Promise.all([
        api.get(`/programs/${id}`),
        api.get<any>(`/lmi/programs/${id}/employer-validations`).catch(() => null)
      ]);
      setProgram(progData);
      if (valData?.success) setValidationData(valData);
    } catch (e) {
      toast.error("Failed to load program details");
      router.push("/industry/programs");
    } finally {
      setLoading(false);
    }
  };

  const submitProgramValidation = async () => {
    if (!selectedRelevance) {
      toast.error("Please select a relevance level");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/lmi/employer-validations", {
        programId: id,
        relevance: selectedRelevance,
        comments: validationComment || undefined
      });
      toast.success("Program validation submitted");
      setSelectedRelevance("");
      setValidationComment("");
      // Refresh validation data
      const valData = await api.get<any>(`/lmi/programs/${id}/employer-validations`).catch(() => null);
      if (valData?.success) setValidationData(valData);
    } catch (e: any) {
      toast.error(e.message || "Failed to submit validation");
    } finally {
      setSubmitting(false);
    }
  };

  const submitSkillValidation = async (skillId: string) => {
    const rel = skillRelevance[skillId];
    if (!rel) {
      toast.error("Please select a relevance level");
      return;
    }
    setSkillSubmitting(skillId);
    try {
      await api.post("/lmi/employer-validations", {
        skillId,
        relevance: rel
      });
      toast.success("Skill validation submitted");
      setSkillRelevance(prev => ({ ...prev, [skillId]: "" }));
    } catch (e: any) {
      toast.error(e.message || "Failed to submit");
    } finally {
      setSkillSubmitting(null);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 px-4 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!program) return null;

  return (
    <ProtectedRoute allowedRoles={["INDUSTRY"]}>
      <Navbar />
    <div className="container mx-auto py-8 px-4 md:px-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/industry/programs" className="hover:text-primary transition-colors">Programs</Link>
          <span>/</span>
          <span className="text-foreground">{program.title}</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/industry/programs/${id}/participants`}>
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

          {/* TARGET SKILLS + PER-SKILL VALIDATION */}
          {program.requiredSkills && program.requiredSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Target Skills — Validate Relevance
                </CardTitle>
                <CardDescription>
                  As an industry partner, confirm whether each skill remains relevant to your hiring needs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {program.requiredSkills.map((s: any) => (
                    <div key={s.id} className="flex items-center gap-3 p-3 border rounded-md bg-muted/30">
                      <Badge variant="secondary" className="min-w-[100px] justify-center">
                        {s.skill?.name}
                      </Badge>
                      <Select
                        value={skillRelevance[s.skillId] || ""}
                        onValueChange={(val) => setSkillRelevance(prev => ({ ...prev, [s.skillId]: val }))}
                      >
                        <SelectTrigger className="w-[180px] h-9">
                          <SelectValue placeholder="Select relevance" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RELEVANT">
                            <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Relevant</span>
                          </SelectItem>
                          <SelectItem value="EMERGING_IMPORTANCE">
                            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-blue-600" /> Emerging</span>
                          </SelectItem>
                          <SelectItem value="LOW_RELEVANCE">
                            <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-600" /> Low Relevance</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!skillRelevance[s.skillId] || skillSubmitting === s.skillId}
                        onClick={() => submitSkillValidation(s.skillId)}
                      >
                        {skillSubmitting === s.skillId ? "..." : "Submit"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* PROGRAM-LEVEL VALIDATION */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Validate This Program
              </CardTitle>
              <CardDescription>
                Provide your overall assessment of this program&apos;s industry relevance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Overall Relevance</label>
                <Select value={selectedRelevance} onValueChange={setSelectedRelevance}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="How relevant is this program to your sector?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RELEVANT">Relevant — Aligns well with our industry needs</SelectItem>
                    <SelectItem value="EMERGING_IMPORTANCE">Emerging — Addresses growing skill demands</SelectItem>
                    <SelectItem value="LOW_RELEVANCE">Low Relevance — Misaligned with current needs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Comments (optional)</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Additional context for training providers and administrators..."
                  value={validationComment}
                  onChange={e => setValidationComment(e.target.value)}
                  maxLength={2000}
                />
              </div>
              <Button onClick={submitProgramValidation} disabled={submitting || !selectedRelevance}>
                {submitting ? "Submitting..." : "Submit Validation"}
              </Button>
            </CardContent>
          </Card>

          {/* EXISTING VALIDATION SUMMARY */}
          {validationData && validationData.totalCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Platform-Observed Employer Validation</CardTitle>
                <CardDescription>Aggregated from {validationData.totalCount} employer validation(s).</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-emerald-50 rounded border border-emerald-100">
                    <div className="text-emerald-700 font-bold text-xl">{validationData.breakdown.RELEVANT}</div>
                    <div className="text-xs text-emerald-600">Relevant</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded border border-blue-100">
                    <div className="text-blue-700 font-bold text-xl">{validationData.breakdown.EMERGING_IMPORTANCE}</div>
                    <div className="text-xs text-blue-600">Emerging</div>
                  </div>
                  <div className="p-3 bg-amber-50 rounded border border-amber-100">
                    <div className="text-amber-700 font-bold text-xl">{validationData.breakdown.LOW_RELEVANCE}</div>
                    <div className="text-xs text-amber-600">Low Relevance</div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  Confidence: <Badge variant="outline" className="ml-1">{validationData.confidence}</Badge>
                </div>
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