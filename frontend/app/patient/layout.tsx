"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { api } from "@/lib/api";
import { getPatientNavBadgeCount } from "@/lib/navBadges";

const PATIENT_NAV = [
  { key: "dashboard", href: "/patient/dashboard" },
  { key: "predictions", href: "/patient/predictions" },
  { key: "consultations", href: "/patient/consultations", label: "Doctor Consultant" },
  { key: "chatbot", href: "/patient/chatbot", label: "Chatbot" },
  { key: "alerts", href: "/patient/alerts" },
  { key: "profile", href: "/patient/profile" },
] as const;

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const data = await api.notifications.list();
      setNotifications(data.notifications || []);
    } catch {
      /* ignore — sidebar still works without badges */
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    const onFocus = () => loadNotifications();
    const onUpdated = () => loadNotifications();
    window.addEventListener("focus", onFocus);
    window.addEventListener("notifications-updated", onUpdated);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("notifications-updated", onUpdated);
    };
  }, [loadNotifications, pathname]);

  const navItems = useMemo(
    () =>
      PATIENT_NAV.map((item) => {
        const label =
          item.label ??
          (item.key === "dashboard"
            ? t("dashboard")
            : item.key === "predictions"
              ? t("predictions")
              : item.key === "alerts"
                ? t("alerts")
                : t("profile"));
        return {
          label,
          href: item.href,
          badge: getPatientNavBadgeCount(item.href, notifications),
        };
      }),
    [notifications, t]
  );

  return (
    <SidebarLayout title="Patient" subtitle={t("yourHealthAtGlance")} navItems={navItems}>
      {children}
    </SidebarLayout>
  );
}
