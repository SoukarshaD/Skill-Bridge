"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SkillSelector } from "@/components/skill-selector";

import api from "@/lib/api";

interface SkillData {
  skillId: string;
  proficiency: number;
  skill?: { name: string };
}

interface UserProfileData {
  user: {
    studentProfile?: {
      department: string;
      year: number;
      studentSkills: SkillData[];
    }
  }
}

export default function StudentProfile() {
  const [profile, setProfile] = useState({ department: "", year: "" });
  const [skills, setSkills] = useState<{skillId: string, proficiency: number, name?: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.get<UserProfileData>("/users/profile");
        if (data.user?.studentProfile) {
          setProfile({
            department: data.user.studentProfile.department || "",
            year: data.user.studentProfile.year?.toString() || ""
          });
          if (data.user.studentProfile.studentSkills) {
            setSkills(
              data.user.studentProfile.studentSkills.map((ss: SkillData) => ({
                skillId: ss.skillId,
                proficiency: ss.proficiency,
                name: ss.skill?.name
              }))
            );
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSkillsChange = (newSkills: any) => {
    setSkills(newSkills);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      // 1. Save Profile info
      await api.put("/users/profile/student", {
        department: profile.department,
        year: profile.year ? parseInt(profile.year) : undefined,
      });

      const payload = {
        skills: skills.map(s => ({ skillId: s.skillId, proficiency: s.proficiency }))
      };
      
      // 2. Save Skills
      await api.post("/users/profile/student/skills", payload);

      setMessage("Profile and skills saved successfully!");
    } catch (err) {
      setMessage("Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen flex flex-col bg-muted/20">
        <Navbar />
        <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
          <h1 className="text-3xl font-bold tracking-tight mb-8">My Profile</h1>
          
          {isLoading ? (
            <p>Loading profile...</p>
          ) : (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {message && (
                <div className="p-3 bg-primary/10 text-primary rounded-md text-sm font-medium">
                  {message}
                </div>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Academic Details</CardTitle>
                  <CardDescription>Update your academic information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input 
                      id="department" 
                      value={profile.department} 
                      onChange={e => setProfile({...profile, department: e.target.value})} 
                      placeholder="e.g. Computer Science" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year of Study</Label>
                    <Input 
                      id="year" 
                      type="number" 
                      value={profile.year} 
                      onChange={e => setProfile({...profile, year: e.target.value})} 
                      placeholder="e.g. 3" 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skill Matrix</CardTitle>
                  <CardDescription>Manage your skills and self-assess your proficiency.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SkillSelector 
                    initialSkills={skills} 
                    onSkillsChange={handleSkillsChange} 
                  />
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
