"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Users, BookOpen, TrendingUp, Award, Calendar, MessageSquare } from "lucide-react"

export default function FacultyDashboardPage() {
  const { user } = useAuth()

  if (!user || user.role !== "faculty") {
    return null
  }

  return (
    <ProtectedRoute>
      <FacultyDashboardContent />
    </ProtectedRoute>
  )
}

function FacultyDashboardContent() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/faculty/dashboard')
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

    if (user?.role === 'faculty') {
      fetchStats()
    }
  }, [user])

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>
  }

  if (!stats) {
    return <div className="p-8 text-center text-red-500">Failed to load dashboard data.</div>
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Faculty Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.full_name}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-3xl font-bold text-primary mt-2">{stats.totalStudents || 0}</p>
            </div>
            <Users className="text-primary/20" size={40} />
          </div>
        </Card>

        <Card className="p-6 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Courses Teaching</p>
              <p className="text-3xl font-bold text-accent mt-2">{stats.coursesTeaching || 0}</p>
            </div>
            <BookOpen className="text-accent/20" size={40} />
          </div>
        </Card>

        <Card className="p-6 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Class Rating</p>
              <p className="text-3xl font-bold text-secondary mt-2">{stats.avgClassRating || 0}/5</p>
            </div>
            <Award className="text-secondary/20" size={40} />
          </div>
        </Card>

        <Card className="p-6 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
              <p className="text-3xl font-bold text-destructive mt-2">{stats.pendingTasks || 0}</p>
            </div>
            <Calendar className="text-destructive/20" size={40} />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="performance">Performance Trends</TabsTrigger>
          <TabsTrigger value="analytics">Student Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card className="p-6 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Course Activity & Grading Trends</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={stats.performanceData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis stroke="var(--color-muted-foreground)" dataKey="month" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="students"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  name="Enrolled"
                />
                <Line type="monotone" dataKey="graded" stroke="var(--color-accent)" strokeWidth={2} name="Graded" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 border border-border/50">
              <h3 className="font-semibold text-foreground mb-4">Student Distribution Across Courses</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.courseDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.courseDistribution?.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 border border-border/50">
              <h3 className="font-semibold text-foreground mb-4">Grade Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.studentPerformance || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis stroke="var(--color-muted-foreground)" dataKey="grade" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                  />
                  <Bar dataKey="count" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <Button className="w-full gap-2 bg-primary/10 text-primary hover:bg-primary/20">
            <BookOpen size={18} />
            Mark Attendance
          </Button>
          <Button className="w-full gap-2 bg-accent/10 text-accent hover:bg-accent/20">
            <TrendingUp size={18} />
            Enter Grades
          </Button>
          <Button className="w-full gap-2 bg-secondary/10 text-secondary hover:bg-secondary/20">
            <MessageSquare size={18} />
            Send Announcement
          </Button>
          <Button className="w-full gap-2 bg-destructive/10 text-destructive hover:bg-destructive/20">
            <Award size={18} />
            View Reports
          </Button>
        </div>
      </Card>

      {/* Recent Activities */}
      <Card className="p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {[
            { time: "2 hours ago", action: "Submitted grades for CSE201 (48 students)" },
            { time: "5 hours ago", action: "Marked attendance for Advanced Algorithms" },
            { time: "Yesterday", action: "Posted assignment for Database Systems" },
            { time: "2 days ago", action: "Student feedback received: Average rating 4.5/5" },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-4 pb-3 border-b border-border/50 last:border-0">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{item.time}</p>
                <p className="text-sm font-medium text-foreground">{item.action}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

