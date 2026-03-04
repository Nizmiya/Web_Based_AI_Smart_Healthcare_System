"use client";

import SidebarLayout from "@/components/SidebarLayout";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout
      title="Doctor"
      subtitle="Care Workspace"
      theme="doctor"
      navItems={[
        { label: "Dashboard", href: "/doctor/dashboard" },
        { label: "Reviews", href: "/doctor/reviews" },
        { label: "Patients", href: "/doctor/patients" },
        { label: "Consultations", href: "/doctor/consultations" },
        { label: "Leave", href: "/doctor/leave" },
        { label: "Alerts", href: "/doctor/alerts" },
      ]}
    >
      {children}
    </SidebarLayout>
  );
}

