"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
};

const themeClasses = {
  default: {
    page: "bg-emerald-50",
    sidebar: "bg-emerald-600",
    sidebarBorder: "border-emerald-500",
    sidebarMuted: "text-emerald-100",
    navText: "text-emerald-50/90",
    navHover: "hover:bg-white/10",
    activeBg: "bg-white text-emerald-700",
    mobileBar: "bg-emerald-600 border-emerald-500",
    outline: "border-emerald-300/40",
  },
  doctor: {
    page: "bg-slate-50",
    sidebar: "bg-[#001f3f]",
    sidebarBorder: "border-blue-900",
    sidebarMuted: "text-blue-200/80",
    navText: "text-blue-100/90",
    navHover: "hover:bg-white/10",
    activeBg: "bg-white text-[#001f3f]",
    mobileBar: "bg-[#001f3f] border-blue-900",
    outline: "border-blue-400/40",
  },
  admin: {
    page: "bg-purple-50",
    sidebar: "bg-purple-700",
    sidebarBorder: "border-purple-600",
    sidebarMuted: "text-purple-100",
    navText: "text-purple-50/90",
    navHover: "hover:bg-white/10",
    activeBg: "bg-white text-purple-800",
    mobileBar: "bg-purple-700 border-purple-600",
    outline: "border-purple-300/40",
  },
} as const;

type SidebarLayoutProps = {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  children: React.ReactNode;
  theme?: "default" | "doctor" | "admin";
};

export default function SidebarLayout({
  title,
  subtitle,
  navItems,
  children,
  theme: themeKey = "default",
}: SidebarLayoutProps) {
  const pathname = usePathname();
  const t = themeClasses[themeKey];

  return (
    <div className={cn("h-screen overflow-hidden", t.page)}>
      <div className="flex h-full">
        <aside className={cn("hidden md:flex w-72 flex-col h-screen sticky top-0 overflow-y-auto", t.sidebar)}>
          <div className="p-6">
            <div className="h-12 w-12 rounded-2xl bg-white/20 text-white flex items-center justify-center text-lg font-semibold">
              {title.slice(0, 1)}
            </div>
            <h1 className="text-xl font-semibold text-white mt-4">{title}</h1>
            <p className={cn("text-xs mt-1", t.sidebarMuted)}>{subtitle}</p>
          </div>
          <Separator className="bg-white/15" />
          <nav className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start rounded-xl hover:text-white",
                    t.navText,
                    t.navHover,
                    active && t.activeBg
                  )}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 h-screen overflow-y-auto">
          <div className={cn("md:hidden sticky top-0 z-40 border-b p-4 flex items-center gap-3", t.mobileBar)}>
            <div className="text-sm">
              <p className="font-semibold text-white">{title}</p>
              <p className={cn("text-xs", t.sidebarMuted)}>{subtitle}</p>
            </div>
          </div>
          <div className={cn("md:hidden px-4 py-3 border-b flex gap-2 overflow-x-auto", t.mobileBar)}>
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full text-white/90",
                    t.outline,
                    active && t.activeBg
                  )}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              );
            })}
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

