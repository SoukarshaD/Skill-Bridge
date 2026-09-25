/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function AdminSkills() {
  const [skills, setSkills] = useState<{id: string, name: string, category: string, domain: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [newSkill, setNewSkill] = useState({ name: "", category: "", domain: "" });

  const fetchSkills = async () => {
    try {
      const data = await api.get<any>("/skills");
      setSkills(data.skills);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchSkills();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/skills", newSkill);
      setMessage("Skill created successfully!");
      setNewSkill({ name: "", category: "", domain: "" });
      fetchSkills();
    } catch (err: any) {
      setMessage(err.message || "Failed to create skill.");
    }
  };

  const handleDelete = async (id: string) => {
    setMessage("");
    try {
      await api.delete(`/skills/${id}`);
      setMessage("Skill deleted successfully!");
      fetchSkills();
    } catch (err: any) {
      setMessage(err.message || "Failed to delete skill.");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="min-h-screen flex flex-col bg-muted/20">
        <Navbar />
        <main className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-6">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Skill Taxonomy Management</h1>

          {message && (
            <div className="p-3 bg-primary/10 text-primary rounded-md text-sm font-medium">
              {message}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Add New Skill</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="space-y-2 flex-1">
                  <Label>Name</Label>
                  <Input value={newSkill.name} onChange={e => setNewSkill({...newSkill, name: e.target.value})} required placeholder="e.g. Python" />
                </div>
                <div className="space-y-2 flex-1">
                  <Label>Category</Label>
                  <Input value={newSkill.category} onChange={e => setNewSkill({...newSkill, category: e.target.value})} required placeholder="e.g. Programming Languages" />
                </div>
                <div className="space-y-2 flex-1">
                  <Label>Domain</Label>
                  <Input value={newSkill.domain} onChange={e => setNewSkill({...newSkill, domain: e.target.value})} required placeholder="e.g. Computer Science" />
                </div>
                <Button type="submit">Add Skill</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Skills</CardTitle>
              <CardDescription>All skills available for students and opportunities.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading...</p>
              ) : skills.length === 0 ? (
                <p className="text-muted-foreground text-sm">No skills found.</p>
              ) : (
                <div className="space-y-2">
                  {skills.map(skill => (
                    <div key={skill.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{skill.name}</p>
                        <p className="text-xs text-muted-foreground">{skill.category} • {skill.domain}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(skill.id)}>
                        Delete
                      </Button>
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
