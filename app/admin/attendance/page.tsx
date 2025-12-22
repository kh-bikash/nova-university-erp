"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Edit2, Check, X, AlertCircle, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminAttendancePage() {
    const { user } = useAuth()

    if (!user || user.role !== "admin") {
        return null
    }

    return (
        <ProtectedRoute>
            <AdminAttendanceContent />
        </ProtectedRoute>
    )
}

function AdminAttendanceContent() {
    const toast = useToast()
    const [records, setRecords] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // Filters
    const [selectedCourse, setSelectedCourse] = useState("")
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

    // Edit State
    const [editingRecord, setEditingRecord] = useState<any>(null)
    const [newStatus, setNewStatus] = useState("")
    const [remarks, setRemarks] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Fetch Courses on mount
    useEffect(() => {
        async function fetchCourses() {
            try {
                const res = await fetch('/api/courses')
                if (res.ok) {
                    const json = await res.json()
                    setCourses(json.data || [])
                }
            } catch (error) {
                console.error("Failed to fetch courses", error)
            }
        }
        fetchCourses()
    }, [])

    // Fetch Records
    const fetchRecords = async () => {
        setLoading(true)
        try {
            let url = `/api/attendance/admin?date=${selectedDate}`
            if (selectedCourse && selectedCourse !== "all") {
                url += `&course_id=${selectedCourse}`
            }

            const res = await fetch(url)
            if (res.ok) {
                const data = await res.json()
                setRecords(data)
            } else {
                toast.toast({ title: "Error", description: "Failed to fetch records", variant: "destructive" })
            }
        } catch (error) {
            console.error("Error fetching records", error)
            toast.toast({ title: "Error", description: "Failed to fetch records", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRecords()
    }, [selectedDate, selectedCourse])

    const handleEdit = (record: any) => {
        setEditingRecord(record)
        setNewStatus(record.status)
        setRemarks(record.remarks || "")
        setIsDialogOpen(true)
    }

    const handleUpdate = async () => {
        if (!editingRecord) return

        try {
            const res = await fetch('/api/attendance/admin', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingRecord.id,
                    status: newStatus,
                    remarks: remarks
                })
            })

            if (res.ok) {
                toast.toast({ title: "Success", description: "Attendance updated successfully" })
                setIsDialogOpen(false)
                fetchRecords() // Refresh
            } else {
                toast.toast({ title: "Error", description: "Failed to update attendance", variant: "destructive" })
            }
        } catch (error) {
            console.error("Error updating attendance", error)
            toast.toast({ title: "Error", description: "Failed to update attendance", variant: "destructive" })
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present': return <Badge className="bg-green-600">Present</Badge>
            case 'absent': return <Badge variant="destructive">Absent</Badge>
            case 'leave': return <Badge className="bg-yellow-600">Leave</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Attendance Control</h1>
                    <p className="text-muted-foreground mt-1">Monitor and override student attendance</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-6 border border-border/50">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-64">
                        <Label className="mb-2 block">Date</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-64">
                        <Label className="mb-2 block">Course</Label>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Courses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {courses.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.course_code}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={fetchRecords} className="gap-2">
                        <Search size={16} /> Filter
                    </Button>
                </div>
            </Card>

            {/* Records Table */}
            <Card className="border border-border/50 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Remarks</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    Loading records...
                                </TableCell>
                            </TableRow>
                        ) : records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No attendance records found for this selection.
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="font-medium">{record.student_name}</div>
                                        <div className="text-xs text-muted-foreground">{record.enrollment_number}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{record.course_code}</div>
                                        <div className="text-xs text-muted-foreground">{record.course_name}</div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{record.remarks || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                                            <Edit2 size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Attendance</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Student</Label>
                            <div className="font-medium">{editingRecord?.student_name}</div>
                        </div>

                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="present">Present</SelectItem>
                                    <SelectItem value="absent">Absent</SelectItem>
                                    <SelectItem value="leave">Leave</SelectItem>
                                    <SelectItem value="excused">Excused</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Remarks (Reason for change)</Label>
                            <Input
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="e.g. Medical Certificate Submitted"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleUpdate}>Update Status</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
