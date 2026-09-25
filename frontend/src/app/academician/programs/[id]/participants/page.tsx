"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Link from "next/link";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { format } from "date-fns";
import { UserCircle } from "lucide-react";

export default function IndustryProgramParticipantsPage() {
  const { id } = useParams() as { id: string };
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParticipants();
  }, [id]);

  const fetchParticipants = async () => {
    try {
      const data = await api.get<any[]>(`/programs/${id}/participants`);
      setParticipants(data || []);
    } catch (e) {
      toast.error("Failed to load participants");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (participantId: string, status: string) => {
    try {
      await api.patch(`/programs/${id}/participants/${participantId}`, { status });
      toast.success("Status updated");
      fetchParticipants();
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    }
  };

  if (loading) {
    return <div className="container mx-auto py-8 px-4 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <ProtectedRoute allowedRoles={["ACADEMICIAN"]}>
      <Navbar />
    <div className="container mx-auto py-8 px-4 md:px-8 max-w-5xl space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/academician/programs" className="hover:text-primary transition-colors">Programs</Link>
          <span>/</span>
          <Link href={`/academician/programs/${id}`} className="hover:text-primary transition-colors">Program Details</Link>
          <span>/</span>
          <span className="text-foreground">Participants</span>
        </div>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Program Participants</h1>
        <p className="text-muted-foreground">Manage registration and attendance for your program.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {participants.length > 0 ? (
            <div className="divide-y">
              {participants.map(reg => (
                <div key={reg.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                      <UserCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{reg.participant.name}</p>
                      <p className="text-sm text-muted-foreground">{reg.participant.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Registered: {format(new Date(reg.registeredAt), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <Badge variant={reg.status === 'REGISTERED' ? 'secondary' : reg.status === 'COMPLETED' ? 'default' : 'outline'}>
                      {reg.status}
                    </Badge>
                    <Select
                      value={reg.status}
                      onValueChange={(val) => handleUpdateStatus(reg.participantId, val)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REGISTERED">Registered</SelectItem>
                        <SelectItem value="ATTENDED">Attended</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              No participants have registered yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}