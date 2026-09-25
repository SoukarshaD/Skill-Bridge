"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { api } from "@/lib/api";

export default function PublicPortfolioPage({ params }: { params: Promise<{ studentId: string }> }) {
  const resolvedParams = use(params);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await api.get<any>(`/portfolios/shared/${resolvedParams.studentId}`);
        setPortfolio(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading portfolio");
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [resolvedParams.studentId]);

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading portfolio...</div>;
  if (error || !portfolio) return <div className="p-12 text-center text-destructive">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">{portfolio.studentName}'s Portfolio</h1>
          <p className="text-lg text-muted-foreground">
            {portfolio.department} • Year {portfolio.academicYear}
          </p>
        </div>

        <div className="grid md:grid-cols-[300px_1fr] gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessed Skills</CardTitle>
                <CardDescription>Industry-aligned competency</CardDescription>
              </CardHeader>
              <CardContent>
                {portfolio.skills?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No assessed skills yet.</p>
                ) : (
                  <div className="space-y-4">
                    {portfolio.skills?.map((skill: any) => (
                      <div key={skill.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-muted-foreground">{skill.proficiency}/5</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-primary h-full transition-all" 
                            style={{ width: `${(skill.proficiency / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>Verified learning and self-reported achievements</CardDescription>
              </CardHeader>
              <CardContent>
                {portfolio.timeline?.length === 0 ? (
                  <p className="text-muted-foreground">No entries yet.</p>
                ) : (
                  <div className="space-y-8">
                    {portfolio.timeline?.map((item: any) => (
                      <div key={item.id} className="relative pl-6 border-l-2 border-muted">
                        <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-2" />
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <span className="font-medium">{item.source}</span>
                                {item.date && (
                                  <>
                                    <span>•</span>
                                    <span>{new Date(item.date).toLocaleDateString()}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Badge variant={item.verificationStatus === "VERIFIED" ? "default" : "secondary"}>
                              {item.verificationStatus.replace("_", " ")}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-sm mt-2">{item.description}</p>
                          )}
                          {item.document && item.document.isDownloadable && (
                            <div className="mt-3">
                              <a 
                                href={`/api/documents/${item.document.id}/download`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center text-sm text-primary hover:underline"
                              >
                                <FileText className="mr-1 h-4 w-4" />
                                Download Attached File ({item.document.filename})
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
