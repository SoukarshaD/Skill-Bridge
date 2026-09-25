"use client";

import { MentorshipDashboard } from "@/components/mentorship-dashboard";
import { ProtectedRoute } from "@/components/protected-route";
import { useParams } from "next/navigation";

export default function IndustryMentorshipView() {
  const params = useParams();
  return (
    <ProtectedRoute allowedRoles={["INDUSTRY"]}>
      <MentorshipDashboard id={params.id as string} role="INDUSTRY" />
    </ProtectedRoute>
  );
}
