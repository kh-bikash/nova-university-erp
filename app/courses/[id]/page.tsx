"use client"

import { TableCell } from "@/components/ui/table"

import { TableBody } from "@/components/ui/table"

import { TableHead } from "@/components/ui/table"

import { TableRow } from "@/components/ui/table"

import { TableHeader } from "@/components/ui/table"

import { Table } from "@/components/ui/table"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Clock, BookOpen, Award } from "lucide-react"

const courseDetails = {
  id: "1",
  code: "CS401",
  name: "Advanced Algorithms",
  department: "Computer Science",
  faculty: "Dr. Rajesh Kumar",
  email: "rajesh@kl.edu",
  credits: 4,
  semester: 4,
  capacity: 60,
  enrolled: 45,
  description:
    "Advanced study of algorithms including design paradigms, complexity analysis, and optimization techniques.",
  prerequisites: "Data Structures (CS201), Discrete Mathematics (CS101)",
  schedule: [
    { day: "Monday", time: "10:00 AM - 11:30 AM", room: "Lab 2A" },
    { day: "Wednesday", time: "10:00 AM - 11:30 AM", room: "Lab 2A" },
    { day: "Friday", time: "02:00 PM - 03:30 PM", room: "Lecture Hall 3" },
  ],
}

const students = [
  { id: "1", name: "Aarav Kumar", enrollment: "KL2023001", status: "Active" },
  { id: "2", name: "Ananya Sharma", enrollment: "KL2023002", status: "Active" },
  { id: "3", name: "Rajesh Patel", enrollment: "KL2023003", status: "Active" },
]

const assessments = [
  { type: "Quiz 1", date: "2024-09-15", maxMarks: 10, weightage: "10%" },
  { type: "Assignment 1", date: "2024-09-25", maxMarks: 20, weightage: "20%" },
  { type: "Midterm Exam", date: "2024-10-15", maxMarks: 30, weightage: "30%" },
  { type: "Final Project", date: "2024-11-20", maxMarks: 40, weightage: "40%" },
]

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{courseDetails.name}</h1>
        <p className="text-muted-foreground mt-2">{courseDetails.code}</p>
      </div>

      {/* Course Header */}
      <Card className="p-8 border border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Credits</p>
            <p className="text-2xl font-bold text-foreground">{courseDetails.credits}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Enrolled</p>
            <p className="text-2xl font-bold text-accent">
              {courseDetails.enrolled}/{courseDetails.capacity}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Faculty</p>
            <p className="font-semibold text-foreground">{courseDetails.faculty}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Semester</p>
            <p className="text-2xl font-bold text-primary">Sem {courseDetails.semester}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="border-b bg-transparent p-0 w-full justify-start rounded-none">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <BookOpen size={18} className="mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Clock size={18} className="mr-2" />
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Users size={18} className="mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger
            value="assessment"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Award size={18} className="mr-2" />
            Assessment
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card className="p-6 border border-border/50">
            <h3 className="font-semibold text-foreground mb-3">Course Description</h3>
            <p className="text-muted-foreground">{courseDetails.description}</p>
          </Card>
          <Card className="p-6 border border-border/50">
            <h3 className="font-semibold text-foreground mb-3">Prerequisites</h3>
            <p className="text-muted-foreground">{courseDetails.prerequisites}</p>
          </Card>
          <Card className="p-6 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Faculty Information</h3>
            <div className="space-y-2">
              <p>
                <span className="text-muted-foreground">Name:</span>{" "}
                <span className="font-medium text-foreground">{courseDetails.faculty}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span>{" "}
                <span className="font-medium text-foreground">{courseDetails.email}</span>
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-6">
          <Card className="p-6 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Class Schedule</h3>
            <div className="space-y-3">
              {courseDetails.schedule.map((session, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-card rounded-lg border border-border/30 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold text-foreground">{session.day}</p>
                    <p className="text-sm text-muted-foreground">{session.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">{session.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <Card className="p-6 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Enrolled Students ({students.length})</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Enrollment Number</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.enrollment}</TableCell>
                      <TableCell>
                        <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                          {student.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="assessment" className="mt-6">
          <Card className="p-6 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Assessment Breakdown</h3>
            <div className="space-y-3">
              {assessments.map((assessment, idx) => (
                <div key={idx} className="p-4 bg-card rounded-lg border border-border/30">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-foreground">{assessment.type}</p>
                      <p className="text-sm text-muted-foreground">Due: {assessment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{assessment.weightage}</p>
                      <p className="text-sm text-muted-foreground">{assessment.maxMarks} marks</p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: assessment.weightage }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
