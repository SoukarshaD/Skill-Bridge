"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: string;
  durationMinutes: number;
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const data = await api.get<Assessment[]>("/assessments");
        setAssessments(data);
      } catch (error) {
        console.error("Failed to load assessments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Skill Assessments</h1>
              <p className="text-muted-foreground mt-2">
                Evaluate your skills, identify gaps, and get personalized learning recommendations.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-muted-foreground">Loading assessments...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assessments.map((assessment) => (
                <Card key={assessment.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{assessment.type}</Badge>
                      <span className="text-sm text-muted-foreground">{assessment.durationMinutes} mins</span>
                    </div>
                    <CardTitle>{assessment.title}</CardTitle>
                    <CardDescription>{assessment.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      This assessment will automatically update your skill matrix and influence your opportunity matches.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/student/assessment/${assessment.id}`} className="w-full">
                      <Button className="w-full">View Details</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
              {assessments.length === 0 && (
                <p className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                  No published assessments available yet.
                </p>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
