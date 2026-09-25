"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";

export default function AcademicianBrowseProgramsPage() {
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [programs, regs] = await Promise.all([
        api.get<any[]>("/programs"),
        api.get<any[]>("/programs/my-registrations")
      ]);
      setAllPrograms(programs || []);
      setMyRegistrations(regs || []);
    } catch (e) {
      console.error(e);
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "WORKSHOP": return "bg-blue-500/10 text-blue-600";
      case "FDP": return "bg-purple-500/10 text-purple-600";
      case "GUEST_LECTURE": return "bg-amber-500/10 text-amber-600";
      case "INDUSTRIAL_TRAINING": return "bg-emerald-500/10 text-emerald-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  const filteredPrograms = allPrograms.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "ALL" || p.type === typeFilter;
    // Academicians typically care about FDPs, Workshops, Industrial Training.
    // They are not students, but they can browse these.
    return matchesSearch && matchesType && p.status === 'PUBLISHED';
  });

  const renderProgramCard = (p: any) => {
    return (
      <Card key={p.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className={getBadgeColor(p.type)}>
              {p.type.replace('_', ' ')}
            </Badge>
          </div>
          <CardTitle className="text-xl line-clamp-2">{p.title}</CardTitle>
          <CardDescription className="line-clamp-1">{p.organization?.name || "Unknown Organization"}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {p.description}
          </p>
          <div className="space-y-2 text-sm">
            {p.startDate && (
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                {format(new Date(p.startDate), "MMM d, yyyy")} {p.duration && `(${p.duration})`}
              </div>
            )}
            <div className="flex items-center text-muted-foreground">
              <MapPin className="mr-2 h-4 w-4" />
              {p.mode} {p.location ? `- ${p.location}` : ""}
            </div>
            {p.capacity && (
              <div className="flex items-center text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                Capacity: {p.capacity}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t mt-auto">
          <Link href={`/academician/programs/browse/${p.id}`} className="w-full">
            <Button variant="outline" className="w-full">View Details</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  };

  return (
    <ProtectedRoute allowedRoles={["ACADEMICIAN"]}>
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover Programs</h1>
          <p className="text-muted-foreground mt-2">Find Faculty Development Programs (FDPs) and Industrial Training.</p>
        </div>
      </div>

      <Tabs defaultValue="browse" className="space-y-8">
        <TabsList>
          <TabsTrigger value="browse">Browse Programs</TabsTrigger>
          <TabsTrigger value="my-registrations">My Registrations ({myRegistrations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search programs by title or organizer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  <SelectItem value="FDP">Faculty Dev Program</SelectItem>
                  <SelectItem value="GUEST_LECTURE">Guest Lecture</SelectItem>
                  <SelectItem value="INDUSTRIAL_TRAINING">Industrial Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredPrograms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPrograms.map(p => renderProgramCard(p))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">No programs found matching your criteria.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-registrations" className="space-y-6">
          {myRegistrations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {myRegistrations.map(reg => (
                <Card key={reg.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={getBadgeColor(reg.program.type)}>
                        {reg.program.type.replace('_', ' ')}
                      </Badge>
                      <Badge variant={reg.status === 'REGISTERED' ? 'secondary' : reg.status === 'COMPLETED' ? 'default' : 'outline'}>
                        {reg.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{reg.program.title}</CardTitle>
                    <CardDescription className="line-clamp-1">Registered: {format(new Date(reg.registeredAt), "MMM d, yyyy")}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-4 border-t mt-auto">
                    <Link href={`/academician/programs/browse/${reg.program.id}`} className="w-full">
                      <Button variant="outline" className="w-full">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/20">
              <p className="text-muted-foreground">You haven't registered for any programs yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </ProtectedRoute>
  );
}
