"use client";

import SidebarLayout from "@/components/SidebarLayout";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout
      title="Patient"
      subtitle="Health Portal"
      navItems={[
        { label: "Dashboard", href: "/patient/dashboard" },
        { label: "Predictions", href: "/patient/predictions" },
        { label: "Chatbot", href: "/patient/chatbot" },
        { label: "Alerts", href: "/patient/alerts" },
        { label: "Profile", href: "/patient/profile" },
      ]}
    >
      {children}
    </SidebarLayout>
  );
}

