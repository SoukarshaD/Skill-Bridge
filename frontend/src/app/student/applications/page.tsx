"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { api } from "@/lib/api";
import { FolderOpen } from "lucide-react";

export default function StudentApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    try {
      const data = await api.get<any>("/applications/me");
      setApplications(data.applications || []);
    } catch (err: any) {
      setError(err.message || "Failed to load applications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;

    try {
      await api.patch(`/applications/${applicationId}/withdraw`, {});
      toast.success("Application withdrawn.");
      fetchApplications();
    } catch (err: any) {
      toast.error(err.message || "Failed to withdraw");
    }
  };

  const handleAccept = async (applicationId: string) => {
    try {
      await api.patch(`/applications/${applicationId}/status`, { status: "ACCEPTED" });
      toast.success("Offer accepted!");
      fetchApplications();
    } catch (err: any) {
      toast.error(err.message || "Failed to accept offer");
    }
  };

  const handleDecline = async (applicationId: string) => {
    if (!confirm("Are you sure you want to decline this offer?")) return;
    try {
      await api.patch(`/applications/${applicationId}/status`, { status: "DECLINED" });
      toast.success("Offer declined.");
      fetchApplications();
    } catch (err: any) {
      toast.error(err.message || "Failed to decline offer");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Applications</h1>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          {isLoading ? (
            <div className="flex justify-center p-12">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-muted/20 border-dashed">
              <FolderOpen className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">No Applications Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                You haven't applied to any opportunities yet. Discover your next research or internship role.
              </p>
              <Link href="/student/opportunities/browse">
                <Button>Browse Opportunities</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          <Link href={`/student/opportunities/${app.opportunity.id}`} className="hover:underline">
                            {app.opportunity.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="mt-1 font-medium text-foreground">
                          {app.opportunity.organization?.name}
                        </CardDescription>
                      </div>
                      <Badge variant={
                        app.status === 'OFFERED' || app.status === 'ACCEPTED' ? 'default' :
                        app.status === 'REJECTED' || app.status === 'DECLINED' || app.status === 'WITHDRAWN' ? 'destructive' : 'secondary'
                      } className="text-sm px-3 py-1">
                        {app.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-end">
                      <div className="text-sm text-muted-foreground">
                        Applied on: {new Date(app.appliedAt).toLocaleDateString()}
                      </div>
                      
                      <div className="flex gap-2">
                        {app.status === 'OFFERED' && (
                          <>
                            <Button onClick={() => handleAccept(app.id)} className="bg-green-600 hover:bg-green-700">Accept Offer</Button>
                            <Button onClick={() => handleDecline(app.id)} variant="destructive">Decline</Button>
                          </>
                        )}
                        {['APPLIED', 'SHORTLISTED', 'INTERVIEW'].includes(app.status) && (
                          <Button variant="outline" onClick={() => handleWithdraw(app.id)}>Withdraw</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
