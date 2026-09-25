"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Building2 } from "lucide-react";
import Link from "next/link";

export default function SearchAcademicians() {
  const [academicians, setAcademicians] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchAcademicians = async (query = "") => {
    setIsLoading(true);
    try {
      const url = query ? `/opportunities/academicians/search?query=${encodeURIComponent(query)}` : `/opportunities/academicians/search`;
      const data = await api.get<any>(url);
      setAcademicians(data.academicians || []);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load academicians.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicians();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAcademicians(search);
  };

  return (
    <ProtectedRoute allowedRoles={["INDUSTRY", "ADMIN"]}>
      <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Discover Academicians</h1>
          </div>

          <form onSubmit={handleSearch} className="flex gap-4 mb-8">
            <Input 
              placeholder="Search by expertise or research areas (e.g. AI, Cloud, Materials)..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-xl"
            />
            <Button type="submit">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            {search && (
              <Button type="button" variant="outline" onClick={() => { setSearch(""); fetchAcademicians(""); }}>
                Clear
              </Button>
            )}
          </form>

          {error && <div className="text-red-500 mb-4">{error}</div>}

          {isLoading ? (
            <div>Loading academicians...</div>
          ) : academicians.length === 0 ? (
            <div className="text-muted-foreground bg-slate-50 border p-8 text-center rounded-lg">
              No academicians found matching your criteria.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {academicians.map((acad) => (
                <Card key={acad.id} className="flex flex-col h-full">
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {acad.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Building2 className="h-4 w-4" />
                      {acad.academicProfile?.department ? `${acad.academicProfile.department}, ` : ''}
                      {acad.academicProfile?.institution || acad.institution?.name || "Independent"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    {acad.academicProfile?.expertise?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Core Expertise</p>
                        <div className="flex flex-wrap gap-2">
                          {acad.academicProfile.expertise.map((exp: string, i: number) => (
                            <Badge key={i} variant="secondary">{exp}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {acad.academicProfile?.researchAreas?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Research Areas</p>
                        <div className="flex flex-wrap gap-2">
                          {acad.academicProfile.researchAreas.map((area: string, i: number) => (
                            <Badge key={i} variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">{area}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {acad.academicProfile?.consultancyAreas?.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">Consultancy Areas</p>
                        <div className="flex flex-wrap gap-2">
                          {acad.academicProfile.consultancyAreas.map((area: string, i: number) => (
                            <Badge key={i} variant="outline" className="border-green-200 text-green-700 bg-green-50">{area}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="pt-4 mt-auto flex justify-between items-center">
                      <a href={`mailto:${acad.email}`} className="text-sm text-primary hover:underline">
                        Contact: {acad.email}
                      </a>
                      <Link href={`/industry/collaborations/new?academicianId=${acad.id}`}>
                        <Button size="sm">Propose Collaboration</Button>
                      </Link>
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
