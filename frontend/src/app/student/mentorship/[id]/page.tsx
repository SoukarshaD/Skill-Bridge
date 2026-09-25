"use client";

import { MentorshipDashboard } from "@/components/mentorship-dashboard";
import { ProtectedRoute } from "@/components/protected-route";
import { useParams } from "next/navigation";

export default function StudentMentorshipView() {
  const params = useParams();
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <MentorshipDashboard id={params.id as string} role="STUDENT" />
    </ProtectedRoute>
  );
}
