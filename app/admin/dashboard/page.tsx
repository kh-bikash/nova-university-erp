"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

function AdminDashboardContent() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard')
        const data = await res.json()
        if (data.success) {
          setStats(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error)
      } finally {
        setLoading(false)
      }
    }

    if (user?.role === 'admin') {
      fetchStats()
    }
  }, [user])

  if (!user || user.role !== "admin") {
    return null
  }

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>
  }

  if (!stats) {
    return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">University-wide analytics and management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Students</p>
          <p className="text-3xl font-bold text-foreground mt-2">{stats.totalStudents?.toLocaleString() || 0}</p>
          <p className="text-xs text-muted-foreground mt-3">Across all departments</p>
        </Card>

        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Faculty Members</p>
          <p className="text-3xl font-bold text-primary mt-2">{stats.totalFaculty || 0}</p>
          <p className="text-xs text-muted-foreground mt-3">Teaching staff</p>
        </Card>

        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Courses</p>
          <p className="text-3xl font-bold text-accent mt-2">{stats.totalCourses || 0}</p>
          <p className="text-xs text-muted-foreground mt-3">Offered this semester</p>
        </Card>

        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Hostel Occupancy</p>
          <p className="text-3xl font-bold text-secondary mt-2">
            {stats.hostelOccupancy || 0}/{stats.hostelCapacity || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            {stats.hostelCapacity ? Math.round((stats.hostelOccupancy / stats.hostelCapacity) * 100) : 0}% occupied
          </p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-border/50">
          <h3 className="font-semibold text-foreground mb-4">Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.enrollmentTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis stroke="var(--color-muted-foreground)" />
              <YAxis stroke="var(--color-muted-foreground)" />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                labelStyle={{ color: "var(--color-foreground)" }}
              />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="var(--color-primary)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 border border-border/50">
          <h3 className="font-semibold text-foreground mb-4">Students by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.departmentStats || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.departmentStats?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* System Health */}
      <Card className="p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">System Health Metrics</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Average Attendance</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${stats.averageAttendance || 0}%` }} />
              </div>
              <p className="font-bold text-foreground">{stats.averageAttendance || 0}%</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">Average GPA</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${((stats.averageGPA || 0) / 4) * 100}%` }} />
              </div>
              <p className="font-bold text-foreground">{stats.averageGPA || 0}/4.0</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">System Status</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-3 h-3 rounded-full bg-green-600 animate-pulse" />
              <p className="font-bold text-green-600">All Systems Operational</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
