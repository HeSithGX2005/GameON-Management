"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, FolderOpen, CheckCircle, Clock, Calendar, Users, Settings, Menu, X } from "lucide-react"

interface NavigationProps {
  userRole: "admin" | "employee"
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "employee"],
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderOpen,
    roles: ["admin", "employee"],
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: CheckCircle,
    roles: ["admin", "employee"],
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: Clock,
    roles: ["admin", "employee"],
  },
  {
    title: "Leave Requests",
    href: "/leave",
    icon: Calendar,
    roles: ["admin", "employee"],
  },
  {
    title: "Team",
    href: "/team",
    icon: Users,
    roles: ["admin", "employee"],
  },
  {
    title: "Admin Panel",
    href: "/admin",
    icon: Settings,
    roles: ["admin"],
  },
]

export function Navigation({ userRole }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const filteredItems = navigationItems.filter((item) => item.roles.includes(userRole))

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <h2 className="text-lg font-semibold">EMS</h2>
          </div>
          <nav className="flex-1 space-y-1 p-4">
            {filteredItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
