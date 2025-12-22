"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"

const gradeData = [
  { code: "CS401", name: "Advanced Algorithms", internal: 28, external: 68, total: 96, grade: "A", credits: 4 },
  { code: "CS402", name: "Database Systems", internal: 26, external: 64, total: 90, grade: "A-", credits: 3 },
  { code: "CS403", name: "Web Development", internal: 27, external: 66, total: 93, grade: "A", credits: 3 },
  { code: "IT401", name: "Cloud Computing", internal: 25, external: 62, total: 87, grade: "B+", credits: 4 },
]

const semesterGPA = [
  { semester: "Sem 1", gpa: 3.2 },
  { semester: "Sem 2", gpa: 3.5 },
  { semester: "Sem 3", gpa: 3.7 },
  { semester: "Sem 4", gpa: 3.9 },
]

const getGradeColor = (grade: string) => {
  if (grade.includes("A")) return "text-green-600 font-bold"
  if (grade.includes("B")) return "text-blue-600 font-bold"
  if (grade.includes("C")) return "text-yellow-600 font-bold"
  return "text-red-600 font-bold"
}

export default function GradesPage() {
  const { user } = useAuth()

  if (!user || !['student', 'parent', 'admin'].includes(user.role)) {
    return null
  }

  return (
    <ProtectedRoute>
      <GradesContent />
    </ProtectedRoute>
  )
}

function GradesContent() {
  const [selectedSemester, setSelectedSemester] = useState("current")
  const cgpa = 3.8
  const totalCredits = gradeData.reduce((sum, g) => sum + g.credits, 0)

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Grades & Marksheet</h1>
        <p className="text-muted-foreground mt-2">View your grades, marks, and academic performance</p>
      </div>

      {/* CGPA Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 border border-border/50 bg-linear-to-br from-primary/10 to-accent/10">
          <p className="text-sm text-muted-foreground">Cumulative GPA</p>
          <p className="text-4xl font-bold text-primary mt-2">{cgpa}</p>
          <p className="text-xs text-muted-foreground mt-2">Out of 4.0</p>
        </Card>

        <Card className="p-6 border border-border/50 bg-linear-to-br from-accent/10 to-secondary/10">
          <p className="text-sm text-muted-foreground">Current Semester</p>
          <p className="text-4xl font-bold text-accent mt-2">3.9</p>
          <p className="text-xs text-muted-foreground mt-2">Semester 4</p>
        </Card>

        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Credits Earned</p>
          <p className="text-4xl font-bold text-foreground mt-2">{totalCredits}</p>
          <p className="text-xs text-muted-foreground mt-2">Credits completed</p>
        </Card>
      </div>

      {/* GPA Trend */}
      <Card className="p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">GPA Progress by Semester</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={semesterGPA}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis stroke="var(--color-muted-foreground)" />
            <YAxis stroke="var(--color-muted-foreground)" domain={[0, 4]} />
            <Tooltip
              contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
              labelStyle={{ color: "var(--color-foreground)" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="gpa"
              stroke="var(--color-primary)"
              strokeWidth={3}
              dot={{ fill: "var(--color-primary)", r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Current Semester Grades */}
      <Card className="p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">Semester 4 - Detailed Grades</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Internal</TableHead>
                <TableHead>External</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Credits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gradeData.map((grade) => (
                <TableRow key={grade.code}>
                  <TableCell className="font-mono font-semibold text-primary">{grade.code}</TableCell>
                  <TableCell className="font-medium">{grade.name}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded">{grade.internal}/30</span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-accent/10 text-accent rounded">{grade.external}/70</span>
                  </TableCell>
                  <TableCell className="font-bold">{grade.total}/100</TableCell>
                  <TableCell className={getGradeColor(grade.grade)}>{grade.grade}</TableCell>
                  <TableCell>{grade.credits}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Download Marksheet */}
      <div className="flex gap-2">
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Download size={18} />
          Download Marksheet
        </Button>
        <Button variant="outline" gap-2>
          <Download size={18} />
          Download Transcript
        </Button>
      </div>
    </div>
  )
}
