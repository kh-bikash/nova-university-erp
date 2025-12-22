"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, FileText, Edit, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function FacultyExamsPage() {
    const { user } = useAuth()

    if (!user || user.role !== "faculty") {
        return null
    }

    return (
        <ProtectedRoute>
            <FacultyExamsContent />
        </ProtectedRoute>
    )
}

function FacultyExamsContent() {
    const toast = useToast()
    const [exams, setExams] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Grading State
    const [selectedExamForGrading, setSelectedExamForGrading] = useState<any>(null)
    const [students, setStudents] = useState<any[]>([])
    const [marks, setMarks] = useState<Record<string, string>>({})
    const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            // Fetch exams filtered by faculty_id=me
            const res = await fetch('/api/exams?faculty_id=me')
            if (res.ok) setExams(await res.json())
        } catch (error) {
            console.error("Failed to fetch data", error)
            toast.toast({ title: "Error", description: "Failed to load exams", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleEnterMarks = async (exam: any) => {
        setSelectedExamForGrading(exam)
        setIsGradingDialogOpen(true)
        setLoading(true)
        try {
            // Fetch students for this course
            const res = await fetch(`/api/attendance/students?course_code=${exam.course_code}`)
            if (res.ok) {
                const data = await res.json()
                setStudents(data)
                // Initialize marks
                const initialMarks: Record<string, string> = {}
                data.forEach((s: any) => initialMarks[s.id] = "")
                setMarks(initialMarks)
            }
        } catch (error) {
            console.error("Failed to fetch students", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveMarks = async () => {
        if (!selectedExamForGrading) return
        setSaving(true)
        try {
            const results = Object.entries(marks).map(([studentId, mark]) => ({
                student_id: studentId,
                marks: parseFloat(mark) || 0,
                remarks: ""
            })).filter(r => r.marks > 0 || String(r.marks) === "0")

            const res = await fetch('/api/exams', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: selectedExamForGrading.id,
                    results
                })
            })

            if (res.ok) {
                toast.toast({ title: "Success", description: "Marks saved successfully" })
                setIsGradingDialogOpen(false)
            } else {
                toast.toast({ title: "Error", description: "Failed to save marks", variant: "destructive" })
            }
        } catch (error) {
            console.error("Error saving marks", error)
            toast.toast({ title: "Error", description: "Failed to save marks", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Invigilation & Exams</h1>
                    <p className="text-muted-foreground mt-1">View exam schedule and assigned rooms</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => (
                    <Card key={exam.id} className="p-6 border border-border/50">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg">{exam.course_code}</h3>
                                <p className="text-sm text-muted-foreground">{exam.course_name}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${exam.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {exam.status?.toUpperCase() || 'SCHEDULED'}
                            </span>
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="font-medium text-lg">{exam.exam_name}</div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar size={16} className="text-muted-foreground" />
                                <span>{format(new Date(exam.exam_date), 'MMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Clock size={16} className="text-muted-foreground" />
                                <span>{exam.start_time.slice(0, 5)} - {exam.end_time.slice(0, 5)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded w-fit">
                                <MapPin size={16} />
                                <span>Room: {exam.room_no || "TBA"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <FileText size={16} className="text-muted-foreground" />
                                <span>Max Marks: {exam.max_marks}</span>
                            </div>
                        </div>

                        <Button className="w-full gap-2" onClick={() => handleEnterMarks(exam)}>
                            <Edit size={16} /> Enter Marks
                        </Button>
                    </Card>
                ))}

                {exams.length === 0 && !loading && (
                    <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                        No exams scheduled for your courses.
                    </div>
                )}
            </div>

            <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Enter Marks - {selectedExamForGrading?.exam_name}</DialogTitle>
                    </DialogHeader>

                    <div className="py-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Enrollment</TableHead>
                                    <TableHead>Student Name</TableHead>
                                    <TableHead>Marks (Max: {selectedExamForGrading?.max_marks})</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-mono">{student.enrollment}</TableCell>
                                        <TableCell>{student.name}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                className="w-24"
                                                min="0"
                                                max={selectedExamForGrading?.max_marks}
                                                value={marks[student.id] || ""}
                                                onChange={(e) => setMarks({ ...marks, [student.id]: e.target.value })}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsGradingDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveMarks} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Marks'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
