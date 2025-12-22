"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Mail } from "lucide-react"

interface TranscriptRecord {
  semester: number
  credits_earned: number
  gpa: number
  cum_gpa: number
}

const transcriptData: TranscriptRecord[] = [
  { semester: 1, credits_earned: 16, gpa: 3.8, cum_gpa: 3.8 },
  { semester: 2, credits_earned: 18, gpa: 3.7, cum_gpa: 3.75 },
  { semester: 3, credits_earned: 17, gpa: 3.6, cum_gpa: 3.7 },
  { semester: 4, credits_earned: 16, gpa: 3.9, cum_gpa: 3.75 },
  { semester: 5, credits_earned: 18, gpa: 3.8, cum_gpa: 3.76 },
  { semester: 6, credits_earned: 16, gpa: 3.5, cum_gpa: 3.7 },
]

export default function TranscriptsPage() {
  const { user } = useAuth()

  if (!user || !['student', 'parent', 'admin'].includes(user.role)) {
    return null
  }

  return (
    <ProtectedRoute>
      <TranscriptsContent />
    </ProtectedRoute>
  )
}

function TranscriptsContent() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Academic Transcript</h1>
          <p className="text-muted-foreground mt-1">Your complete academic record</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download size={18} />
            Download PDF
          </Button>
          <Button className="gap-2">
            <Mail size={18} />
            Share
          </Button>
        </div>
      </div>

      {/* Student Info */}
      <Card className="p-6 border border-border/50">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground">Student Name</p>
            <p className="text-lg font-bold text-foreground">John Doe</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Enrollment ID</p>
            <p className="text-lg font-bold text-foreground">KL2021-001</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="text-lg font-bold text-foreground">Computer Science</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cumulative GPA</p>
            <p className="text-lg font-bold text-primary">3.76/4.0</p>
          </div>
        </div>
      </Card>

      {/* Transcript Table */}
      <Card className="border border-border/50 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Semester</TableHead>
              <TableHead className="text-center">Credits Earned</TableHead>
              <TableHead className="text-center">Semester GPA</TableHead>
              <TableHead className="text-center">Cumulative GPA</TableHead>
              <TableHead className="text-center">Performance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transcriptData.map((record) => (
              <TableRow key={record.semester}>
                <TableCell className="text-center font-semibold">Semester {record.semester}</TableCell>
                <TableCell className="text-center">{record.credits_earned}</TableCell>
                <TableCell className="text-center font-semibold text-primary">{record.gpa.toFixed(2)}</TableCell>
                <TableCell className="text-center font-semibold text-accent">{record.cum_gpa.toFixed(2)}</TableCell>
                <TableCell className="text-center">
                  {record.gpa >= 3.7 ? (
                    <Badge className="bg-green-600">Excellent</Badge>
                  ) : record.gpa >= 3.5 ? (
                    <Badge className="bg-blue-600">Very Good</Badge>
                  ) : (
                    <Badge className="bg-yellow-600">Good</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Credits</p>
          <p className="text-3xl font-bold text-primary mt-2">101</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Semesters Completed</p>
          <p className="text-3xl font-bold text-accent mt-2">6</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Highest GPA</p>
          <p className="text-3xl font-bold text-green-600 mt-2">3.9</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Lowest GPA</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">3.5</p>
        </Card>
      </div>

      {/* Academic Honors */}
      <Card className="p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">Academic Honors</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <span className="text-2xl">🏅</span>
            <div>
              <p className="font-medium text-foreground">Dean's List</p>
              <p className="text-sm text-muted-foreground">Semester 1, 2, and 4</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <span className="text-2xl">⭐</span>
            <div>
              <p className="font-medium text-foreground">Merit Scholarship</p>
              <p className="text-sm text-muted-foreground">Awarded for exceptional academic performance</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
