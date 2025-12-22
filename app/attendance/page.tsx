"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { AlertCircle, TrendingUp } from "lucide-react"

export default function AttendancePage() {
  const { user } = useAuth()

  if (!user || !['student', 'faculty', 'admin'].includes(user.role)) {
    return null
  }

  return (
    <ProtectedRoute>
      <AttendanceContent />
    </ProtectedRoute>
  )
}

function AttendanceContent() {
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [courseAttendance, setCourseAttendance] = useState<any[]>([])
  const [overallPercentage, setOverallPercentage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/attendance/student?t=' + Date.now()) // Cache bust
        if (res.ok) {
          const data = await res.json()

          // Process course data
          const courses = data.courses.map((c: any) => ({
            code: c.course_code,
            name: c.course_name,
            lectures: parseInt(c.total_lectures),
            attended: parseInt(c.present_count),
            percentage: Math.round((parseInt(c.present_count) / parseInt(c.total_lectures)) * 100) || 0
          }))
          setCourseAttendance(courses)

          // Calculate overall
          const totalLectures = courses.reduce((sum: number, c: any) => sum + c.lectures, 0)
          const totalAttended = courses.reduce((sum: number, c: any) => sum + c.attended, 0)
          setOverallPercentage(totalLectures > 0 ? Math.round((totalAttended / totalLectures) * 100) : 0)

          // Process history for chart (group by date)
          // This is a simplified view, real chart might need more processing
          const history = data.history.slice(0, 5).reverse().map((h: any) => ({
            date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            present: h.status === 'present' ? 1 : 0,
            absent: h.status === 'absent' ? 1 : 0,
            leave: h.status === 'leave' ? 1 : 0
          }))
          // Aggregate by date if multiple classes on same day
          const aggHistory = Object.values(history.reduce((acc: any, curr: any) => {
            if (!acc[curr.date]) acc[curr.date] = { date: curr.date, present: 0, absent: 0, leave: 0 }
            acc[curr.date].present += curr.present
            acc[curr.date].absent += curr.absent
            acc[curr.date].leave += curr.leave
            return acc
          }, {}))
          setAttendanceData(aggHistory as any[])
        }
      } catch (error) {
        console.error("Failed to fetch attendance", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return { status: "Excellent", color: "text-green-600" }
    if (percentage >= 75) return { status: "Good", color: "text-blue-600" }
    if (percentage >= 65) return { status: "Warning", color: "text-yellow-600" }
    return { status: "Critical", color: "text-red-600" }
  }

  if (loading) return <div className="p-8 text-center">Loading attendance...</div>

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Attendance Register</h1>
        <p className="text-muted-foreground mt-2">Track and monitor your class attendance</p>
      </div>

      {/* Overall Attendance */}
      <Card className="p-8 border border-border/50 bg-linear-to-r from-primary/5 to-secondary/5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Overall Attendance</p>
            <p className="text-4xl font-bold text-foreground">{overallPercentage}%</p>
            <p className={`text-sm font-medium mt-2 ${getAttendanceStatus(overallPercentage).color}`}>
              {getAttendanceStatus(overallPercentage).status}
            </p>
          </div>
          <div>
            {overallPercentage >= 75 ? (
              <TrendingUp className="text-green-600" size={48} />
            ) : (
              <AlertCircle className="text-red-600" size={48} />
            )}
          </div>
        </div>
      </Card>

      {/* Attendance Trend Chart */}
      <Card className="p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">Attendance Trend (Recent)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
              labelStyle={{ color: "var(--color-foreground)" }}
            />
            <Legend />
            <Bar dataKey="present" fill="var(--color-primary)" name="Present" />
            <Bar dataKey="absent" fill="var(--color-destructive)" name="Absent" />
            <Bar dataKey="leave" fill="var(--color-accent)" name="Leave" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Course-wise Attendance */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Course-wise Attendance</h2>
        <div className="space-y-3">
          {courseAttendance.length === 0 && (
            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
              No attendance records found.
            </div>
          )}
          {courseAttendance.map((course) => {
            const status = getAttendanceStatus(course.percentage)
            return (
              <Card key={course.code} className="p-4 border border-border/50 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-mono font-semibold text-primary">{course.code}</p>
                    <p className="font-medium text-foreground mt-1">{course.name}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${status.color}`}>{course.percentage}%</p>
                    <p className={`text-xs font-medium ${status.color}`}>{status.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${course.percentage}%` }} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {course.attended}/{course.lectures}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
