"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { ProtectedRoute } from "@/components/protected-route";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Phase 8 Cleanup: The original ATS-style ranked applicants view was removed in Phase 1
// (getRankedApplicants endpoint deleted from backend). This page now shows a simplified
// applications view that redirects back to the opportunity detail page, since
// applicant-level management is now handled through the generic applications endpoint.

export default function OpportunityApplications() {
  const { id } = useParams();

  return (
    <ProtectedRoute allowedRoles={["INDUSTRY", "ADMIN"]}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Opportunity Applications</h1>
              <p className="text-muted-foreground mt-2">
                Application management has moved. Use the opportunity detail page to review participants.
              </p>
            </div>
            <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Applicant Ranking View Removed</CardTitle>
              <CardDescription>
                This feature was deprecated as part of the PS 26134 migration (Phase 1 — ATS Removal).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The previous ranked applicant Kanban board has been removed. Application status updates
                (shortlisting, acceptance) are still supported through the standard applications flow.
              </p>
              <div className="flex gap-3">
                <Link href={`/industry/opportunities/${id}`}>
                  <Button variant="default">View Opportunity Details</Button>
                </Link>
                <Link href="/industry/opportunities">
                  <Button variant="outline">All Postings</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
