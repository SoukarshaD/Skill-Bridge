"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { ProtectedRoute } from "@/components/protected-route";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateMentorshipProgram() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    maxMentees: 5,
    expertise: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/mentorship/programs", {
        ...formData,
        expertise: formData.expertise.split(",").map(s => s.trim()).filter(s => s)
      });
      router.push("/industry/mentorship");
    } catch (error) {
      console.error(error);
      alert("Failed to create program");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["INDUSTRY"]}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 md:px-8 py-12 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create Mentorship Program</CardTitle>
              <CardDescription>Offer your expertise and guide the next generation of students.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Program Title</Label>
                  <Input 
                    required 
                    placeholder="e.g. Fullstack Web Development Mentorship" 
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Description & Expectations</Label>
                  <Textarea 
                    required 
                    className="h-32"
                    placeholder="Describe what mentees will learn, how often you will meet, and prerequisites..." 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Maximum Mentees</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="20" 
                      required 
                      value={formData.maxMentees} 
                      onChange={e => setFormData({ ...formData, maxMentees: parseInt(e.target.value) })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expertise Areas (comma separated)</Label>
                    <Input 
                      required 
                      placeholder="React, Node.js, System Design" 
                      value={formData.expertise} 
                      onChange={e => setFormData({ ...formData, expertise: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                  <Button type="submit" disabled={loading}>{loading ? "Publishing..." : "Publish Program"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
