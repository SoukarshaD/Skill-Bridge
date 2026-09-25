"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MapPin, Building, Target } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function StudentMentorshipPage() {
  const [mentorships, setMentorships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ms = await api.get<any[]>("/mentorship/my-mentorships");
      setMentorships(ms);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Mentorships</h1>
              <p className="text-muted-foreground mt-1">Track your active mentoring relationships and applications.</p>
            </div>
            <Link href="/student/mentorship/browse">
              <Button>Find a Mentor</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentorships.length === 0 && !loading ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed rounded-xl">
                <Target className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Mentorships Yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm text-center mb-6">
                  You haven't applied to any mentorship programs. Browse available mentors from industry leaders.
                </p>
                <Link href="/student/mentorship/browse">
                  <Button>Browse Programs</Button>
                </Link>
              </div>
            ) : (
              mentorships.map(m => (
                <Card key={m.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={m.status === 'ACTIVE' ? 'default' : (m.status === 'PENDING' ? 'outline' : 'secondary')}>
                        {m.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{format(new Date(m.createdAt), "MMM d, yyyy")}</span>
                    </div>
                    <CardTitle>{m.program.title}</CardTitle>
                    <CardDescription>Mentor: {m.program.mentor.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm font-medium mb-1">Your Objectives:</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">{m.objectives}</p>
                  </CardContent>
                  <CardFooter>
                    {m.status === 'ACTIVE' || m.status === 'COMPLETED' ? (
                      <Link href={`/student/mentorship/${m.id}`} className="w-full">
                        <Button className="w-full">Enter Mentorship</Button>
                      </Link>
                    ) : (
                      <Button className="w-full" disabled variant="secondary">Waiting for Review</Button>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
