"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import SidebarLayout from "@/components/SidebarLayout";
import { api } from "@/lib/api";
import { getAdminNavBadgeCount } from "@/lib/navBadges";

const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Patients", href: "/admin/patients" },
  { label: "Doctors", href: "/admin/doctors" },
  { label: "Doctor Leaves", href: "/admin/leaves" },
  { label: "Reports", href: "/admin/reports" },
  { label: "Audit Log", href: "/admin/audit" },
  { label: "ML Models", href: "/admin/models" },
  { label: "Settings", href: "/admin/settings" },
  { label: "Alerts", href: "/admin/alerts" },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<any[]>([]);

  const loadNotifications = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const data = await api.notifications.list();
      setNotifications(data.notifications || []);
    } catch {
      /* sidebar works without badges */
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
      ADMIN_NAV.map((item) => ({
        ...item,
        badge: getAdminNavBadgeCount(item.href, notifications),
      })),
    [notifications]
  );

  return (
    <SidebarLayout title="Admin" subtitle="System Console" theme="admin" navItems={navItems}>
      {children}
    </SidebarLayout>
  );
}
