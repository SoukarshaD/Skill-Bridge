"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { format } from "date-fns";

export default function IndustryProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const data = await api.get<any[]>("/programs/organization");
      setPrograms(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "WORKSHOP": return "bg-blue-500/10 text-blue-600";
      case "FDP": return "bg-purple-500/10 text-purple-600";
      case "GUEST_LECTURE": return "bg-amber-500/10 text-amber-600";
      case "INDUSTRIAL_TRAINING": return "bg-emerald-500/10 text-emerald-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ACADEMICIAN"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto py-8 px-4 md:px-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skill Development Programs</h1>
          <p className="text-muted-foreground mt-2">Manage your organization's skill development programs and training supply.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/academician/programs/browse">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Discover Programs
            </Button>
          </Link>
          <Link href="/academician/programs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Program
          </Button>
        </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      ) : programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map(p => (
            <Card key={p.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className={getBadgeColor(p.type)}>
                    {p.type.replace('_', ' ')}
                  </Badge>
                  <Badge variant={p.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                    {p.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl line-clamp-2">{p.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {p.description}
                </p>
                <div className="space-y-2 text-sm">
                  {p.startDate && (
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(new Date(p.startDate), "MMM d, yyyy")}
                    </div>
                  )}
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {p.mode}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {p._count?.registrations || 0} / {p.capacity || '∞'} Registered
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t mt-auto flex gap-2">
                <Link href={`/academician/programs/${p.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">Details</Button>
                </Link>
                <Link href={`/academician/programs/${p.id}/participants`} className="flex-1">
                  <Button variant="secondary" className="w-full">Participants</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg bg-muted/20">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No Programs Yet</h3>
          <p className="text-muted-foreground mb-4">Create your first program to engage with students and academicians.</p>
          <Link href="/academician/programs/new">
            <Button variant="outline">Create Program</Button>
          </Link>
        </div>
      )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
