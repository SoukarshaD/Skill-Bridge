"use client";

import { InternshipWorkspace } from "@/components/internship-workspace";
import { ProtectedRoute } from "@/components/protected-route";
import { useParams } from "next/navigation";

export default function StudentInternshipView() {
  const params = useParams();
  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <InternshipWorkspace id={params.id as string} role="STUDENT" />
    </ProtectedRoute>
  );
}
