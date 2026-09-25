"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

export default function AcademicianProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    institution: "",
    department: "",
    expertise: "",
    researchAreas: "",
    consultancyAreas: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get("/users/profile") as any;
        const profile = res.user?.academicProfile;
        if (profile) {
          setFormData({
            institution: profile.institution || "",
            department: profile.department || "",
            expertise: profile.expertise?.join(", ") || "",
            researchAreas: profile.researchAreas?.join(", ") || "",
            consultancyAreas: profile.consultancyAreas?.join(", ") || ""
          });
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await api.put("/users/profile/academician", {
        institution: formData.institution,
        department: formData.department,
        expertise: formData.expertise.split(",").map(s => s.trim()).filter(Boolean),
        researchAreas: formData.researchAreas.split(",").map(s => s.trim()).filter(Boolean),
        consultancyAreas: formData.consultancyAreas.split(",").map(s => s.trim()).filter(Boolean)
      });
      setMessage("Profile saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ACADEMICIAN"]}>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 container max-w-4xl py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Academic Profile</h1>

          {loading ? (
            <p>Loading profile...</p>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Professional Details</CardTitle>
                <CardDescription>
                  Update your expertise and research areas so industry can find you for collaborations.
                  Use comma-separated values for multiple entries.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      placeholder="e.g. MIT, Stanford"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Core Expertise (comma-separated)</Label>
                  <Input
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleChange}
                    placeholder="e.g. Machine Learning, Distributed Systems, Algorithms"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Research Areas (comma-separated)</Label>
                  <Input
                    name="researchAreas"
                    value={formData.researchAreas}
                    onChange={handleChange}
                    placeholder="e.g. NLP, Computer Vision"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Consultancy Areas (comma-separated)</Label>
                  <Input
                    name="consultancyAreas"
                    value={formData.consultancyAreas}
                    onChange={handleChange}
                    placeholder="e.g. System Architecture, Cloud Migration"
                  />
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  {message && <span className="text-sm text-green-600 font-medium">{message}</span>}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
