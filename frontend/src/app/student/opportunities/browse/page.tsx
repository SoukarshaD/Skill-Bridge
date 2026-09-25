"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function BrowseOpportunities() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        let url = "/opportunities/browse";
        const queryParams = [];
        if (search) queryParams.push(`location=${encodeURIComponent(search)}`);
        if (type && type !== "ALL") queryParams.push(`type=${encodeURIComponent(type)}`);
        if (queryParams.length > 0) url += `?${queryParams.join("&")}`;

        const data = await api.get<any>(url);
        setOpportunities(data.opportunities || []);
      } catch (err: any) {
        setError(err.message || "Failed to load opportunities.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOpportunities();
  }, [search, type]);

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Browse Opportunities</h1>
          </div>

          <div className="flex gap-4 mb-8">
            <Input 
              placeholder="Search by location..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="JOB">Job</SelectItem>
                <SelectItem value="INTERNSHIP">Internship</SelectItem>
                <SelectItem value="APPRENTICESHIP">Apprenticeship</SelectItem>
                <SelectItem value="PROJECT">Project</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          {isLoading ? (
            <div>Loading opportunities...</div>
          ) : opportunities.length === 0 ? (
            <div className="text-muted-foreground">No opportunities found matching your criteria.</div>
          ) : (
            <div className="grid gap-6">
              {opportunities.map((rec) => (
                <Card key={rec.opportunity.id} className="overflow-hidden border-l-4 border-l-primary">
                  <CardHeader className="bg-muted/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{rec.opportunity.title}</CardTitle>
                        <CardDescription className="mt-1 font-medium text-foreground">
                          {rec.opportunity.organization?.name || "Unknown Company"} • {rec.opportunity.location || rec.opportunity.workMode}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="outline" className="text-sm font-semibold px-3 py-1 bg-background">
                          Match: {rec.match?.overallMatchPercentage !== null && rec.match?.overallMatchPercentage !== undefined ? `${rec.match.overallMatchPercentage}%` : "N/A"}
                        </Badge>
                        <Badge>{rec.opportunity.type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 flex justify-between items-end">
                    <div className="flex-1 mr-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {rec.opportunity.description}
                      </p>
                    </div>

                    <Link href={`/student/opportunities/${rec.opportunity.id}`}>
                      <Button>View Details</Button>
                    </Link>
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
