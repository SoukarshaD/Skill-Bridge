"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Building2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";

export default function StudentProgramDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [program, setProgram] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProgram();
  }, [id]);

  const fetchProgram = async () => {
    try {
      const data = await api.get(`/programs/${id}`);
      setProgram(data);
    } catch (e) {
      toast.error("Failed to load program details");
      router.push("/student/programs");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    try {
      setActionLoading(true);
      await api.post(`/programs/${id}/register`, {});
      toast.success("Successfully registered!");
      fetchProgram();
    } catch (e: any) {
      toast.error(e.message || "Failed to register");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      await api.post(`/programs/${id}/cancel`, {});
      toast.success("Registration cancelled");
      fetchProgram();
    } catch (e: any) {
      toast.error(e.message || "Failed to cancel registration");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <Navbar />
        <div className="container mx-auto py-8 px-4 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      </ProtectedRoute>
    );
  }

  if (!program) return null;

  const isRegistered = program.registrationStatus != null;
  const status = program.registrationStatus;
  
  const isRegistrationOpen = program.status === 'PUBLISHED' && (!program.registrationDeadline || new Date(program.registrationDeadline) > new Date());

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-8 max-w-4xl space-y-6">
      <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
        <Link href="/student/programs" className="hover:text-primary transition-colors">Programs</Link>
        <span>/</span>
        <span className="text-foreground">{program.title}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className="bg-primary/10 text-primary uppercase">
                {program.type.replace('_', ' ')}
              </Badge>
              {isRegistered && (
                <Badge variant={status === 'REGISTERED' ? 'secondary' : status === 'COMPLETED' ? 'default' : status === 'CANCELLED' ? 'destructive' : 'outline'}>
                  {status}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{program.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{program.organization?.name}</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>About this Program</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{program.description}</p>
            </CardContent>
          </Card>

          {program.requiredSkills && program.requiredSkills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Skills Covered</CardTitle>
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
                {program.certificateAvailable && (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-medium text-emerald-600 dark:text-emerald-400">Certificate Provided</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t">
                {!isRegistered ? (
                  isRegistrationOpen ? (
                    <Button onClick={handleRegister} disabled={actionLoading} className="w-full">
                      Register Now
                    </Button>
                  ) : (
                    <Button disabled className="w-full">Registration Closed</Button>
                  )
                ) : (
                  <div className="space-y-3">
                    {status === 'REGISTERED' && (
                      <Button onClick={handleCancel} disabled={actionLoading} variant="outline" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive">
                        Cancel Registration
                      </Button>
                    )}
                    {status === 'COMPLETED' && (
                      <Link href="/student/portfolio" className="w-full">
                        <Button className="w-full" variant="outline">View in Portfolio</Button>
                      </Link>
                    )}
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
