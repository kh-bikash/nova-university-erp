"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CourseRegistrationPage() {
  const { user } = useAuth()

  // Allow admins to test this page too, or students
  if (!user || !['student', 'admin'].includes(user.role)) {
    return null
  }

  return (
    <ProtectedRoute>
      <CourseRegistrationContent user={user} />
    </ProtectedRoute>
  )
}

function CourseRegistrationContent({ user }: { user: any }) {
  const { toast } = useToast()
  const [availableCourses, setAvailableCourses] = useState<any[]>([])
  const [registeredCourses, setRegisteredCourses] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  // For admin testing, we might need a way to select a student, but for now let's assume
  // if admin is logged in, they are viewing as a "test student" or we need to fetch a student ID.
  // Since we don't have a "switch user" feature easily, let's just fetch the current user's student profile if they are a student.
  // If admin, we might need to pick a student. For simplicity, let's assume the user IS the student for now.
  // But wait, admins don't have student_id in the students table usually.
  // Let's fetch the student profile associated with the user.

  const [studentId, setStudentId] = useState<string | null>(null)

  const fetchData = async (sid: string | null) => {
    setLoading(true)
    try {
      // Fetch Courses (Always)
      const coursesRes = await fetch('/api/courses', { cache: 'no-store' })
      if (coursesRes.ok) {
        const json = await coursesRes.json()
        const data = json.data || (Array.isArray(json) ? json : [])
        setAvailableCourses(data.map((c: any) => ({
          id: c.id,
          code: c.course_code,
          name: c.course_name,
          credits: c.credits,
          faculty: c.faculty_name || "Unassigned",
          available: (c.enrolled_count || 0) < (c.max_students || 60)
        })))
      }

      // Fetch Enrollments (If student ID exists)
      if (sid) {
        const enrolledRes = await fetch(`/api/enrollment?student_id=${sid}`, { cache: 'no-store' })
        if (enrolledRes.ok) {
          setRegisteredCourses(await enrolledRes.json())
        }
      }
    } catch (e) {
      console.error("Data fetch error:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        // 1. Fetch Student Profile
        let sid = null
        if (user.role === 'student') {
          const res = await fetch('/api/student/profile')
          if (res.ok) {
            const me = await res.json()
            if (me) sid = me.id
          }
        } else if (user.role === 'admin') {
          const res = await fetch('/api/students')
          if (res.ok) {
            const response = await res.json()
            const students = Array.isArray(response) ? response : (response.data || [])
            if (students.length > 0) sid = students[0].id
          }
        }

        setStudentId(sid)
        await fetchData(sid)

      } catch (e) {
        console.error("Initialization error:", e)
        setLoading(false)
      }
    }

    init()
  }, [user])

  // Removed separate useEffect for studentId to avoid race conditions

  const totalCredits = registeredCourses.reduce((sum, course) => sum + course.credits, 0)
  const maxCredits = 18

  const handleRegister = async (course: any) => {
    if (!studentId) {
      alert("Error: Student ID is missing. Please refresh the page.")
      return
    }

    try {
      // alert(`Attempting to register for Course ${course.id} with Student ${studentId}`)

      const res = await fetch('/api/enrollment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, course_id: course.id })
      })

      if (res.ok) {
        const data = await res.json()
        // alert("Registration Successful!")
        toast({ title: "Success", description: "Course registered successfully" })

        if (data.course) {
          setRegisteredCourses(prev => [...prev, data.course])
        } else {
          fetchData(studentId)
        }
      } else {
        const err = await res.json()
        alert(`Registration Failed: ${err.error}`)
        toast({ title: "Error", description: err.error, variant: "destructive" })
      }
    } catch (error: any) {
      alert(`System Error: ${error.message}`)
      toast({ title: "Error", description: "Failed to register", variant: "destructive" })
    }
  }

  const handleUnregister = async (courseId: string) => {
    if (!studentId) return

    try {
      const res = await fetch(`/api/enrollment?student_id=${studentId}&course_id=${courseId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast({ title: "Success", description: "Course dropped successfully" })
        fetchData(studentId)
      } else {
        toast({ title: "Error", description: "Failed to drop course", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to drop course", variant: "destructive" })
    }
  }

  const canRegisterMore = totalCredits < maxCredits

  if (!studentId && !loading) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-500 font-medium">No student profile found.</div>
        <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md text-left inline-block">
          <p><strong>Debug Info:</strong></p>
          <p>User ID: {user?.id}</p>
          <p>User Role: {user?.role}</p>
          <p>Student ID: {studentId || 'null'}</p>
          <p>Loading: {loading ? 'true' : 'false'}</p>
        </div>
        <p>Please log in as a student or contact support.</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Course Registration</h1>
        <p className="text-muted-foreground mt-2">Register courses for the current semester</p>
        {user.role === 'admin' && <p className="text-xs text-amber-500 mt-1">Admin Mode: Viewing as student ID {studentId}</p>}
      </div>

      {/* Credit Status */}
      <Card className="p-6 border border-border/50 bg-linear-to-r from-primary/5 to-secondary/5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Credits Registered</p>
            <p className="text-3xl font-bold text-foreground">
              {totalCredits}/{maxCredits}
            </p>
          </div>
          <div className="w-32 h-12 bg-muted rounded-lg flex items-center justify-center relative">
            <div
              className="w-full h-full bg-primary rounded-lg"
              style={{ width: `${Math.min((totalCredits / maxCredits) * 100, 100)}%` }}
            />
            <p className="absolute font-bold text-primary-foreground text-sm">
              {Math.round((totalCredits / maxCredits) * 100)}%
            </p>
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Available Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">Available Courses</h2>
            <div className="relative mb-4">
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            {availableCourses.length === 0 && !loading && (
              <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground">
                No courses found. (Debug: {availableCourses.length} courses loaded)
              </div>
            )}
            {availableCourses
              .filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase()) || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((course) => (
                <Card key={course.id} className="p-4 border border-border/50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-mono font-semibold text-primary">{course.code}</p>
                      <p className="font-semibold text-foreground mt-1">{course.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {course.faculty} • {course.credits} Credits
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRegister(course)}
                      disabled={
                        !course.available || (registeredCourses.find((c) => c.id === course.id) ? true : !canRegisterMore)
                      }
                      className="bg-primary hover:bg-primary/90"
                    >
                      {registeredCourses.find((c) => c.id === course.id) ? "Registered" : "Register"}
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        </div>

        {/* Registered Courses */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Courses</h2>
          <Card className="p-6 border border-border/50 space-y-4">
            {registeredCourses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No courses registered</p>
            ) : (
              <>
                <div className="space-y-3">
                  {registeredCourses.map((course) => (
                    <div key={course.id} className="p-3 bg-card rounded-lg border border-border/30">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-foreground text-sm">{course.code}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnregister(course.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">{course.name}</p>
                      <p className="text-xs text-primary font-semibold mt-1">{course.credits} Credits</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-border/30">
                  <p className="text-sm text-muted-foreground">Total: {totalCredits} credits</p>
                  {totalCredits >= maxCredits && (
                    <p className="text-xs text-destructive mt-2">Maximum credits reached</p>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
