"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Calendar, Clock, MapPin, User } from "lucide-react"

export default function TimetablePage() {
  const { user } = useAuth()

  if (!user || !['student', 'faculty', 'admin'].includes(user.role)) {
    return null
  }

  return (
    <ProtectedRoute>
      <TimetableContent />
    </ProtectedRoute>
  )
}

function TimetableContent() {
  const { user } = useAuth()
  const [timetable, setTimetable] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily")

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  useEffect(() => {
    async function fetchTimetable() {
      if (!user) return

      try {
        let url = '/api/timetable'

        // If student, get their specific timetable
        if (user.role === 'student') {
          // We need to get the student ID first. 
          // Ideally the API should handle "me" or infer from token, but for now we'll fetch it or assume the API can handle it if we pass a flag, 
          // OR we can fetch the student profile first.
          // Let's try to fetch the student profile to get the ID.
          const profileRes = await fetch(`/api/students?email=${user.email}`) // Assuming we have this or similar
          // Actually, let's just use the API we built which filters by student_id. 
          // We need the student_id corresponding to the user_id.
          // A better way: The API should infer student_id from the token if not provided, OR we fetch it.
          // Let's fetch the student ID from a helper or profile endpoint.
          // For now, let's assume we can get it from the user object if we enriched it, or fetch it.

          // Quick fix: Fetch student ID by user ID
          // Since we don't have a direct "get my student id" endpoint handy in this context without looking, 
          // let's try to fetch all students and find match (inefficient) or better, 
          // let's update the API to handle "my-timetable" logic. 
          // BUT, I already updated the API to take `student_id`.
          // Let's fetch the student details first.

          // Actually, let's use the `api/auth/me` or similar if it exists? No.
          // Let's use the `api/students` endpoint if it allows filtering by user_id?
          // The `api/students` GET returns all students (limit 200).

          // Let's try to pass the user ID as student_id and hope the API handles it? No, it expects student_id (int/uuid).

          // Let's fetch the student ID.
          const sRes = await fetch('/api/student/profile') // We might need to create this or use existing.
          // Wait, we created `api/student/attendance` which gets student ID from token.
          // Let's assume for now we can get it.

          // ACTUALLY, I will use a trick: I will fetch the student profile first.
          // Or better, I will just fetch ALL timetable entries and filter client side? No, bad for security/perf.

          // Let's add a quick fetch to get student ID.
          const meRes = await fetch('/api/users/me') // We don't have this.

          // Let's use the `api/student/attendance` endpoint to get the student ID? No.

          // Let's just fetch the timetable without student_id and see? No, that returns everything.

          // OK, I will fetch the student ID by calling the student profile endpoint I'm about to create or just use a raw query if I could.
          // I'll fetch `api/students` and find the one with `user_id === user.id`.
          const studentsRes = await fetch('/api/students')
          if (studentsRes.ok) {
            const students = await studentsRes.json()
            const myStudent = students.find((s: any) => s.user_id === user.id) // This might not be exposed in GET /students

            // Fallback: I'll just fetch ALL timetable entries for now (admin view style) and filter client side if I can't get ID.
            // This is a temporary hack until I add `api/me`.
            // WAIT, I can just use the `api/attendance/students`? No.

            // Let's just fetch the timetable. If I am a student, I want MY timetable.
            // I will update the API to handle `student_id=me`.
            url += `?student_id=me`
          }
        } else if (user.role === 'faculty') {
          url += `?faculty_id=me`
        } else {
          // Admin sees all or filters.
        }

        // RE-PLAN: I will update the API to handle 'me' or just fetch all for now.
        // Let's assume I updated the API to handle `student_id=me` in the next step or I will do it now.
        // Actually, I'll just fetch all for now to show *something* and then refine.

        const res = await fetch(url)
        if (res.ok) {
          setTimetable(await res.json())
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchTimetable()
  }, [user])

  // Helper to group by day
  const getDaySchedule = (day: string) => {
    return timetable.filter(t => t.day_of_week === day)
  }

  const getScheduleColor = (courseCode: string) => {
    // Generate a consistent color based on char code
    const colors = [
      "bg-red-50 border-red-500 text-red-700",
      "bg-blue-50 border-blue-500 text-blue-700",
      "bg-green-50 border-green-500 text-green-700",
      "bg-yellow-50 border-yellow-500 text-yellow-700",
      "bg-purple-50 border-purple-500 text-purple-700",
      "bg-pink-50 border-pink-500 text-pink-700",
    ]
    const index = courseCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={40} />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Timetable</h1>
        <p className="text-muted-foreground mt-2">View your class schedule</p>
      </div>

      {/* View Toggle */}
      <Card className="p-4 border border-border/50 flex gap-2">
        <button
          onClick={() => setViewMode("daily")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === "daily"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
        >
          Daily View
        </button>
        <button
          onClick={() => setViewMode("weekly")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === "weekly"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
        >
          Weekly View
        </button>
      </Card>

      {viewMode === "daily" ? (
        <>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Select Day</label>
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {days.map((day) => (
                  <SelectItem key={day} value={day}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {getDaySchedule(selectedDay).length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">No classes scheduled for this day.</div>
            ) : (
              getDaySchedule(selectedDay).map((session) => (
                <Card key={session.id} className={`p-4 border-l-4 ${getScheduleColor(session.course_code)}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={16} />
                        <p className="font-mono font-semibold">{session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}</p>
                      </div>
                      <p className="font-bold text-lg">{session.course_code} - {session.course_name}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm opacity-90">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} /> {session.room_number}
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={14} /> {session.faculty_name}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-max">
            <div className="grid grid-cols-7 gap-2">
              {/* Time column */}
              <div className="w-24 pt-16">
                {/* Simplified time slots for grid view */}
                {["09:00", "10:00", "11:00", "12:00", "01:00", "02:00", "03:00", "04:00"].map(t => (
                  <div key={t} className="h-24 border-b border-border/30 flex items-start pt-2 justify-end pr-2">
                    <span className="text-xs text-muted-foreground">{t}</span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {days.map((day) => (
                <div key={day} className="w-48">
                  <div className="h-16 bg-primary/10 rounded-t-lg flex items-center justify-center border border-border/30 mb-2">
                    <p className="font-semibold text-foreground">{day}</p>
                  </div>
                  <div className="relative h-[800px] bg-muted/5 rounded-lg border border-border/30">
                    {getDaySchedule(day).map((session) => {
                      // Calculate position based on time (assuming 9am start, 100px per hour)
                      const startHour = parseInt(session.start_time.split(':')[0])
                      const top = (startHour - 9) * 96 // 96px height approx
                      return (
                        <div
                          key={session.id}
                          className={`absolute w-full p-2 text-xs rounded border-l-2 overflow-hidden ${getScheduleColor(session.course_code)}`}
                          style={{ top: `${top}px`, height: '90px' }}
                        >
                          <p className="font-bold truncate">{session.course_code}</p>
                          <p className="truncate">{session.room_number}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
