"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, AlertCircle } from "lucide-react"

interface Exam {
  id: string
  course_code: string
  course_name: string
  exam_type: "midterm" | "final" | "quiz" | "practical"
  date: string
  time: string
  duration: number
  total_marks: number
  status: "scheduled" | "ongoing" | "completed"
  registered_count: number
}

// Mock data removed

export default function ExamsPage() {
  const { user } = useAuth()

  if (!user || !['student', 'admin'].includes(user.role)) {
    return null
  }

  return (
    <ProtectedRoute>
      <ExamsContent />
    </ProtectedRoute>
  )
}

function ExamsContent() {
  const [exams, setExams] = useState<Exam[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await fetch('/api/exams')
        if (res.ok) {
          const data = await res.json()
          // Map API response to Exam interface if needed
          // API returns: id, exam_name, exam_date, start_time, end_time, max_marks, status, course_code, course_name
          setExams(data.map((e: any) => ({
            id: e.id,
            course_code: e.course_code,
            course_name: e.course_name || e.exam_name, // Fallback
            exam_type: e.exam_name.toLowerCase().includes('mid') ? 'midterm' :
              e.exam_name.toLowerCase().includes('final') ? 'final' :
                e.exam_name.toLowerCase().includes('quiz') ? 'quiz' : 'practical',
            date: new Date(e.exam_date).toLocaleDateString(),
            time: e.start_time,
            duration: 90, // Mock duration or calculate from start/end
            total_marks: e.max_marks,
            status: e.status || 'scheduled',
            registered_count: 0 // API doesn't return this yet for students
          })))
        }
      } catch (error) {
        console.error("Failed to fetch exams", error)
      } finally {
        setLoading(false)
      }
    }
    fetchExams()
  }, [])

  const filteredExams = exams.filter(
    (exam) =>
      exam.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.course_code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-600"
      case "ongoing":
        return "bg-yellow-600"
      case "completed":
        return "bg-green-600"
      default:
        return "bg-gray-600"
    }
  }

  const getExamTypeLabel = (type: string) => {
    const labels = {
      midterm: "Mid-Term",
      final: "Final",
      quiz: "Quiz",
      practical: "Practical",
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Examinations</h1>
          <p className="text-muted-foreground mt-1">View scheduled exams and results</p>
        </div>
      </div>

      {/* Search */}
      <Card className="p-4 border border-border/50">
        <div className="flex items-center gap-2">
          <Search size={20} className="text-muted-foreground" />
          <Input
            placeholder="Search exams by course name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0"
          />
        </div>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Exams</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card className="border border-border/50 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-center">Duration</TableHead>
                  <TableHead className="text-center">Marks</TableHead>
                  <TableHead className="text-center">Registered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-mono font-bold">{exam.course_code}</TableCell>
                    <TableCell className="font-medium">{exam.course_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getExamTypeLabel(exam.exam_type)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {exam.date} {exam.time}
                    </TableCell>
                    <TableCell className="text-center">{exam.duration} min</TableCell>
                    <TableCell className="text-center font-semibold">{exam.total_marks}</TableCell>
                    <TableCell className="text-center">{exam.registered_count}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(exam.status)}>{exam.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled">
          <Card className="border border-border/50 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead className="text-center">Duration</TableHead>
                  <TableHead className="text-center">Registered</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams
                  .filter((e) => e.status === "scheduled")
                  .map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.course_name}</TableCell>
                      <TableCell>
                        {exam.date} {exam.time}
                      </TableCell>
                      <TableCell className="text-center">{exam.duration} min</TableCell>
                      <TableCell className="text-center">{exam.registered_count}</TableCell>
                      <TableCell>
                        <Button variant="default" size="sm">
                          Register
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="ongoing">
          <Card className="border border-border/50 p-6">
            <div className="text-center py-8">
              <AlertCircle size={48} className="mx-auto text-yellow-600 mb-3" />
              <p className="text-foreground font-medium">No ongoing exams at the moment</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card className="border border-border/50 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-center">Marks Obtained</TableHead>
                  <TableHead className="text-center">Percentage</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExams
                  .filter((e) => e.status === "completed")
                  .map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.course_name}</TableCell>
                      <TableCell>{getExamTypeLabel(exam.exam_type)}</TableCell>
                      <TableCell>{exam.date}</TableCell>
                      <TableCell className="text-center">42/{exam.total_marks}</TableCell>
                      <TableCell className="text-center font-semibold">84%</TableCell>
                      <TableCell>
                        <Badge className="bg-green-600">A</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Exams</p>
          <p className="text-3xl font-bold text-primary mt-2">{exams.length}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Scheduled</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {exams.filter((e) => e.status === "scheduled").length}
          </p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {exams.filter((e) => e.status === "completed").length}
          </p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Registered</p>
          <p className="text-3xl font-bold text-accent mt-2">{exams.reduce((sum, e) => sum + e.registered_count, 0)}</p>
        </Card>
      </div>
    </div>
  )
}
