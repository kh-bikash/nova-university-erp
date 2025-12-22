"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { DataExport } from "@/components/export/data-export"



function DashboardContent() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>({
    totalCourses: 0,
    attendancePercentage: 0,
    currentGPA: 0,
    pendingFees: 0,
    hostelStatus: "Not Allocated",
    attendanceTrend: [],
    gpaData: []
  })

  // Start with effect to handle potential null user gracefully or redirection
  // Ideally ProtectedRoute handles this, but Typescript doesn't know.
  if (!user) return null;

  useEffect(() => {
    if (user.role === 'student') {
      fetch('/api/student/dashboard')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStats(data.data)
          }
        })
        .catch(err => console.error("Student dashboard fetch error:", err))
    } else if (user.role === 'faculty') {
      fetch('/api/faculty/dashboard')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStats(data.data)
          }
        })
        .catch(err => console.error("Faculty dashboard fetch error:", err))
    } else if (user.role === 'admin') {
      fetch('/api/admin/dashboard')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStats(data.data)
          }
        })
        .catch(err => console.error("Admin dashboard fetch error:", err))
    } else if (user.role === 'parent') {
      // Redirect parent to their specific dashboard
      window.location.href = "/parent/dashboard"
    }
  }, [user])

  const dashboardData = stats

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header with export */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Welcome, {user.full_name}!</h1>
          <p className="text-muted-foreground mt-2">
            {user.role === "student" && "Here is your academic dashboard"}
            {user.role === "faculty" && "Here are your teaching analytics"}
            {user.role === "admin" && "Here is the system overview"}
          </p>
        </div>
        <DataExport />
      </div>

      {/* Quick Actions - New Section */}
      <QuickActions />

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {user.role === 'student' && (
          <>
            <Card className="p-6 border border-border/50">
              <p className="text-muted-foreground text-sm font-medium">Total Courses</p>
              <p className="text-3xl font-bold text-foreground mt-2">{dashboardData.totalCourses || 0}</p>
              <p className="text-xs text-muted-foreground mt-3">This semester</p>
            </Card>

            <Card className="p-6 border border-border/50">
              <p className="text-muted-foreground text-sm font-medium">Attendance</p>
              <p className="text-3xl font-bold text-foreground mt-2">{dashboardData.attendancePercentage || 0}%</p>
              <p className="text-xs text-muted-foreground mt-3">Last 5 weeks</p>
            </Card>

            <Card className="p-6 border border-border/50">
              <p className="text-muted-foreground text-sm font-medium">Current GPA</p>
              <p className="text-3xl font-bold text-foreground mt-2">{dashboardData.currentGPA || 0}</p>
              <p className="text-xs text-muted-foreground mt-3">Cumulative average</p>
            </Card>

            <Card className="p-6 border border-border/50">
              <p className="text-muted-foreground text-sm font-medium">Pending Fees</p>
              <p className="text-3xl font-bold text-destructive mt-2">{dashboardData.pendingFees || 0}</p>
              <p className="text-xs text-muted-foreground mt-3">Payment due</p>
            </Card>

            <Card className="p-6 border border-border/50">
              <p className="text-muted-foreground text-sm font-medium">Hostel Status</p>
              <p className="text-lg font-bold text-accent mt-2">{dashboardData.hostelStatus || 'N/A'}</p>
              <p className="text-xs text-muted-foreground mt-3">Room allocation</p>
            </Card>
          </>
        )}

        {user.role === 'admin' && (
          <>
            <Card className="p-6 border border-border/50">
              <p className="text-muted-foreground text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold text-foreground mt-2">{dashboardData.totalStudents || 0}</p>
              <p className="text-xs text-muted-foreground mt-3">Active enrollments</p>
            </Card>
            <Card className="p-6 border border-border/50">
              <p className="text-muted-foreground text-sm font-medium">Total Faculty</p>
              <p className="text-3xl font-bold text-foreground mt-2">{dashboardData.totalFaculty || 0}</p>
              <p className="text-xs text-muted-foreground mt-3">Active staff</p>
            </Card>
            <Card className="p-6 border border-border/50">
              <p className="text-muted-foreground text-sm font-medium">Departments</p>
              <p className="text-3xl font-bold text-foreground mt-2">{dashboardData.departmentStats?.length || 0}</p>
              <p className="text-xs text-muted-foreground mt-3">Across campus</p>
            </Card>
          </>
        )}

        {user.role === 'faculty' && (
          <>
            <Card className="p-6 border border-border/50">
              <p className="text-muted-foreground text-sm font-medium">Assigned Courses</p>
              <p className="text-3xl font-bold text-foreground mt-2">{dashboardData.coursesTeaching || 0}</p>
              <p className="text-xs text-muted-foreground mt-3">Current semester</p>
            </Card>
            <Card className="p-6 border border-border/50">
              <p className="text-muted-foreground text-sm font-medium">Total Students</p>
              <p className="text-3xl font-bold text-foreground mt-2">{dashboardData.totalStudents || 0}</p>
              <p className="text-xs text-muted-foreground mt-3">Across all courses</p>
            </Card>
            <Card className="p-6 border border-border/50">
              <p className="text-muted-foreground text-sm font-medium">Pending Tasks</p>
              <p className="text-3xl font-bold text-destructive mt-2">{dashboardData.pendingTasks || 0}</p>
              <p className="text-xs text-muted-foreground mt-3">Grading & Attendance</p>
            </Card>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-border/50">
          <h3 className="font-semibold text-foreground mb-4">
            {user.role === 'faculty' ? 'Student Attendance Trends' : 'Attendance Trend'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dashboardData.attendanceTrend || dashboardData.performanceData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={user.role === 'faculty' ? "students" : "attendance"}
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ fill: "var(--color-primary)" }}
                name={user.role === 'faculty' ? "Present Students" : "Attendance %"}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border border-border/50">
          <h3 className="font-semibold text-foreground mb-4">
            {user.role === 'faculty' ? 'Grade Distribution' : 'GPA Progress'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={user.role === 'faculty' ? (dashboardData.studentPerformance || []) : (dashboardData.gpaData || [])}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey={user.role === 'faculty' ? "grade" : "name"} stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              <Legend />
              <Bar
                dataKey={user.role === 'faculty' ? "count" : "gpa"}
                fill="var(--color-accent)"
                name={user.role === 'faculty' ? "Students" : "GPA"}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
