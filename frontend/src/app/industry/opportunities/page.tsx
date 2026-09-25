"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { api } from "@/lib/api";

export default function IndustryOpportunities() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const data = await api.get<any>("/opportunities/organization");
        setOpportunities(data.opportunities || []);
      } catch (err: any) {
        setError(err.message || "Failed to load opportunities.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOpportunities();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["INDUSTRY", "ADMIN"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Opportunity Postings</h1>
            <Link href="/industry/opportunities/new">
              <Button>Post New Opportunity</Button>
            </Link>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          {isLoading ? (
            <div>Loading opportunities...</div>
          ) : opportunities.length === 0 ? (
            <div className="text-muted-foreground">You haven't posted any opportunities yet.</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opp) => (
                <Card key={opp.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{opp.title}</CardTitle>
                      <Badge variant={opp.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {opp.status}
                      </Badge>
                    </div>
                    <CardDescription>{opp.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {opp.description}
                      </p>
                      <div className="text-sm font-medium mb-2">
                        Required Skills: {opp.requiredSkills?.length || 0}
                      </div>
                      <div className="text-sm font-medium mb-4">
                        Applications: {opp._count?.applications || 0}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <Link href={`/industry/opportunities/${opp.id}/applicants`}>
                        <Button variant="outline">View Applicants</Button>
                      </Link>
                      <Button variant="ghost" size="sm">Edit</Button>
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
