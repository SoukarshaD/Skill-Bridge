"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function OpportunityLearningRecommendations() {
  const { id } = useParams();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const data = await api.get<any>(`/learning/recommendations/${id}`);
        setRecommendations(data.recommendations || []);
        if (data.message) setMessage(data.message);
      } catch (err: any) {
        toast.error(err.message || "Failed to load recommendations");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchRecommendations();
  }, [id]);

  const handleEnroll = async (resourceId: string) => {
    try {
      await api.patch(`/learning/${resourceId}/progress`, { status: "NOT_STARTED" });
      toast.success("Enrolled successfully! View it in your Learning Dashboard.");
    } catch (err: any) {
      toast.error(err.message || "Failed to enroll");
    }
  };

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8 max-w-4xl">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            ← Back to Opportunity
          </Button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Skill Gap Recommendations</h1>
            <p className="text-muted-foreground">
              These resources are specifically recommended to help you meet the missing requirements for this opportunity.
            </p>
          </div>

          {isLoading ? (
            <div className="text-center p-8">Analyzing skill gaps...</div>
          ) : message ? (
            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardContent className="p-8 text-center text-green-800 dark:text-green-200">
                <h2 className="text-2xl font-semibold mb-2">🎉 Congratulations!</h2>
                <p>{message}</p>
              </CardContent>
            </Card>
          ) : recommendations.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No specific resources found to bridge your skill gaps at this time.
            </div>
          ) : (
            <div className="grid gap-6">
              {recommendations.map((rec, index) => (
                <Card key={index} className="border-l-4 border-l-orange-500">
                  <CardHeader>
                    <CardTitle className="text-xl">{rec.resource.title}</CardTitle>
                    <CardDescription>{rec.resource.organization?.name} • {rec.resource.type || 'Course'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{rec.resource.description}</p>
                    
                    <div className="bg-orange-50 dark:bg-orange-950/30 p-4 rounded-md mb-6">
                      <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2">Addresses these exact gaps:</h4>
                      <ul className="space-y-2">
                        {rec.addressedGaps.map((gap: any) => (
                          <li key={gap.skillId} className="flex items-center gap-2 text-sm">
                            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                            <span className="font-medium">{gap.name}</span>
                            <span className="text-muted-foreground">(Have: Lvl {gap.studentProficiency} → Need: Lvl {gap.requiredProficiency})</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-4">
                      <Button onClick={() => handleEnroll(rec.resource.id)}>Enroll / Add to My Learning</Button>
                      {rec.resource.url && (
                        <a 
                          href={rec.resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={buttonVariants({ variant: "outline" })}
                        >
                          View External Resource
                        </a>
                      )}
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
