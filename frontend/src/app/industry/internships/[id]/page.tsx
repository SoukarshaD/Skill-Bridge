"use client";

import { InternshipWorkspace } from "@/components/internship-workspace";
import { ProtectedRoute } from "@/components/protected-route";
import { useParams } from "next/navigation";

export default function IndustryInternshipView() {
  const params = useParams();
  return (
    <ProtectedRoute allowedRoles={["INDUSTRY"]}>
      <InternshipWorkspace id={params.id as string} role="INDUSTRY" />
    </ProtectedRoute>
  );
}
