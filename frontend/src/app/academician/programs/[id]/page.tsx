"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Edit } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";

export default function IndustryProgramDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgram();
  }, [id]);

  const fetchProgram = async () => {
    try {
      const data = await api.get(`/programs/${id}`);
      setProgram(data);
    } catch (e) {
      toast.error("Failed to load program details");
      router.push("/academician/programs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 px-4 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!program) return null;

  return (
    <ProtectedRoute allowedRoles={["ACADEMICIAN"]}>
      <Navbar />
    <div className="container mx-auto py-8 px-4 md:px-8 max-w-4xl space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/academician/programs" className="hover:text-primary transition-colors">Programs</Link>
          <span>/</span>
          <span className="text-foreground">{program.title}</span>
        </div>
        <div className="flex gap-2">
          <Link href={`/academician/programs/${id}/participants`}>
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

          {program.requiredSkills && program.requiredSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Target Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {program.requiredSkills.map((s: any) => (
                    <Badge key={s.id} variant="secondary">
                      {s.skill?.name}
                    </Badge>
                  ))}
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