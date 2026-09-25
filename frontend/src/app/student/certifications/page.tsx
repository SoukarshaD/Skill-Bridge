"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, Plus, ExternalLink, Shield, Clock, XCircle, CheckCircle2, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  description?: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  verificationStatus: "SELF_REPORTED" | "PENDING" | "VERIFIED" | "REJECTED";
  verificationMethod: string;
  sourceType: string;
  rejectionReason?: string;
  isPublic: boolean;
  skills: { skill: { id: string; name: string; category: string } }[];
  portfolioItems: { id: string }[];
};

const statusConfig = {
  VERIFIED: { label: "Verified", icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  PENDING: { label: "Pending Review", icon: Clock, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  SELF_REPORTED: { label: "Self-Reported", icon: Shield, className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  REJECTED: { label: "Rejected", icon: XCircle, className: "bg-red-500/10 text-red-600 border-red-500/20" },
};

const sourceLabels: Record<string, string> = {
  EXTERNAL: "External",
  PROGRAM: "Program",
  INTERNSHIP: "Internship",
  MENTORSHIP: "Mentorship",
  LEARNING: "Learning",
  ASSESSMENT: "Assessment",
};

export default function StudentCertificationsPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [skills, setSkills] = useState<{ id: string; name: string }[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [filterTab, setFilterTab] = useState("all");
  const [form, setForm] = useState({
    title: "", issuer: "", description: "", issueDate: "",
    expiryDate: "", credentialId: "", credentialUrl: "",
    sourceType: "EXTERNAL", isPublic: false,
  });

  useEffect(() => {
    fetchCertificates();
    fetchSkills();
  }, []);

  const fetchCertificates = async () => {
    try {
      const data = await api.get<Certificate[]>("/certificates/my");
      setCertificates(data || []);
    } catch { toast.error("Failed to load certificates"); }
    finally { setLoading(false); }
  };

  const fetchSkills = async () => {
    try {
      const data = await api.get<{ skills: { id: string; name: string }[] }>("/skills");
      setSkills(data.skills || []);
    } catch { /* silent */ }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/certificates", {
        ...form,
        issueDate: new Date(form.issueDate).toISOString(),
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : undefined,
        skillIds: selectedSkills,
      });
      toast.success("Certificate added successfully!");
      setAddOpen(false);
      setForm({ title: "", issuer: "", description: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "", sourceType: "EXTERNAL", isPublic: false });
      setSelectedSkills([]);
      fetchCertificates();
    } catch (e: any) { toast.error(e.message || "Failed to add certificate"); }
  };

  const handleSubmitForVerification = async (id: string) => {
    try {
      await api.post(`/certificates/${id}/submit`, {});
      toast.success("Submitted for verification!");
      fetchCertificates();
    } catch (e: any) { toast.error(e.message || "Failed to submit"); }
  };

  const handleAddToPortfolio = async (id: string) => {
    try {
      await api.post(`/certificates/${id}/portfolio`, {});
      toast.success("Added to portfolio!");
      fetchCertificates();
    } catch (e: any) { toast.error(e.message || "Failed to add to portfolio"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this certificate?")) return;
    try {
      await api.delete(`/certificates/${id}`);
      toast.success("Deleted");
      fetchCertificates();
    } catch (e: any) { toast.error(e.message || "Failed to delete"); }
  };

  const filtered = certificates.filter(c => {
    if (filterTab === "all") return true;
    if (filterTab === "verified") return c.verificationStatus === "VERIFIED";
    if (filterTab === "pending") return c.verificationStatus === "PENDING";
    if (filterTab === "self") return c.verificationStatus === "SELF_REPORTED";
    if (filterTab === "rejected") return c.verificationStatus === "REJECTED";
    if (filterTab === "external") return c.sourceType === "EXTERNAL";
    return c.sourceType === filterTab.toUpperCase();
  });

  const toggleSkill = (id: string) => {
    setSelectedSkills(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Certificates</h1>
            <p className="text-muted-foreground mt-1">Track all your achievements and certifications.</p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Certificate
          </Button>
        </div>

        <Tabs value={filterTab} onValueChange={setFilterTab} className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="all">All ({certificates.length})</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="self">Self-Reported</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="external">External</TabsTrigger>
            <TabsTrigger value="program">Program</TabsTrigger>
            <TabsTrigger value="internship">Internship</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
            <TabsTrigger value="mentorship">Mentorship</TabsTrigger>
          </TabsList>

          <TabsContent value={filterTab}>
            {loading ? (
              <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(cert => {
                  const status = statusConfig[cert.verificationStatus];
                  const StatusIcon = status.icon;
                  const inPortfolio = cert.portfolioItems.length > 0;
                  return (
                    <Card key={cert.id} className="flex flex-col hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className={status.className}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {sourceLabels[cert.sourceType] || cert.sourceType}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg line-clamp-2">{cert.title}</CardTitle>
                        <CardDescription>{cert.issuer}</CardDescription>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(cert.issueDate), "MMM d, yyyy")}
                          {cert.expiryDate && ` → ${format(new Date(cert.expiryDate), "MMM d, yyyy")}`}
                        </p>
                      </CardHeader>
                      <CardContent className="flex-1">
                        {cert.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {cert.skills.map(s => (
                              <Badge key={s.skill.id} variant="secondary" className="text-xs">{s.skill.name}</Badge>
                            ))}
                          </div>
                        )}
                        {cert.rejectionReason && (
                          <p className="text-xs text-red-500 mt-2">Reason: {cert.rejectionReason}</p>
                        )}
                      </CardContent>
                      <CardFooter className="pt-4 border-t flex flex-wrap gap-2">
                        <Link href={`/student/certifications/${cert.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">View</Button>
                        </Link>
                        {cert.verificationStatus === "SELF_REPORTED" && (
                          <Button size="sm" variant="secondary" onClick={() => handleSubmitForVerification(cert.id)}>
                            Submit for Review
                          </Button>
                        )}
                        {!inPortfolio && (
                          <Button size="sm" variant="ghost" onClick={() => handleAddToPortfolio(cert.id)}>
                            <PlusCircle className="h-3 w-3 mr-1" />Portfolio
                          </Button>
                        )}
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost"><ExternalLink className="h-3 w-3" /></Button>
                          </a>
                        )}
                        {(cert.verificationStatus === "SELF_REPORTED" || cert.verificationStatus === "REJECTED") && (
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(cert.id)}>
                            Delete
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 border rounded-lg bg-muted/20">
                <Award className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No certificates found</h3>
                <p className="text-muted-foreground mb-4">Add your first certificate to start building your verified skill record.</p>
                <Button variant="outline" onClick={() => setAddOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />Add Certificate
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Add Certificate Dialog */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Certificate</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="cert-title">Certificate Title *</Label>
                  <Input id="cert-title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. AWS Cloud Practitioner" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cert-issuer">Issuer *</Label>
                  <Input id="cert-issuer" required value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} placeholder="e.g. Amazon Web Services" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cert-type">Source Type</Label>
                  <Select value={form.sourceType} onValueChange={v => setForm(f => ({ ...f, sourceType: v }))}>
                    <SelectTrigger id="cert-type"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXTERNAL">External</SelectItem>
                      <SelectItem value="LEARNING">Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cert-issue-date">Issue Date *</Label>
                  <Input id="cert-issue-date" type="date" required value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cert-expiry-date">Expiry Date (optional)</Label>
                  <Input id="cert-expiry-date" type="date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cert-cred-id">Credential ID (optional)</Label>
                  <Input id="cert-cred-id" value={form.credentialId} onChange={e => setForm(f => ({ ...f, credentialId: e.target.value }))} placeholder="ABC123" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cert-cred-url">Credential URL (optional)</Label>
                  <Input id="cert-cred-url" type="url" value={form.credentialUrl} onChange={e => setForm(f => ({ ...f, credentialUrl: e.target.value }))} placeholder="https://..." />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="cert-desc">Description (optional)</Label>
                  <Textarea id="cert-desc" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Associated Skills</Label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border rounded p-2">
                    {skills.map(skill => (
                      <Badge
                        key={skill.id}
                        variant={selectedSkills.includes(skill.id) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleSkill(skill.id)}
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                <Button type="submit">Add Certificate</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
