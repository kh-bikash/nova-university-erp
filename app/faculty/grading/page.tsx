"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const studentGrades = [
  { id: "1", enrollment: "KL2023001", name: "Aarav Kumar", internal: 28, external: 68 },
  { id: "2", enrollment: "KL2023002", name: "Ananya Sharma", internal: 26, external: 64 },
  { id: "3", enrollment: "KL2023003", name: "Rajesh Patel", internal: 22, external: 58 },
  { id: "4", enrollment: "KL2023004", name: "Priya Singh", internal: 27, external: 66 },
  { id: "5", enrollment: "KL2023005", name: "Vikram Desai", internal: 25, external: 62 },
]

const getLetterGrade = (total: number) => {
  if (total >= 90) return "A"
  if (total >= 80) return "B+"
  if (total >= 70) return "B"
  if (total >= 60) return "C+"
  if (total >= 50) return "C"
  return "F"
}

const getGradePoints = (letterGrade: string) => {
  const mapping: Record<string, number> = {
    A: 4.0,
    "B+": 3.5,
    B: 3.0,
    "C+": 2.5,
    C: 2.0,
    F: 0.0,
  }
  return mapping[letterGrade] || 0
}

export default function GradingPage() {
  const { toast } = useToast() // Assuming useToast is available or imported
  const [grades, setGrades] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [publishMode, setPublishMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Fetch Courses
  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/attendance/courses') // Reusing attendance courses API
        if (res.ok) {
          const data = await res.json()
          setCourses(data)
          if (data.length > 0) setSelectedCourse(data[0].course_code)
        }
      } catch (error) {
        console.error("Failed to fetch courses", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  // Fetch Students/Grades
  useEffect(() => {
    if (!selectedCourse) return

    async function fetchStudents() {
      setLoading(true)
      try {
        const res = await fetch(`/api/faculty/grading/students?course_code=${selectedCourse}`)
        if (res.ok) {
          const data = await res.json()
          // Map API data to component state
          setGrades(data.map((s: any) => ({
            id: s.id,
            enrollment: s.enrollment,
            name: s.name,
            internal: s.internal || 0,
            external: s.external || 0
          })))
        }
      } catch (error) {
        console.error("Failed to fetch students", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [selectedCourse])

  const handleGradeChange = (studentId: string, field: "internal" | "external", value: string) => {
    setGrades(grades.map((g) => (g.id === studentId ? { ...g, [field]: Number.parseFloat(value) || 0 } : g)))
  }

  const calculateTotal = (internal: number, external: number) => internal + external

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/faculty/grading/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_code: selectedCourse,
          grades: grades.map(g => ({
            id: g.id,
            internal: g.internal,
            external: g.external
          }))
        })
      })

      if (res.ok) {
        // Success toast
        alert("Grades submitted successfully!")
        setPublishMode(false)
      } else {
        alert("Failed to submit grades")
      }
    } catch (error) {
      console.error("Submit error", error)
      alert("Error submitting grades")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading && courses.length === 0) return <div className="p-8">Loading...</div>

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Grade Entry & Management</h1>
        <p className="text-muted-foreground mt-2">Enter and manage student grades for your courses</p>
      </div>

      {/* Select Course */}
      <Card className="p-6 border border-border/50">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Select Course</label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.id} value={c.course_code}>{c.course_code} - {c.course_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={() => setPublishMode(!publishMode)} variant={publishMode ? "default" : "outline"}>
              {publishMode ? "View Mode" : "Edit Grades"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Grading Table */}
      <Card className="p-6 border border-border/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enrollment</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Internal Marks (30)</TableHead>
                <TableHead>External Marks (70)</TableHead>
                <TableHead>Total (100)</TableHead>
                <TableHead>Letter Grade</TableHead>
                <TableHead>Grade Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">No students found for this course.</TableCell>
                </TableRow>
              ) : grades.map((grade) => {
                const total = calculateTotal(grade.internal, grade.external)
                const letterGrade = getLetterGrade(total)
                const gradePoints = getGradePoints(letterGrade)

                return (
                  <TableRow key={grade.id}>
                    <TableCell className="font-mono">{grade.enrollment}</TableCell>
                    <TableCell className="font-medium">{grade.name}</TableCell>
                    <TableCell>
                      {!publishMode ? (
                        <span className="font-medium">{grade.internal}</span>
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          max="30"
                          value={grade.internal}
                          onChange={(e) => handleGradeChange(grade.id, "internal", e.target.value)}
                          className="w-24"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {!publishMode ? (
                        <span className="font-medium">{grade.external}</span>
                      ) : (
                        <Input
                          type="number"
                          min="0"
                          max="70"
                          value={grade.external}
                          onChange={(e) => handleGradeChange(grade.id, "external", e.target.value)}
                          className="w-24"
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-bold">{total}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full font-semibold">
                        {letterGrade}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-accent">{gradePoints.toFixed(1)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {publishMode && (
          <div className="mt-6 flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setPublishMode(false)}>Cancel</Button>
            <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={handleSubmit} disabled={submitting}>
              <Check size={18} />
              {submitting ? 'Saving...' : 'Save Grades'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
