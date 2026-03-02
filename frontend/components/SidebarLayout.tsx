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

type SidebarLayoutProps = {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  children: React.ReactNode;
};

export default function SidebarLayout({
  title,
  subtitle,
  navItems,
  children,
}: SidebarLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="h-screen bg-emerald-50 overflow-hidden">
      <div className="flex h-full">
        <aside className="hidden md:flex w-72 flex-col bg-emerald-600 h-screen sticky top-0 overflow-y-auto">
          <div className="p-6">
            <div className="h-12 w-12 rounded-2xl bg-white/20 text-white flex items-center justify-center text-lg font-semibold">
              {title.slice(0, 1)}
            </div>
            <h1 className="text-xl font-semibold text-white mt-4">{title}</h1>
            <p className="text-xs text-emerald-100 mt-1">{subtitle}</p>
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
                    "w-full justify-start rounded-xl text-emerald-50/90 hover:text-white hover:bg-white/10",
                    active && "bg-white text-emerald-700 shadow-sm"
                  )}
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 h-screen overflow-y-auto">
          <div className="md:hidden sticky top-0 z-40 bg-emerald-600 border-b border-emerald-500 p-4 flex items-center gap-3">
            <div className="text-sm">
              <p className="font-semibold text-white">{title}</p>
              <p className="text-xs text-emerald-100">{subtitle}</p>
            </div>
          </div>
          <div className="md:hidden px-4 py-3 border-b border-emerald-500 bg-emerald-600 flex gap-2 overflow-x-auto">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={active ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "rounded-full border-emerald-300/40 text-emerald-50/90",
                    active && "bg-white text-emerald-700 border-white"
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

