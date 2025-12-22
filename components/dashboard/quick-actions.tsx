"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Users, BookOpen, DollarSign, Home, ClipboardList, GraduationCap, Calendar, Briefcase, LayoutDashboard, Settings } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const studentActions = [
  { icon: BookOpen, label: "Register Courses", href: "/course-registration", color: "bg-blue-500/10" },
  { icon: ClipboardList, label: "Check Attendance", href: "/student/attendance", color: "bg-green-500/10" },
  { icon: FileText, label: "View Marksheet", href: "/marksheet", color: "bg-purple-500/10" },
  { icon: DollarSign, label: "Pay Fees", href: "/fees", color: "bg-orange-500/10" },
  { icon: Home, label: "Hostel Info", href: "/hostel", color: "bg-red-500/10" },
  { icon: Users, label: "My Profile", href: "/students/profile", color: "bg-teal-500/10" },
]

const facultyActions = [
  { icon: ClipboardList, label: "Mark Attendance", href: "/faculty/attendance-marking", color: "bg-blue-500/10" },
  { icon: GraduationCap, label: "Enter Grades", href: "/faculty/grading", color: "bg-green-500/10" },
  { icon: Calendar, label: "View Timetable", href: "/timetable", color: "bg-purple-500/10" },
  { icon: LayoutDashboard, label: "Faculty Dashboard", href: "/faculty/dashboard", color: "bg-orange-500/10" },
]

const adminActions = [
  { icon: Users, label: "Manage Users", href: "/admin/users", color: "bg-blue-500/10" },
  { icon: BookOpen, label: "Manage Courses", href: "/admin/courses", color: "bg-green-500/10" },
  { icon: Briefcase, label: "Manage Faculty", href: "/admin/faculty", color: "bg-purple-500/10" },
  { icon: Calendar, label: "Timetable", href: "/admin/timetable", color: "bg-orange-500/10" },
  { icon: FileText, label: "Exams", href: "/admin/exams", color: "bg-red-500/10" },
  { icon: Settings, label: "Departments", href: "/admin/departments", color: "bg-teal-500/10" },
]

export function QuickActions() {
  const { user } = useAuth()

  if (!user) return null

  let actions = studentActions
  if (user.role === 'faculty') actions = facultyActions
  if (user.role === 'admin') actions = adminActions

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Button
              variant="outline"
              className="w-full h-auto py-4 flex flex-col items-center gap-2 bg-transparent hover:bg-accent/50"
              aria-label={action.label}
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs text-center">{action.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </Card>
  )
}
