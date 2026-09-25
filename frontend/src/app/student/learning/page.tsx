"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

export default function StudentLearningTracker() {
  const [learning, setLearning] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLearning = async () => {
    try {
      const data = await api.get<any>("/learning/me");
      setLearning(data.learning || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load learning resources");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLearning();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/learning/${id}/progress`, { status: newStatus });
      toast.success("Progress updated!");
      fetchLearning();
    } catch (err: any) {
      toast.error(err.message || "Failed to update progress");
    }
  };

  const notStarted = learning.filter(l => l.status === 'NOT_STARTED');
  const inProgress = learning.filter(l => l.status === 'IN_PROGRESS');
  const completed = learning.filter(l => l.status === 'COMPLETED');

  const ResourceCard = ({ item }: { item: any }) => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{item.learningResource.title}</CardTitle>
        <CardDescription>{item.learningResource.organization?.name} • {item.learningResource.type}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Skills Target:</h4>
          <div className="flex flex-wrap gap-2">
            {item.learningResource.learningResourceSkills?.map((rs: any) => (
              <Badge key={rs.id} variant="secondary">
                {rs.skill.name} (Lvl {rs.targetProficiency})
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          {item.learningResource.url ? (
            <a 
              href={item.learningResource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Open Resource
            </a>
          ) : <div />}
          
          <div className="flex gap-2">
            {item.status === 'NOT_STARTED' && (
              <Button size="sm" onClick={() => handleUpdateStatus(item.learningResource.id, 'IN_PROGRESS')}>Start Learning</Button>
            )}
            {item.status === 'IN_PROGRESS' && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(item.learningResource.id, 'COMPLETED')}>Mark Completed</Button>
            )}
            {item.status === 'COMPLETED' && (
              <span className="text-sm text-green-600 font-semibold px-2 py-1 bg-green-50 rounded">Completed</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-8">My Learning Tracker</h1>

          {isLoading ? (
            <p>Loading your learning journey...</p>
          ) : (
            <Tabs defaultValue="in_progress" className="w-full">
              <TabsList className="mb-6 w-full justify-start">
                <TabsTrigger value="in_progress">In Progress ({inProgress.length})</TabsTrigger>
                <TabsTrigger value="not_started">Saved / Not Started ({notStarted.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="in_progress">
                {inProgress.length === 0 ? <p className="text-muted-foreground">No resources currently in progress.</p> : inProgress.map(l => <ResourceCard key={l.id} item={l} />)}
              </TabsContent>
              <TabsContent value="not_started">
                {notStarted.length === 0 ? <p className="text-muted-foreground">No saved resources.</p> : notStarted.map(l => <ResourceCard key={l.id} item={l} />)}
              </TabsContent>
              <TabsContent value="completed">
                {completed.length === 0 ? <p className="text-muted-foreground">You haven't completed any resources yet.</p> : completed.map(l => <ResourceCard key={l.id} item={l} />)}
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
