"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Printer } from "lucide-react"
import { useState, useEffect } from "react"

export default function MarksheetPage() {
  const { user } = useAuth()

  if (!user || !['student', 'parent', 'admin'].includes(user.role)) {
    return null
  }

  return (
    <ProtectedRoute>
      <MarksheetContent />
    </ProtectedRoute>
  )
}

function MarksheetContent() {
  const [studentInfo, setStudentInfo] = useState<any>(null)
  const [marks, setMarks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/results')
        if (res.ok) {
          const data = await res.json()
          setStudentInfo(data.student)

          // Transform data for table
          const processedMarks = data.results.map((r: any) => ({
            code: r.course_code,
            name: r.course_name,
            internal: 0, // Placeholder as schema might not split internal/external yet
            external: r.marks_obtained,
            total: r.marks_obtained,
            grade: calculateGrade(r.marks_obtained, r.max_marks),
            credits: r.credits
          }))
          setMarks(processedMarks)
        }
      } catch (error) {
        console.error("Failed to fetch results", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const calculateGrade = (obtained: number, max: number) => {
    const percentage = (obtained / max) * 100
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 50) return 'D'
    return 'F'
  }

  if (loading) return <div className="p-8 text-center">Loading marksheet...</div>
  if (!studentInfo) return <div className="p-8 text-center">No academic record found.</div>

  const totalCredits = marks.reduce((sum, m) => sum + m.credits, 0)
  const totalMarks = marks.reduce((sum, m) => sum + m.total, 0)
  const averageMarks = marks.length > 0 ? (totalMarks / marks.length).toFixed(2) : "0.00"

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Official Marksheet</h1>
          <p className="text-muted-foreground mt-2">Semester {studentInfo.semester} Academic Record</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Printer size={18} />
            Print
          </Button>
          <Button className="bg-primary hover:bg-primary/90 gap-2">
            <Download size={18} />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Marksheet Document */}
      <Card className="p-12 border border-border/50 bg-white text-black space-y-8">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-6">
          <p className="text-xl font-bold">NOVA UNIVERSITY</p>
          <p className="text-sm">OFFICIAL MARKSHEET</p>
          <p className="text-xs text-gray-600 mt-2">This is an official academic record</p>
        </div>

        {/* Student Information */}
        <div className="grid grid-cols-3 gap-6 text-sm">
          <div>
            <p className="font-semibold">Student Name</p>
            <p className="text-lg font-mono">{studentInfo.name}</p>
          </div>
          <div>
            <p className="font-semibold">Enrollment Number</p>
            <p className="text-lg font-mono">{studentInfo.enrollment}</p>
          </div>
          <div>
            <p className="font-semibold">Department</p>
            <p className="text-lg">{studentInfo.department}</p>
          </div>
        </div>

        {/* Grades Table */}
        <div>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-t-2 border-b-2 border-black">
                <th className="p-2 text-left font-semibold">Course Code</th>
                <th className="p-2 text-left font-semibold">Course Name</th>
                <th className="p-2 text-center font-semibold">Internal</th>
                <th className="p-2 text-center font-semibold">External</th>
                <th className="p-2 text-center font-semibold">Total</th>
                <th className="p-2 text-center font-semibold">Grade</th>
                <th className="p-2 text-center font-semibold">Credits</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((mark, idx) => (
                <tr key={idx} className="border-b border-gray-300">
                  <td className="p-2 font-mono">{mark.code}</td>
                  <td className="p-2">{mark.name}</td>
                  <td className="p-2 text-center">{mark.internal}/30</td>
                  <td className="p-2 text-center">{mark.external}/70</td>
                  <td className="p-2 text-center font-semibold">{mark.total}</td>
                  <td className="p-2 text-center font-bold">{mark.grade}</td>
                  <td className="p-2 text-center">{mark.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="border-t-2 border-black pt-4 grid grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-semibold">Total Credits</p>
            <p className="text-lg font-bold">{totalCredits}</p>
          </div>
          <div>
            <p className="font-semibold">Average Marks</p>
            <p className="text-lg font-bold">{averageMarks}</p>
          </div>
          <div>
            <p className="font-semibold">CGPA</p>
            <p className="text-lg font-bold">{studentInfo.cgpa}</p>
          </div>
          <div>
            <p className="font-semibold">Status</p>
            <p className="text-lg font-bold text-green-600">PASS</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-black pt-6 text-center text-xs text-gray-600">
          <p>This marksheet is valid only when issued on official letterhead with authorized signature.</p>
          <p>Generated on: {new Date().toLocaleDateString()}</p>
        </div>
      </Card>
    </div>
  )
}
