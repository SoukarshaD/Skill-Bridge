"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AcademicianDashboard() {
  const [stats, setStats] = useState({ applications: 0, proposals: 0, profileComplete: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [profileRes, appsRes, collabRes] = await Promise.all([
          api.get("/users/profile"),
          api.get("/applications/me").catch(() => ({ applications: [] })),
          api.get("/collaborations/academician").catch(() => ({ collaborations: [] })),
        ]) as [any, any, any];

        const profile = profileRes.user?.academicProfile;
        const apps = appsRes.applications || [];
        const collabs = collabRes.collaborations || [];
        
        setStats({
          applications: apps.length,
          proposals: collabs.length,
          profileComplete: !!profile && (profile.expertise?.length > 0 || profile.researchAreas?.length > 0)
        });
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <ProtectedRoute allowedRoles={["ACADEMICIAN"]}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Training Provider Dashboard</h1>
          <p className="text-muted-foreground mb-8">Manage your skill development programs and curriculum alignment.</p>
          {loading ? (
            <div>Loading stats...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.profileComplete ? "Complete" : "Incomplete"}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.profileComplete ? "Your profile is visible to industry" : "Complete your profile to be discovered"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Curriculum Proposals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.proposals}</div>
                  <p className="text-xs text-muted-foreground">Alignment proposals submitted</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.applications}</div>
                  <p className="text-xs text-muted-foreground">Opportunities applied to</p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
