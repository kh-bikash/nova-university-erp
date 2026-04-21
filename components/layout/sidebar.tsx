"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Award,
  BarChart3,
  Bell,
  Book,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Bus,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Ticket,
  Users,
  Users2,
  Wrench,
} from "lucide-react"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  roles: string[]
}

const navItems: NavItem[] = [
  // Academic
  { href: "/dashboard", label: "Home", icon: <Home size={20} />, roles: ["student", "faculty", "admin"] },
  { href: "/parent/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, roles: ["parent"] },
  { href: "/student/courses", label: "My Courses", icon: <BookOpen size={20} />, roles: ["student"] },
  { href: "/courses", label: "Courses", icon: <BookOpen size={20} />, roles: ["faculty"] },
  { href: "/student/timetable", label: "My Timetable", icon: <Calendar size={20} />, roles: ["student"] },
  { href: "/timetable", label: "Time Tables", icon: <Calendar size={20} />, roles: ["faculty"] },
  { href: "/admin/timetable", label: "Time Tables", icon: <Calendar size={20} />, roles: ["admin"] },
  { href: "/student/exams", label: "Exam Section", icon: <FileText size={20} />, roles: ["student"] },
  { href: "/faculty/exams", label: "Exam Section", icon: <FileText size={20} />, roles: ["faculty"] },
  { href: "/admin/exams", label: "Exam Section", icon: <FileText size={20} />, roles: ["admin"] },
  { href: "/results", label: "My CGPA", icon: <Award size={20} />, roles: ["student"] },
  { href: "/student/registration", label: "Academic Reg.", icon: <FileText size={20} />, roles: ["student"] },

  // Student Services
  { href: "/student/attendance", label: "Attendance", icon: <ClipboardCheck size={20} />, roles: ["student"] },
  { href: "/faculty/attendance-marking", label: "Mark Attendance", icon: <ClipboardCheck size={20} />, roles: ["faculty"] },
  { href: "/admin/attendance", label: "Attendance", icon: <ClipboardCheck size={20} />, roles: ["admin"] },

  { href: "/fees", label: "Fee Payments", icon: <CreditCard size={20} />, roles: ["student"] },
  { href: "/admin/fees", label: "Fee Management", icon: <CreditCard size={20} />, roles: ["admin"] },

  { href: "/hostel", label: "Hostel", icon: <Building2 size={20} />, roles: ["student"] },
  { href: "/admin/hostel", label: "Hostel Mgmt", icon: <Building2 size={20} />, roles: ["admin"] },

  { href: "/library", label: "Library", icon: <Book size={20} />, roles: ["student", "faculty"] },
  { href: "/admin/library", label: "Library Mgmt", icon: <Book size={20} />, roles: ["admin"] },

  { href: "/transport", label: "Transport", icon: <Bus size={20} />, roles: ["student", "faculty"] },
  { href: "/admin/transport", label: "Transport Mgmt", icon: <Bus size={20} />, roles: ["admin"] },

  { href: "/student/services", label: "Services", icon: <FileText size={20} />, roles: ["student"] },
  { href: "/admin/services", label: "Service Requests", icon: <FileText size={20} />, roles: ["admin"] },

  { href: "/infrastructure", label: "Infrastructure", icon: <Wrench size={20} />, roles: ["faculty"] },
  { href: "/admin/infrastructure", label: "Infra Mgmt", icon: <Wrench size={20} />, roles: ["admin"] },

  // Career & Activities
  { href: "/student/placements", label: "Placement Cell", icon: <Briefcase size={20} />, roles: ["student"] },
  { href: "/admin/placement", label: "Placement Mgmt", icon: <Briefcase size={20} />, roles: ["admin"] },
  { href: "/clubs", label: "Clubs", icon: <Users size={20} />, roles: ["student"] },
  { href: "/counselling", label: "Counselling", icon: <MessageSquare size={20} />, roles: ["student"] },
  { href: "/feedback", label: "Feedback", icon: <MessageSquare size={20} />, roles: ["student"] },
  { href: "/no-due", label: "No Due", icon: <CheckCircle size={20} />, roles: ["student"] },
  { href: "/student/registrar", label: "Registrar", icon: <Building size={20} />, roles: ["student", "faculty"] },

  // Admin Specific
  { href: "/admin/departments", label: "Departments", icon: <Building2 size={20} />, roles: ["admin"] },
  { href: "/admin/users", label: "Users", icon: <Users2 size={20} />, roles: ["admin"] },
  { href: "/admin/faculty", label: "Faculty", icon: <GraduationCap size={20} />, roles: ["admin"] },
  { href: "/admin/courses", label: "Courses", icon: <BookOpen size={20} />, roles: ["admin"] },

  // Staff Specific
  { href: "/staff/dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} />, roles: ["staff"] },
  { href: "/staff/complaints", label: "Complaints", icon: <MessageSquare size={20} />, roles: ["staff"] },
  { href: "/staff/infrastructure", label: "Infrastructure", icon: <Wrench size={20} />, roles: ["staff"] },
  { href: "/staff/inventory", label: "Inventory", icon: <ClipboardCheck size={20} />, roles: ["staff"] },
  { href: "/staff/transport", label: "Transport", icon: <Bus size={20} />, roles: ["staff"] },
  { href: "/staff/hostel", label: "Hostel", icon: <Building2 size={20} />, roles: ["staff"] },

  // General
  { href: "/settings", label: "Settings", icon: <Settings size={20} />, roles: ["student", "faculty", "admin", "parent", "staff"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) return null

  const filteredNavItems = navItems.filter((item) => item.roles.includes(user.role))

  return (
    <div className="h-screen w-64 border-r border-border bg-sidebar flex flex-col sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">NU</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">Nova University</h1>
            <p className="text-xs text-muted-foreground mt-1">ERP System</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredNavItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-3 mb-1", pathname === item.href && "bg-sidebar-accent")}
            >
              {item.icon}
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-primary font-bold">{user.full_name[0]}</span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user.full_name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </div>
  )
}
