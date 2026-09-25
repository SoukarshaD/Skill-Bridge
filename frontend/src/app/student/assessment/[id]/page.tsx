"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Info, CheckCircle2 } from "lucide-react";

interface AssessmentDetails {
  id: string;
  title: string;
  description: string;
  type: string;
  durationMinutes: number;
  questions: { id: string }[];
}

export default function AssessmentStartPage() {
  const params = useParams();
  const router = useRouter();
  const [assessment, setAssessment] = useState<AssessmentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const data = await api.get<AssessmentDetails>(`/assessments/${params.id}`);
        setAssessment(data);
      } catch (error) {
        console.error("Failed to load assessment details", error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchDetails();
  }, [params.id]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const attempt = await api.post<{ id: string }>(`/assessments/${params.id}/start`, {});
      router.push(`/student/assessment/${params.id}/take?attemptId=${attempt.id}`);
    } catch (error: any) {
      alert(error.message || "Failed to start assessment");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <p className="text-muted-foreground">Loading assessment details...</p>
        </main>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <p className="text-muted-foreground">Assessment not found.</p>
        </main>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-12 max-w-3xl">
          <Button variant="ghost" onClick={() => router.push("/student/assessment")} className="mb-6">
            &larr; Back to Assessments
          </Button>
          
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader className="text-center pb-8 border-b">
              <div className="flex justify-center mb-4">
                <Badge variant="secondary" className="px-3 py-1 text-sm">{assessment.type}</Badge>
              </div>
              <CardTitle className="text-3xl font-bold">{assessment.title}</CardTitle>
              <CardDescription className="text-base mt-4 max-w-xl mx-auto">
                {assessment.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="flex flex-col sm:flex-row justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Info className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Questions</p>
                    <p className="text-muted-foreground">{assessment.questions.length} multiple choice</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-muted-foreground">{assessment.durationMinutes} minutes</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-6 rounded-lg mt-8">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Instructions before you begin:
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground list-disc list-inside">
                  <li>Ensure you have a stable internet connection.</li>
                  <li>Do not refresh the page during the assessment.</li>
                  <li>The timer cannot be paused once started.</li>
                  <li>Your skill profile will be updated immediately upon submission.</li>
                  <li>Verified skills will not be downgraded if you score low.</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="pt-4 pb-8 flex justify-center">
              <Button size="lg" className="w-full sm:w-auto px-12 text-lg" onClick={handleStart} disabled={starting}>
                {starting ? "Starting..." : "Start Assessment"}
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
