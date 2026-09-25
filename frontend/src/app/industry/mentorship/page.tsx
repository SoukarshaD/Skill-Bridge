"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function IndustryMentorshipDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [active, setActive] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqs, acts, progs] = await Promise.all([
        api.get<any[]>("/mentorship/requests"),
        api.get<any[]>("/mentorship/my-mentorships"),
        api.get<any[]>("/mentorship/programs") // In MVP, this gets all published programs, but we'd filter to 'my programs'. The service gets all published, so we might need a specific endpoint for 'my programs'. For now, if we assume mentorId = userId filter isn't strict, we can just rely on 'my-mentorships' for active ones.
      ]);
      setRequests(reqs);
      setActive(acts.filter(a => a.status === 'ACTIVE' || a.status === 'COMPLETED'));
      
      // Let's assume api returns our created programs if we call a hypothetical endpoint, or we just show active ones
      setPrograms(progs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    try {
      await api.post(`/mentorship/requests/${id}/${action}`, {});
      fetchData();
    } catch (e) {
      alert("Error handling request");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["INDUSTRY"]}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Mentorship Hub</h1>
              <p className="text-muted-foreground mt-1">Manage your mentorship programs and mentees.</p>
            </div>
            <Link href="/industry/mentorship/new">
              <Button>Create Program</Button>
            </Link>
          </div>

          <Tabs defaultValue="requests" className="space-y-6">
            <TabsList>
              <TabsTrigger value="requests">Pending Requests ({requests.length})</TabsTrigger>
              <TabsTrigger value="active">Active Mentees ({active.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="requests">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.length === 0 ? (
                  <p className="text-muted-foreground py-8 col-span-full border border-dashed rounded-lg text-center">No pending requests.</p>
                ) : (
                  requests.map(req => (
                    <Card key={req.id}>
                      <CardHeader>
                        <CardTitle className="text-xl">{req.student.name}</CardTitle>
                        <CardDescription>Applied for: {req.program.title}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm font-medium">Student Objectives:</p>
                        <p className="text-sm text-muted-foreground mt-2 italic bg-muted p-3 rounded-md">"{req.objectives}"</p>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction(req.id, 'accept')}>Accept</Button>
                        <Button className="flex-1" variant="outline" onClick={() => handleAction(req.id, 'reject')}>Reject</Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="active">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {active.length === 0 ? (
                  <p className="text-muted-foreground py-8 col-span-full border border-dashed rounded-lg text-center">No active mentees.</p>
                ) : (
                  active.map(act => (
                    <Card key={act.id} className="flex flex-col">
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant={act.status === 'ACTIVE' ? 'default' : 'secondary'}>{act.status}</Badge>
                          <span className="text-xs text-muted-foreground">{format(new Date(act.createdAt), "MMM d, yyyy")}</span>
                        </div>
                        <CardTitle>{act.student.name}</CardTitle>
                        <CardDescription>{act.program.title}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="w-4 h-4" /> Mentorship in progress
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/industry/mentorship/${act.id}`} className="w-full">
                          <Button className="w-full" variant="secondary">View Dashboard</Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
}
