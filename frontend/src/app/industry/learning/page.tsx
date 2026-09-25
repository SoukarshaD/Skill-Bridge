"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { SkillSelector } from "@/components/skill-selector";
import { api } from "@/lib/api";

export default function IndustryLearning() {
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<any[]>([]);

  const fetchResources = async () => {
    try {
      const data = await api.get<any>("/learning/organization");
      setResources(data.resources || []);
    } catch (_err) {
      toast.error("Failed to load learning resources");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleCreate = async () => {
    if (!title || selectedSkills.length === 0) {
      toast.error("Title and at least one target skill are required");
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        title,
        description,
        url,
        type,
        skills: selectedSkills.map(s => ({ skillId: s.id, targetProficiency: s.proficiency || 1 }))
      };

      await api.post("/learning", payload);
      toast.success("Learning resource created successfully");
      setTitle("");
      setDescription("");
      setUrl("");
      setType("");
      setSelectedSkills([]);
      fetchResources();
    } catch (err: any) {
      toast.error(err.message || "Failed to create resource");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["INDUSTRY", "ADMIN"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Manage Learning Resources</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Create Form */}
            <Card>
              <CardHeader>
                <CardTitle>Publish New Resource</CardTitle>
                <CardDescription>Offer a course, workshop, or certification to bridge skill gaps.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Advanced React Workshop" />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Input value={type} onChange={e => setType(e.target.value)} placeholder="e.g. Workshop, Course" />
                </div>
                <div>
                  <label className="text-sm font-medium">Resource URL (Optional)</label>
                  <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What will they learn?" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Target Skills & Proficiency Taught</label>
                  <div className="border rounded-md p-4 bg-muted/30">
                    <SkillSelector initialSkills={selectedSkills} onSkillsChange={setSelectedSkills} />
                  </div>
                </div>
                <Button onClick={handleCreate} disabled={isCreating} className="w-full">
                  {isCreating ? "Publishing..." : "Publish Resource"}
                </Button>
              </CardContent>
            </Card>

            {/* List */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Published Resources</h2>
              {isLoading ? (
                <p>Loading...</p>
              ) : resources.length === 0 ? (
                <p className="text-muted-foreground">No resources published yet.</p>
              ) : (
                resources.map(resource => (
                  <Card key={resource.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription>{resource.type || "Learning Resource"}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold mb-2">Skills Provided:</h4>
                        <div className="flex flex-wrap gap-2">
                          {resource.learningResourceSkills?.map((rs: any) => (
                            <Badge key={rs.id} variant="secondary">
                              {rs.skill.name} (Lvl {rs.targetProficiency})
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {resource.url && (
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          View Resource
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
