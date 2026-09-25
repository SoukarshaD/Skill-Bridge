"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { ExternalLink, Copy, Check, FileText, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";

interface PortfolioData {
  items: any[];
  user: {
    name: string;
    studentProfile?: {
      department: string;
    }
  }
  [key: string]: any;
}

export default function PortfolioPage() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Add item state
  const [title, setTitle] = useState("");
  const [type, setType] = useState("project");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const fetchPortfolio = async () => {
    try {
      const data = await api.get<PortfolioData>("/portfolios/me");
      setPortfolio(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const copyToClipboard = () => {
    if (!user) return;
    const url = `${window.location.origin}/portfolio/${user.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/portfolios/items", {
        title,
        type,
        description,
        date: date ? new Date(date).toISOString() : undefined,
      });
      setIsAddOpen(false);
      setTitle("");
      setDescription("");
      setDate("");
      await fetchPortfolio();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await api.delete(`/portfolios/items/${id}`);
      await fetchPortfolio();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <p className="text-muted-foreground">Loading portfolio...</p>
        </main>
      </div>
    );
  }
  
  if (!portfolio) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <p className="text-muted-foreground">Failed to load portfolio</p>
        </main>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-5xl">
          <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Digital Portfolio</h1>
          <p className="text-muted-foreground mt-2">
            View your aggregated public profile. 
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={copyToClipboard} className="flex gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied Link" : "Copy Public Link"}
          </Button>
          <Link href={`/portfolio/${user?.id}`} target="_blank" className={buttonVariants()}>
            View Public Page <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Timeline & Achievements</CardTitle>
                <CardDescription>All your aggregated learning and self-reported items</CardDescription>
              </div>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger className={buttonVariants({ size: "sm" }) + " flex gap-2"}>
                  <Plus className="h-4 w-4"/> Add Entry
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleAddItem}>
                    <DialogHeader>
                      <DialogTitle>Add Portfolio Entry</DialogTitle>
                      <DialogDescription>Add a self-reported achievement or project.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Hackathon Winner" />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={type} onValueChange={setType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="project">Project</SelectItem>
                            <SelectItem value="certification">Certification</SelectItem>
                            <SelectItem value="achievement">Achievement</SelectItem>
                            <SelectItem value="internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
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
                          <div className="flex items-center gap-4">
                            <Badge variant={item.verificationStatus === "VERIFIED" ? "default" : "secondary"}>
                              {item.verificationStatus.replace("_", " ")}
                            </Badge>
                            {item.source === "Self-Reported Entry" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteItem(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-sm mt-2">{item.description}</p>
                        )}
                        {item.document && (
                          <div className="mt-3">
                            <a href={`/api/documents/${item.document.id}/download`} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" }) + " text-xs h-8"}>
                              <FileText className="mr-2 h-3 w-3" />
                              {item.document.filename}
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{portfolio.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{portfolio.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Academic Year</p>
                <p className="font-medium">{portfolio.academicYear}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verified Skills</CardTitle>
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
      </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
