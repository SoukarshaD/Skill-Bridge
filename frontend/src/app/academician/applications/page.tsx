"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AcademicianApplications() {
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
    <ProtectedRoute allowedRoles={["ACADEMICIAN"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Applications</h1>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          {isLoading ? (
            <div>Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-muted-foreground bg-slate-50 border p-8 text-center rounded-lg">You haven't applied to any opportunities yet.</div>
          ) : (
            <div className="grid gap-6">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          <Link href={`/academician/opportunities/${app.opportunity.id}`} className="hover:underline">
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
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-4">
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Applied on: {new Date(app.appliedAt).toLocaleDateString()}</p>
                        <p>Opportunity Type: {app.opportunity.type.replace(/_/g, ' ')}</p>
                      </div>
                      
                      <div className="flex gap-2 mt-4 md:mt-0">
                        {app.status === 'APPLIED' && (
                          <Button variant="outline" size="sm" onClick={() => handleWithdraw(app.id)}>
                            Withdraw
                          </Button>
                        )}
                        {app.status === 'OFFERED' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleDecline(app.id)}>
                              Decline Offer
                            </Button>
                            <Button size="sm" onClick={() => handleAccept(app.id)}>
                              Accept Offer
                            </Button>
                          </>
                        )}
                        <Link href={`/academician/opportunities/${app.opportunity.id}`} className={buttonVariants({ variant: "secondary", size: "sm" })}>
                          View Details
                        </Link>
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
