"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Clock, Shield, Award, Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  VERIFIED: { label: "Verified", icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  PENDING: { label: "Pending Review", icon: Clock, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  SELF_REPORTED: { label: "Self-Reported", icon: Shield, className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  REJECTED: { label: "Rejected", icon: XCircle, className: "bg-red-500/10 text-red-600 border-red-500/20" },
};

export default function AdminCertificationsPage() {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchPending();
    fetchAnalytics();
  }, []);

  const fetchPending = async () => {
    try {
      const data = await api.get<any[]>("/certificates/admin/pending");
      setCerts(data || []);
    } catch { toast.error("Failed to load certificates"); }
    finally { setLoading(false); }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await api.get<any>("/certificates/admin/analytics");
      setAnalytics(data);
    } catch { /* silent */ }
  };

  const handleVerify = async (id: string) => {
    try {
      await api.patch(`/certificates/${id}/verify`, {});
      toast.success("Certificate verified!");
      fetchPending();
      fetchAnalytics();
    } catch (e: any) { toast.error(e.message || "Failed to verify"); }
  };

  const openReject = (id: string) => {
    setRejectTarget(id);
    setRejectReason("");
    setRejectOpen(true);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    try {
      await api.patch(`/certificates/${rejectTarget}/reject`, { rejectionReason: rejectReason });
      toast.success("Certificate rejected");
      setRejectOpen(false);
      fetchPending();
      fetchAnalytics();
    } catch (e: any) { toast.error(e.message || "Failed to reject"); }
  };

  const filtered = certs.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.issuer.toLowerCase().includes(search.toLowerCase()) ||
    c.student?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Certification Management</h1>
          <p className="text-muted-foreground mt-1">Review and verify student certificates within your institution.</p>
        </div>

        {/* Analytics Summary */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total", value: analytics.total, color: "text-foreground" },
              { label: "Verified", value: analytics.verified, color: "text-emerald-600" },
              { label: "Pending", value: analytics.pending, color: "text-amber-600" },
              { label: "Other", value: analytics.total - analytics.verified - analytics.pending, color: "text-muted-foreground" },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="pt-6 text-center">
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by title, issuer, or student..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600">
            {certs.length} Pending
          </Badge>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
        ) : filtered.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filtered.map(cert => {
                  const status = statusConfig[cert.verificationStatus] || statusConfig["PENDING"];
                  const StatusIcon = status.icon;
                  return (
                    <div key={cert.id} className="p-4 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={status.className}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{cert.sourceType}</Badge>
                        </div>
                        <p className="font-semibold truncate">{cert.title}</p>
                        <p className="text-sm text-muted-foreground">{cert.issuer} · Issued {format(new Date(cert.issueDate), "MMM d, yyyy")}</p>
                        <p className="text-sm font-medium mt-1">Student: {cert.student?.name}</p>
                        {cert.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {cert.skills.slice(0, 4).map((s: any) => (
                              <Badge key={s.skill.id} variant="secondary" className="text-xs">{s.skill.name}</Badge>
                            ))}
                            {cert.skills.length > 4 && <Badge variant="secondary" className="text-xs">+{cert.skills.length - 4}</Badge>}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button size="sm" onClick={() => handleVerify(cert.id)} className="bg-emerald-600 hover:bg-emerald-700">
                          <CheckCircle2 className="mr-1 h-3 w-3" />Verify
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => openReject(cert.id)}>
                          <XCircle className="mr-1 h-3 w-3" />Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-16 border rounded-lg bg-muted/20">
            <Award className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No pending certificates</h3>
            <p className="text-muted-foreground">All certificates have been reviewed.</p>
          </div>
        )}

        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Certificate</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason (optional)</Label>
              <Textarea
                id="rejection-reason"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Provide a reason for rejection..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject}>Reject Certificate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
