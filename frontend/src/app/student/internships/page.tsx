"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function StudentInternshipsPage() {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await api.get<any[]>("/internships");
      setInternships(data);
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
              <h1 className="text-3xl font-bold tracking-tight">My Internships</h1>
              <p className="text-muted-foreground mt-1">Your active apprenticeships and practical skill-development placements.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.length === 0 && !loading ? (
              <div className="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed rounded-xl">
                <Target className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Internships Yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm text-center mb-6">
                  You haven't started any internships. Apply for opportunities and wait for acceptance to get started.
                </p>
                <Link href="/student/opportunities/browse">
                  <Button>Browse Opportunities</Button>
                </Link>
              </div>
            ) : (
              internships.map(internship => (
                <Card key={internship.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={internship.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {internship.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {internship.startDate ? format(new Date(internship.startDate), "MMM d, yyyy") : ''}
                      </span>
                    </div>
                    <CardTitle>{internship.opportunity.title}</CardTitle>
                    <CardDescription>{internship.organization.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2 mt-4">
                      <p className="text-sm text-muted-foreground">
                        Your application for this opportunity has been accepted and moved to active status.
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/student/opportunities/${internship.opportunityId}`} className="w-full">
                      <Button className="w-full">View Opportunity</Button>
                    </Link>
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
