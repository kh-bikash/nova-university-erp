"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts"
import { BookOpen, Clock, GraduationCap, Calendar, FileText, AlertCircle } from "lucide-react"

export default function StudentDashboardPage() {
    const { user } = useAuth()

    if (!user || user.role !== "student") {
        return null
    }

    return (
        <ProtectedRoute>
            <StudentDashboardContent />
        </ProtectedRoute>
    )
}

function StudentDashboardContent() {
    const { user } = useAuth()
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/student/dashboard')
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

        if (user?.role === 'student') {
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
                <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back, {user?.full_name}</p>
            </div>

            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 border border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                            <p className="text-3xl font-bold text-primary mt-2">{stats.enrolledCourses || 0}</p>
                        </div>
                        <BookOpen className="text-primary/20" size={40} />
                    </div>
                </Card>

                <Card className="p-6 border border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Attendance</p>
                            <p className="text-3xl font-bold text-accent mt-2">{stats.attendancePercentage || 0}%</p>
                        </div>
                        <Clock className="text-accent/20" size={40} />
                    </div>
                </Card>

                <Card className="p-6 border border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">CGPA</p>
                            <p className="text-3xl font-bold text-secondary mt-2">{stats.cgpa || 0}</p>
                        </div>
                        <GraduationCap className="text-secondary/20" size={40} />
                    </div>
                </Card>

                <Card className="p-6 border border-border/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Pending Assignments</p>
                            <p className="text-3xl font-bold text-destructive mt-2">{stats.pendingAssignments || 0}</p>
                        </div>
                        <AlertCircle className="text-destructive/20" size={40} />
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Attendance Trend */}
                <Card className="p-6 border border-border/50 lg:col-span-2">
                    <h3 className="font-semibold text-foreground mb-4">Attendance Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats.attendanceTrend || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis stroke="var(--color-muted-foreground)" dataKey="month" />
                            <YAxis stroke="var(--color-muted-foreground)" />
                            <Tooltip
                                contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="percentage"
                                stroke="var(--color-accent)"
                                strokeWidth={2}
                                name="Attendance %"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Upcoming Exams */}
                <Card className="p-6 border border-border/50">
                    <h3 className="font-semibold text-foreground mb-4">Upcoming Exams</h3>
                    <div className="space-y-4">
                        {stats.upcomingExams?.map((exam: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0">
                                <Calendar className="text-primary mt-1" size={18} />
                                <div>
                                    <p className="font-medium text-foreground">{exam.subject}</p>
                                    <p className="text-sm text-muted-foreground">{exam.date} at {exam.time}</p>
                                </div>
                            </div>
                        ))}
                        {(!stats.upcomingExams || stats.upcomingExams.length === 0) && (
                            <p className="text-muted-foreground text-sm">No upcoming exams.</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Recent Grades */}
            <Card className="p-6 border border-border/50">
                <h3 className="font-semibold text-foreground mb-4">Recent Grades</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.recentGrades?.map((grade: any, idx: number) => (
                        <div key={idx} className="p-4 bg-muted/50 rounded-lg border border-border/50">
                            <div className="flex justify-between items-start mb-2">
                                <FileText className="text-primary" size={20} />
                                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-bold">{grade.grade}</span>
                            </div>
                            <p className="font-medium text-foreground">{grade.subject}</p>
                            <p className="text-sm text-muted-foreground">Score: {grade.score}/100</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    )
}
