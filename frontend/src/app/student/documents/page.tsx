"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [type, setType] = useState("RESUME");
  const [accessPolicy, setAccessPolicy] = useState("private");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const data = await api.get<Document[]>("/documents");
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.length) {
      setError("Please select a file.");
      return;
    }

    const file = fileInputRef.current.files[0];
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be smaller than 5MB.");
      return;
    }

    setUploading(true);
    setError("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("accessPolicy", accessPolicy);

    try {
      await api.post("/documents", formData);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await fetchDocuments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    
    try {
      await api.delete(`/documents/${id}`);
      await fetchDocuments();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading documents...</p>
        </main>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Documents</h1>
          <p className="text-muted-foreground mt-2">
            Upload and manage your resumes, certificates, and academic records.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Type</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RESUME">Resume</SelectItem>
                    <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                    <SelectItem value="INTERNSHIP_LETTER">Internship Letter</SelectItem>
                    <SelectItem value="ACADEMIC_RECORD">Academic Record</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <Select value={accessPolicy} onValueChange={setAccessPolicy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private (Only you)</SelectItem>
                    <SelectItem value="public">Public (Downloadable via Portfolio)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Marking a document as public means anyone with your portfolio link can download it. Keep resumes private unless intentionally sharing publicly.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">File (PDF, DOC, DOCX, PNG, JPG &lt; 5MB)</label>
                <Input type="file" ref={fileInputRef} accept=".pdf,.png,.jpeg,.jpg,.doc,.docx" />
              </div>
              
              {error && <p className="text-sm text-destructive">{error}</p>}
              
              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Saved Documents</h2>
          {documents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                <p>No documents uploaded yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {documents.map(doc => (
                <Card key={doc.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base truncate" title={doc.filename}>{doc.filename}</CardTitle>
                    <CardDescription>{doc.type} • {doc.accessPolicy}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2 flex gap-2">
                    <a href={`/api/documents/${doc.id}/download`} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" }) + " flex-1"}>
                      View
                    </a>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(doc.id)}>
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
