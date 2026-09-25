"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function AdminProfile() {
  const [profile, setProfile] = useState({ name: "", domain: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get<any>("/users/profile");
        if (data.user?.institution) {
          setProfile({
            name: data.user.institution.name || "",
            domain: data.user.institution.domain || ""
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      await api.put("/users/profile/organization", profile);
      setMessage("Institution profile saved successfully!");
    } catch (_err) {
      setMessage("Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="min-h-screen flex flex-col bg-muted/20">
        <Navbar />
        <main className="flex-1 p-8 max-w-2xl mx-auto w-full">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Institution Profile</h1>
          
          {isLoading ? (
            <p>Loading profile...</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              {message && (
                <div className="p-3 bg-primary/10 text-primary rounded-md text-sm font-medium">
                  {message}
                </div>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Institution Details</CardTitle>
                  <CardDescription>Update your academic institution&apos;s information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Institution Name</Label>
                    <Input 
                      id="name" 
                      value={profile.name} 
                      onChange={e => setProfile({...profile, name: e.target.value})} 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain / Website</Label>
                    <Input 
                      id="domain" 
                      value={profile.domain} 
                      onChange={e => setProfile({...profile, domain: e.target.value})} 
                      placeholder="e.g. example.edu" 
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
