"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Calendar, Clock, FileText, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function AdminExamsPage() {
    const { user } = useAuth()

    if (!user || user.role !== "admin") {
        return null
    }

    return (
        <ProtectedRoute>
            <AdminExamsContent />
        </ProtectedRoute>
    )
}

function AdminExamsContent() {
    const toast = useToast()
    const [exams, setExams] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const [editingId, setEditingId] = useState<string | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        course_id: "",
        exam_name: "",
        exam_date: "",
        start_time: "",
        end_time: "",
        max_marks: "100"
    })

    useEffect(() => {
        async function fetchData() {
            try {
                const [eRes, cRes] = await Promise.all([
                    fetch('/api/exams'),
                    fetch('/api/courses')
                ])

                if (eRes.ok) setExams(await eRes.json())
                if (cRes.ok) {
                    const cData = await cRes.json()
                    setCourses(cData.data || [])
                }
            } catch (error) {
                console.error("Failed to fetch data", error)
                toast.toast({ title: "Error", description: "Failed to load exam data", variant: "destructive" })
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleSchedule = async () => {
        if (!formData.course_id || !formData.exam_name || !formData.exam_date) {
            toast.toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" })
            return
        }

        try {
            const url = editingId ? '/api/exams' : '/api/exams'
            const method = editingId ? 'PUT' : 'POST'
            const body = editingId ? { ...formData, id: editingId } : formData

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            const data = await res.json()

            if (res.ok) {
                toast.toast({ title: "Success", description: `Exam ${editingId ? 'updated' : 'scheduled'} successfully` })
                if (editingId) {
                    setExams(exams.map(e => e.id === editingId ? { ...e, ...formData, course_code: courses.find(c => c.id === formData.course_id)?.course_code, course_name: courses.find(c => c.id === formData.course_id)?.course_name } : e))
                } else {
                    setExams([data, ...exams])
                }
                setIsDialogOpen(false)
                setFormData({
                    course_id: "",
                    exam_name: "",
                    exam_date: "",
                    start_time: "",
                    end_time: "",
                    max_marks: "100"
                })
                setEditingId(null)
            } else {
                toast.toast({ title: "Error", description: data.error || "Failed to save exam", variant: "destructive" })
            }
        } catch (error) {
            console.error("Error saving exam", error)
            toast.toast({ title: "Error", description: "Failed to save exam", variant: "destructive" })
        }
    }

    const handleEdit = (exam: any) => {
        setEditingId(exam.id)
        setFormData({
            course_id: exam.course_id || courses.find(c => c.course_code === exam.course_code)?.id || "", // Try to find ID if not directly available
            exam_name: exam.exam_name,
            exam_date: exam.exam_date.split('T')[0], // Format for date input
            start_time: exam.start_time,
            end_time: exam.end_time,
            max_marks: exam.max_marks
        })
        setIsDialogOpen(true)
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Exam Management</h1>
                    <p className="text-muted-foreground mt-1">Schedule and manage exams</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) {
                        setEditingId(null)
                        setFormData({
                            course_id: "",
                            exam_name: "",
                            exam_date: "",
                            start_time: "",
                            end_time: "",
                            max_marks: "100"
                        })
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus size={20} /> Schedule Exam
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Exam' : 'Schedule New Exam'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label>Exam Name</Label>
                                <Input
                                    value={formData.exam_name}
                                    onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
                                    placeholder="e.g. Mid Term 1"
                                />
                            </div>

                            <div>
                                <Label>Course</Label>
                                <Select
                                    value={formData.course_id}
                                    onValueChange={(val) => setFormData({ ...formData, course_id: val })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select Course" /></SelectTrigger>
                                    <SelectContent>
                                        {courses.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.course_code} - {c.course_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.exam_date}
                                        onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Max Marks</Label>
                                    <Input
                                        type="number"
                                        value={formData.max_marks}
                                        onChange={(e) => setFormData({ ...formData, max_marks: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Start Time</Label>
                                    <Input
                                        type="time"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>End Time</Label>
                                    <Input
                                        type="time"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleSchedule}>{editingId ? 'Update' : 'Schedule'}</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border border-border/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Exam Name</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Max Marks</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {exams.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No exams scheduled yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            exams.map((exam) => (
                                <TableRow key={exam.id}>
                                    <TableCell className="font-medium">{exam.exam_name}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{exam.course_code}</div>
                                        <div className="text-xs text-muted-foreground">{exam.course_name}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-muted-foreground" />
                                            {format(new Date(exam.exam_date), 'MMM d, yyyy')}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                            <Clock size={14} />
                                            {exam.start_time.slice(0, 5)} - {exam.end_time.slice(0, 5)}
                                        </div>
                                    </TableCell>
                                    <TableCell>{exam.max_marks}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${exam.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            exam.status === 'published' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(exam)}>Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
