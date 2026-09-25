"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Calendar, ExternalLink, Building2, CheckCircle2, Clock, Shield, XCircle, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  VERIFIED: { label: "Verified", icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  PENDING: { label: "Pending Review", icon: Clock, className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  SELF_REPORTED: { label: "Self-Reported", icon: Shield, className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  REJECTED: { label: "Rejected", icon: XCircle, className: "bg-red-500/10 text-red-600 border-red-500/20" },
};

export default function CertificationDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [cert, setCert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCert(); }, [id]);

  const fetchCert = async () => {
    try {
      const data = await api.get<any>(`/certificates/${id}`);
      setCert(data);
    } catch {
      toast.error("Certificate not found");
      router.push("/student/certifications");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPortfolio = async () => {
    try {
      await api.post(`/certificates/${id}/portfolio`, {});
      toast.success("Added to portfolio!");
      fetchCert();
    } catch (e: any) { toast.error(e.message || "Failed to add"); }
  };

  const handleSubmitForVerification = async () => {
    try {
      await api.post(`/certificates/${id}/submit`, {});
      toast.success("Submitted for verification!");
      fetchCert();
    } catch (e: any) { toast.error(e.message || "Failed to submit"); }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <Navbar />
        <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>
      </ProtectedRoute>
    );
  }

  if (!cert) return null;

  const status = statusConfig[cert.verificationStatus] || statusConfig["SELF_REPORTED"];
  const StatusIcon = status.icon;
  const inPortfolio = cert.portfolioItems?.length > 0;

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <Navbar />
      <div className="container mx-auto py-8 px-4 md:px-8 max-w-4xl space-y-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link href="/student/certifications" className="hover:text-primary transition-colors">Certificates</Link>
          <span>/</span>
          <span className="text-foreground">{cert.title}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge variant="outline" className={status.className}>
                  <StatusIcon className="mr-1 h-3.5 w-3.5" />
                  {status.label}
                </Badge>
                <Badge variant="outline">{cert.sourceType}</Badge>
                {cert.isPublic && <Badge variant="secondary">Public</Badge>}
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">{cert.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{cert.issuer}</span>
              </div>
            </div>

            {cert.description && (
              <Card>
                <CardHeader><CardTitle>Description</CardTitle></CardHeader>
                <CardContent><p className="whitespace-pre-wrap">{cert.description}</p></CardContent>
              </Card>
            )}

            {cert.skills?.length > 0 && (
              <Card>
                <CardHeader><CardTitle>Associated Skills</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {cert.skills.map((s: any) => (
                      <Badge key={s.skill.id} variant="secondary">{s.skill.name}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {cert.rejectionReason && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <CardHeader><CardTitle className="text-red-600">Rejection Reason</CardTitle></CardHeader>
                <CardContent><p className="text-red-600">{cert.rejectionReason}</p></CardContent>
              </Card>
            )}
          </div>

          <div className="w-full md:w-72 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Issue Date</p>
                    <p className="text-muted-foreground">{format(new Date(cert.issueDate), "MMM d, yyyy")}</p>
                  </div>
                </div>
                {cert.expiryDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Expiry Date</p>
                      <p className="text-muted-foreground">{format(new Date(cert.expiryDate), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                )}
                {cert.credentialId && (
                  <div>
                    <p className="font-medium">Credential ID</p>
                    <p className="text-muted-foreground font-mono text-xs">{cert.credentialId}</p>
                  </div>
                )}
                {cert.verificationMethod && (
                  <div>
                    <p className="font-medium">Verification Method</p>
                    <p className="text-muted-foreground">{cert.verificationMethod.replace(/_/g, ' ')}</p>
                  </div>
                )}
                {cert.verifiedAt && (
                  <div>
                    <p className="font-medium">Verified On</p>
                    <p className="text-muted-foreground">{format(new Date(cert.verifiedAt), "MMM d, yyyy")}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-2">
              {cert.credentialUrl && (
                <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />View Credential
                  </Button>
                </a>
              )}
              {!inPortfolio ? (
                <Button className="w-full" onClick={handleAddToPortfolio}>
                  <PlusCircle className="mr-2 h-4 w-4" />Add to Portfolio
                </Button>
              ) : (
                <Link href="/student/portfolio" className="w-full">
                  <Button variant="secondary" className="w-full">View in Portfolio</Button>
                </Link>
              )}
              {cert.verificationStatus === "SELF_REPORTED" && (
                <Button variant="outline" className="w-full" onClick={handleSubmitForVerification}>
                  Submit for Verification
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
