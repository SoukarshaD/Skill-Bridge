"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Trophy, Users, Calendar, Building2, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { format } from "date-fns";

export default function StudentChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const data = await api.get<any>("/opportunities/browse?type=INNOVATION_CHALLENGE");
      // Sort by match score descending
      const sorted = (data.opportunities || data.results || data).sort((a: any, b: any) => 
        (b.match?.overallMatchPercentage || 0) - (a.match?.overallMatchPercentage || 0)
      );
      setChallenges(sorted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = challenges.filter((item: any) => {
    const opp = item.opportunity || item;
    return opp.title.toLowerCase().includes(search.toLowerCase()) || 
           opp.organization?.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Innovation Challenges</h1>
          <p className="text-muted-foreground">Solve real-world industry problems, build your team, and win recognition.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Search challenges by title or organizer..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <Link href="/student/challenges/my-submissions">
            <Button variant="outline">My Submissions</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item: any) => {
              const opp = item.opportunity || item;
              const match = item.match;
              return (
                <Card key={opp.id} className="flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">
                        <Trophy className="mr-1 h-3 w-3" /> Challenge
                      </Badge>
                      {match?.overallMatchPercentage >= 70 && (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          {match.overallMatchPercentage}% Match
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl line-clamp-2">{opp.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" /> {opp.organization?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {opp.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-sm text-muted-foreground">
                      {opp.deadline && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(opp.deadline), "MMM d, yyyy")}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>Team: {opp.minTeamSize}-{opp.maxTeamSize}</span>
                      </div>
                    </div>

                    {opp.requiredSkills && opp.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {opp.requiredSkills.slice(0, 3).map((rs: any) => (
                          <Badge key={rs.id} variant="outline" className="text-xs font-normal">
                            {rs.skill.name}
                          </Badge>
                        ))}
                        {opp.requiredSkills.length > 3 && (
                          <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
                            +{opp.requiredSkills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link href={`/student/challenges/${opp.id}`} className="w-full">
                      <Button className="w-full">View Challenge</Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-lg bg-muted/20">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No challenges found</h3>
            <p className="text-muted-foreground">Check back later for new innovation challenges.</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
