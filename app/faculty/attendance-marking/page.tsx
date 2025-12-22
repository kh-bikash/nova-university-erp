"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, X, AlertCircle, Loader2, Upload, QrCode, Users, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { safeFetch } from "@/lib/safe-fetch"

type AttStatus = 'present' | 'absent' | 'leave' | null

type StudentAtt = {
  id: string
  enrollment: string
  name: string
  status: AttStatus
}

type Course = {
  id: string
  course_code: string
  course_name: string
  credits: number
  semester: number
}

export default function AttendanceMarkingPage() {
  const { user } = useAuth()

  if (!user || user.role !== 'faculty') {
    return null
  }

  return (
    <ProtectedRoute>
      <AttendanceMarkingContent />
    </ProtectedRoute>
  )
}

function AttendanceMarkingContent() {
  const { toast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<StudentAtt[]>([])
  const [selectedCourse, setSelectedCourse] = useState("")
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("manual")

  // Fetch courses
  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await safeFetch('/api/attendance/courses')
        if (res.ok) {
          const data = await res.json()
          setCourses(data)
          if (data.length > 0) {
            setSelectedCourse(data[0].course_code)
          }
        }
      } catch (err) {
        console.error(err)
        toast({
          title: 'Connection Error',
          description: 'Failed to load courses. Please check your connection or disable ad-blockers.',
          variant: 'destructive'
        })
      } finally {
        setIsLoadingCourses(false)
      }
    }
    fetchCourses()
  }, [toast])

  // Fetch students when course changes
  useEffect(() => {
    if (!selectedCourse) return

    async function fetchStudents() {
      setIsLoadingStudents(true)
      try {
        const res = await safeFetch(`/api/attendance/students?course_code=${selectedCourse}`)
        if (res.ok) {
          const data = await res.json()
          setStudents(data.map((s: any) => ({ ...s, status: null })))
        } else {
          toast({ title: 'Error', description: 'Failed to load students', variant: 'destructive' })
        }
      } catch (err) {
        console.error(err)
        toast({
          title: 'Connection Error',
          description: 'Failed to load students. Please check your connection or disable ad-blockers.',
          variant: 'destructive'
        })
      } finally {
        setIsLoadingStudents(false)
      }
    }
    fetchStudents()
  }, [selectedCourse, toast])

  const handleMarkAttendance = (studentId: string, status: Exclude<AttStatus, null>) => {
    setStudents(students.map((s) => (s.id === studentId ? { ...s, status } : s)))
  }

  const handleBulkMark = (status: Exclude<AttStatus, null>) => {
    setStudents(students.map((s) => ({ ...s, status })))
  }

  const present = students.filter((s) => s.status === "present").length
  const absent = students.filter((s) => s.status === "absent").length
  const leave = students.filter((s) => s.status === "leave").length
  const marked = present + absent + leave

  const getStatusBadge = (status: string | null) => {
    if (status === "present") return <Check className="text-green-600" size={20} />
    if (status === "absent") return <X className="text-red-600" size={20} />
    if (status === "leave") return <AlertCircle className="text-yellow-600" size={20} />
    return <div className="w-5 h-5 border-2 border-muted rounded" />
  }

  const handleSubmit = async () => {
    if (students.length === 0) {
      toast({ title: 'Error', description: 'No students to mark', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const entries = students.map((s) => ({ enrollment: s.enrollment, status: s.status || 'absent' }))
      const res = await safeFetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_code: selectedCourse, attendance_date: new Date().toISOString().slice(0, 10), entries }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Failed', description: data?.error || 'Unable to submit attendance', variant: 'destructive' })
        return
      }

      toast({ title: 'Success', description: 'Attendance submitted to queue for processing', variant: 'default' })
      // Reset form
      setStudents(students.map(s => ({ ...s, status: null })))
    } catch (err) {
      console.error(err)
      toast({ title: 'Error', description: 'Unexpected error', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingCourses) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin" size={40} />
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <Card className="p-8 border border-border/50 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">No Courses Assigned</h2>
          <p className="text-muted-foreground">You don't have any courses assigned yet. Contact the admin.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mark Attendance</h1>
        <p className="text-muted-foreground mt-2">Record student attendance for the class</p>
      </div>

      {/* Select Course */}
      <Card className="p-6 border border-border/50">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:w-auto">
            <label className="block text-sm font-medium text-foreground mb-2">Select Course</label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full md:w-80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.course_code}>
                    {course.course_code} - {course.course_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </Card>

      {isLoadingStudents ? (
        <Card className="p-8 border border-border/50 text-center">
          <Loader2 className="animate-spin mx-auto" size={40} />
          <p className="text-muted-foreground mt-4">Loading students...</p>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Users size={16} /> Manual Entry
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCode size={16} /> QR Code
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload size={16} /> Bulk Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            {/* Attendance Summary */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground mt-1">{students.length}</p>
              </Card>
              <Card className="p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{present}</p>
              </Card>
              <Card className="p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{absent}</p>
              </Card>
              <Card className="p-4 border border-border/50">
                <p className="text-sm text-muted-foreground">Leave</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{leave}</p>
              </Card>
            </div>

            {/* Bulk Actions */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => handleBulkMark("present")} className="text-green-600 border-green-200 hover:bg-green-50">
                Mark All Present
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkMark("absent")} className="text-red-600 border-red-200 hover:bg-red-50">
                Mark All Absent
              </Button>
            </div>

            {/* Students Table */}
            {students.length > 0 ? (
              <Card className="p-6 border border-border/50">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Enrollment</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono">{student.enrollment}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            <div className="flex justify-center">{getStatusBadge(student.status)}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleMarkAttendance(student.id, "present")}
                                className={`gap-1 ${student.status === "present"
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "bg-muted hover:bg-muted/80"
                                  }`}
                              >
                                <Check size={16} />
                                Present
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleMarkAttendance(student.id, "absent")}
                                variant={student.status === "absent" ? "default" : "outline"}
                              >
                                <X size={16} />
                                Absent
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleMarkAttendance(student.id, "leave")}
                                variant={student.status === "leave" ? "default" : "outline"}
                              >
                                <AlertCircle size={16} />
                                Leave
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-6 flex gap-2 justify-end">
                  <Button variant="outline">Save as Draft</Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleSubmit}
                    disabled={isSubmitting || students.length === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 animate-spin" size={16} />
                        Submitting...
                      </>
                    ) : (
                      'Submit Attendance'
                    )}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 border border-border/50 text-center">
                <p className="text-muted-foreground">No students enrolled in this course yet.</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="qr">
            <Card className="p-12 border border-border/50 text-center flex flex-col items-center justify-center min-h-[400px]">
              <QrCode size={64} className="text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">QR Code Attendance</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Display this QR code on the projector. Students can scan it using their mobile app to mark their attendance automatically.
              </p>
              <Button size="lg" className="gap-2">
                Generate Session QR Code
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="upload">
            <Card className="p-12 border border-border/50 text-center flex flex-col items-center justify-center min-h-[400px]">
              <FileSpreadsheet size={64} className="text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Bulk Upload</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                Upload a CSV or Excel file containing student enrollment numbers and their attendance status.
              </p>
              <div className="flex gap-4">
                <Button variant="outline">Download Template</Button>
                <Button>Select File</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
