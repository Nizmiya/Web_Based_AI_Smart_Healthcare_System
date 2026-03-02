"use client";

import SidebarLayout from "@/components/SidebarLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout
      title="Admin"
      subtitle="System Console"
      theme="admin"
      navItems={[
        { label: "Dashboard", href: "/admin/dashboard" },
        { label: "Patients", href: "/admin/patients" },
        { label: "Doctors", href: "/admin/doctors" },
        { label: "Reports", href: "/admin/reports" },
        { label: "ML Models", href: "/admin/models" },
        { label: "Settings", href: "/admin/settings" },
        { label: "Alerts", href: "/admin/alerts" },
      ]}
    >
      {children}
    </SidebarLayout>
  );
}

