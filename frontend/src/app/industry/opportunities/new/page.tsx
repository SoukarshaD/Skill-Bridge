"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { api } from "@/lib/api";

export default function NewOpportunity() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [taxonomy, setTaxonomy] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    type: "JOB",
    description: "",
    workMode: "ONSITE",
    location: "",
  });

  const [requiredSkills, setRequiredSkills] = useState<{skillId: string, requiredProficiency: number, weight: number}[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState("");

  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        const data = await api.get<any>("/skills");
        setTaxonomy(data.skills);
      } catch (err) {
        console.error("Failed to load skills", err);
      }
    };
    fetchTaxonomy();
  }, []);

  const addSkill = () => {
    if (!selectedSkillId) return;
    if (requiredSkills.find(s => s.skillId === selectedSkillId)) return;
    
    setRequiredSkills([...requiredSkills, {
      skillId: selectedSkillId,
      requiredProficiency: 3,
      weight: 1.0
    }]);
    setSelectedSkillId("");
  };

  const removeSkill = (skillId: string) => {
    setRequiredSkills(requiredSkills.filter(s => s.skillId !== skillId));
  };

  const updateSkill = (skillId: string, field: string, value: number) => {
    setRequiredSkills(requiredSkills.map(s => 
      s.skillId === skillId ? { ...s, [field]: value } : s
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      await api.post("/opportunities", {
        ...formData,
        requiredSkills
      });
      router.push("/industry/opportunities");
    } catch (err: any) {
      setError(err.message || "Failed to create opportunity");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["INDUSTRY", "ADMIN"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Post New Opportunity</CardTitle>
              <CardDescription>Create a new job, internship, or project posting.</CardDescription>
            </CardHeader>
            <CardContent>
              {error && <div className="text-red-500 mb-4 bg-red-50 p-3 rounded">{error}</div>}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input 
                      id="title" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                      placeholder="e.g. Frontend Developer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Opportunity Type</Label>
                    <Select value={formData.type} onValueChange={(val) => setFormData({...formData, type: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="JOB">Job</SelectItem>
                        <SelectItem value="INTERNSHIP">Internship</SelectItem>
                        <SelectItem value="APPRENTICESHIP">Apprenticeship</SelectItem>
                        <SelectItem value="FACULTY_INTERNSHIP">Faculty Internship</SelectItem>
                        <SelectItem value="INDUSTRIAL_TRAINING">Industrial Training</SelectItem>
                        <SelectItem value="FDP">FDP</SelectItem>
                        <SelectItem value="CONSULTANCY">Consultancy</SelectItem>
                        <SelectItem value="RESEARCH_COLLABORATION">Research Collaboration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="workMode">Work Mode</Label>
                    <Select value={formData.workMode} onValueChange={(val) => setFormData({...formData, workMode: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ONSITE">On-site</SelectItem>
                        <SelectItem value="REMOTE">Remote</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g. Bangalore"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    rows={5}
                    placeholder="Describe the responsibilities and requirements..."
                  />
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-xl font-semibold mb-4">Required Skills (Match Engine)</h3>
                  
                  <div className="flex gap-4 items-end mb-6">
                    <div className="flex-1 space-y-2">
                      <Label>Add a Skill</Label>
                      <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Search skills..." />
                        </SelectTrigger>
                        <SelectContent>
                          {taxonomy.map(skill => (
                            <SelectItem key={skill.id} value={skill.id} disabled={requiredSkills.some(s => s.skillId === skill.id)}>
                              {skill.name} ({skill.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="button" onClick={addSkill} disabled={!selectedSkillId}>Add Skill</Button>
                  </div>

                  <div className="space-y-4">
                    {requiredSkills.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No required skills added. This opportunity will bypass the skill match engine.</p>
                    ) : (
                      requiredSkills.map((rs, index) => {
                        const skillName = taxonomy.find(t => t.id === rs.skillId)?.name;
                        return (
                          <div key={rs.skillId} className="p-4 border rounded-md space-y-4 bg-muted/20">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium text-lg">{skillName}</h4>
                              <Button type="button" variant="ghost" size="sm" className="text-red-500 h-8" onClick={() => removeSkill(rs.skillId)}>Remove</Button>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-8">
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <Label>Required Proficiency</Label>
                                  <span className="text-sm font-bold">{rs.requiredProficiency} / 5</span>
                                </div>
                                <Slider 
                                  value={[rs.requiredProficiency]} 
                                  min={1} max={5} step={1}
                                  onValueChange={(val) => updateSkill(rs.skillId, 'requiredProficiency', val[0])}
                                />
                                <p className="text-xs text-muted-foreground">Minimum skill level expected from candidate.</p>
                              </div>

                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <Label>Importance Weight</Label>
                                  <span className="text-sm font-bold">{rs.weight}</span>
                                </div>
                                <Slider 
                                  value={[rs.weight]} 
                                  min={0.1} max={5.0} step={0.1}
                                  onValueChange={(val) => updateSkill(rs.skillId, 'weight', val[0])}
                                />
                                <p className="text-xs text-muted-foreground">Relative importance in matching formula.</p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <Button type="submit" disabled={isSaving} className="w-full">
                    {isSaving ? "Publishing..." : "Publish Opportunity"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
