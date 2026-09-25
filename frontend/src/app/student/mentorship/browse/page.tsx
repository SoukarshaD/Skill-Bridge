"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function BrowseMentorshipPrograms() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [objectives, setObjectives] = useState("");
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await api.get<any[]>("/mentorship/programs");
      setPrograms(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const apply = async () => {
    if (!selectedProgram || !objectives.trim()) return;
    try {
      await api.post(`/mentorship/programs/${selectedProgram.id}/apply`, { objectives });
      alert("Application sent!");
      setSelectedProgram(null);
      setObjectives("");
    } catch (e: any) {
      alert(e.response?.data?.error || "Failed to apply");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Browse Industry Mentors</h1>
            <p className="text-muted-foreground mt-1">Connect with industry professionals for practical career guidance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map(p => (
              <Card key={p.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{p.title}</CardTitle>
                  <CardDescription>{p.mentor.name} • {p.mentor.organization?.name || "Independent Mentor"}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{p.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.expertise.map((ex: string, i: number) => (
                      <Badge key={i} variant="secondary">{ex}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Dialog open={selectedProgram?.id === p.id} onOpenChange={(open) => !open && setSelectedProgram(null)}>
                    <DialogTrigger>
                      <Button className="w-full" onClick={() => setSelectedProgram(p)} variant="outline">Request Mentorship</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Apply for Mentorship</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Why do you want to be mentored by {p.mentor.name}? What are your objectives?
                        </p>
                        <Textarea 
                          rows={4}
                          placeholder="I want to improve my skills in..."
                          value={objectives}
                          onChange={(e) => setObjectives(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedProgram(null)}>Cancel</Button>
                        <Button onClick={apply} disabled={!objectives.trim()}>Submit Request</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
