"use client";

import SidebarLayout from "@/components/SidebarLayout";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout
      title="Doctor"
      subtitle="Care Workspace"
      navItems={[
        { label: "Dashboard", href: "/doctor/dashboard" },
        { label: "Reviews", href: "/doctor/reviews" },
        { label: "Patients", href: "/doctor/patients" },
        { label: "Consultations", href: "/doctor/consultations" },
        { label: "Alerts", href: "/doctor/alerts" },
      ]}
    >
      {children}
    </SidebarLayout>
  );
}

