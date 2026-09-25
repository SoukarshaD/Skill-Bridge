"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Building2, MapPin, Clock, CalendarDays } from "lucide-react";

export default function BrowseAcademicianOpportunities() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        let url = "/opportunities/academician/browse";
        // Since we didn't add search/type to the new endpoint, we'll fetch all and filter in frontend
        const data = await api.get<any>(url);
        setOpportunities(data.opportunities || []);
      } catch (err: any) {
        setError(err.message || "Failed to load opportunities.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchOpportunities();
  }, []);

  const filteredOpportunities = opportunities.filter(opp => {
    if (type && type !== "ALL" && opp.type !== type) return false;
    if (search && !opp.location?.toLowerCase().includes(search.toLowerCase()) && !opp.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <ProtectedRoute allowedRoles={["ACADEMICIAN"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Discover Opportunities</h1>
          </div>

          <div className="flex gap-4 mb-8">
            <Input 
              placeholder="Search title or location..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="FACULTY_INTERNSHIP">Faculty Internship</SelectItem>
                <SelectItem value="INDUSTRIAL_TRAINING">Industrial Training</SelectItem>
                <SelectItem value="FDP">FDP</SelectItem>
                <SelectItem value="CONSULTANCY">Consultancy</SelectItem>
                <SelectItem value="RESEARCH_COLLABORATION">Research Collaboration</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md mb-8">
              {error}
            </div>
          )}

          {isLoading ? (
            <p>Loading opportunities...</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredOpportunities.length === 0 ? (
                <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg bg-slate-50">
                  No opportunities found matching your criteria.
                </div>
              ) : (
                filteredOpportunities.map((opp) => (
                  <Card key={opp.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary">{opp.type.replace(/_/g, ' ')}</Badge>
                      </div>
                      <CardTitle className="line-clamp-2 leading-tight mb-2">
                        {opp.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {opp.organization?.name || "Unknown Organization"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {opp.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {opp.location} ({opp.workMode})
                          </div>
                        )}
                        {opp.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {opp.duration}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          Apply by {opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "Open"}
                        </div>
                      </div>
                      <div className="pt-4 border-t flex justify-end items-center">
                        <Link href={`/academician/opportunities/${opp.id}`} className={buttonVariants({ className: "w-full" })}>
                          View Details & Apply
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
