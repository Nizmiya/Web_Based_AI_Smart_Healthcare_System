"use client";

import SidebarLayout from "@/components/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  return (
    <SidebarLayout
      title="Patient"
      subtitle={t("yourHealthAtGlance")}
      navItems={[
        { label: t("dashboard"), href: "/patient/dashboard" },
        { label: t("predictions"), href: "/patient/predictions" },
        { label: "Chatbot", href: "/patient/chatbot" },
        { label: t("alerts"), href: "/patient/alerts" },
        { label: t("profile"), href: "/patient/profile" },
      ]}
    >
      {children}
    </SidebarLayout>
  );
}

