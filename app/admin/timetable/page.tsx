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
import { Plus, Trash2, Calendar, Clock, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminTimetablePage() {
    const { user } = useAuth()

    if (!user || user.role !== "admin") {
        return null
    }

    return (
        <ProtectedRoute>
            <AdminTimetableContent />
        </ProtectedRoute>
    )
}

function AdminTimetableContent() {
    const toast = useToast()
    const [timetable, setTimetable] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [faculty, setFaculty] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        course_id: "",
        faculty_id: "",
        day_of_week: "Monday",
        start_time: "09:00",
        end_time: "10:00",
        room_number: "",
        semester: "",
        academic_year: new Date().getFullYear().toString()
    })

    // Fetch Data
    useEffect(() => {
        async function fetchData() {
            try {
                const [tRes, cRes, fRes] = await Promise.all([
                    fetch('/api/timetable'),
                    fetch('/api/courses', { cache: 'no-store' }),
                    fetch('/api/faculty', { cache: 'no-store' })
                ])

                if (tRes.ok) setTimetable(await tRes.json())
                if (cRes.ok) {
                    const cData = await cRes.json()
                    setCourses(cData.data || [])
                }
                if (fRes.ok) {
                    const fData = await fRes.json()
                    console.log('Faculty Data in Frontend:', fData)
                    setFaculty(fData)
                } else {
                    console.error('Faculty fetch error:', fRes.status)
                }
            } catch (error) {
                console.error("Failed to fetch data", error)
                toast.toast({ title: "Error", description: "Failed to load timetable data", variant: "destructive" })
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleAdd = async () => {
        console.log('handleAdd called with:', formData)
        if (!formData.course_id || !formData.faculty_id || !formData.room_number || !formData.semester) {
            console.log('Validation failed')
            toast.toast({ title: "Error", description: "Please fill all fields including Semester", variant: "destructive" })
            return
        }

        try {
            console.log('Sending request...')
            const res = await fetch('/api/timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await res.json()
            console.log('Response:', res.status, data)

            if (res.ok) {
                toast.toast({ title: "Success", description: "Class scheduled successfully" })
                setTimetable([...timetable, {
                    ...data,
                    course_code: courses.find(c => c.id === formData.course_id)?.course_code,
                    course_name: courses.find(c => c.id === formData.course_id)?.course_name,
                    faculty_name: faculty.find(f => f.id === formData.faculty_id)?.full_name
                }])
                setIsDialogOpen(false)
            } else {
                toast.toast({ title: "Error", description: data.error || "Failed to schedule class", variant: "destructive" })
            }
        } catch (error) {
            console.error("Error scheduling class", error)
            toast.toast({ title: "Error", description: "Failed to schedule class", variant: "destructive" })
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this class?")) return

        try {
            const res = await fetch(`/api/timetable?id=${id}`, { method: 'DELETE' })
            if (res.ok) {
                setTimetable(timetable.filter(t => t.id !== id))
                toast.toast({ title: "Success", description: "Class removed" })
            }
        } catch (error) {
            console.error("Error deleting class", error)
        }
    }

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Timetable Management</h1>
                    <p className="text-muted-foreground mt-1">Schedule classes and manage conflicts</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus size={20} /> Schedule Class
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Schedule New Class</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Day</Label>
                                    <Select
                                        value={formData.day_of_week}
                                        onValueChange={(val) => setFormData({ ...formData, day_of_week: val })}
                                    >
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Room</Label>
                                    <Input
                                        value={formData.room_number}
                                        onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                        placeholder="e.g. C-201"
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

                            <div>
                                <Label>Faculty</Label>
                                <Select
                                    value={formData.faculty_id}
                                    onValueChange={(val) => setFormData({ ...formData, faculty_id: val })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select Faculty" /></SelectTrigger>
                                    <SelectContent>
                                        {faculty.map(f => (
                                            <SelectItem key={f.id} value={f.id}>{f.full_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Semester</Label>
                                <Select
                                    value={formData.semester}
                                    onValueChange={(val) => setFormData({ ...formData, semester: val })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select Semester" /></SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                            <SelectItem key={s} value={s.toString()}>Semester {s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleAdd}>Schedule</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Timetable Grid */}
            <div className="space-y-8">
                {days.map(day => {
                    const dayClasses = timetable.filter(t => t.day_of_week === day)
                    if (dayClasses.length === 0) return null

                    return (
                        <Card key={day} className="p-6 border border-border/50">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Calendar size={20} className="text-primary" /> {day}
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {dayClasses.map(t => (
                                    <Card key={t.id} className="p-4 bg-muted/30 border-l-4 border-l-primary relative group">
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(t.id)}>
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                        <div className="font-bold text-lg">{t.course_code}</div>
                                        <div className="text-sm text-muted-foreground mb-2">{t.course_name}</div>
                                        <div className="flex items-center gap-2 text-sm mt-2">
                                            <Clock size={14} /> {t.start_time.slice(0, 5)} - {t.end_time.slice(0, 5)}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm mt-1">
                                            <MapPin size={14} /> {t.room_number}
                                        </div>
                                        <div className="text-sm mt-2 font-medium text-primary">
                                            {t.faculty_name}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </Card>
                    )
                })}

                {timetable.length === 0 && !loading && (
                    <div className="text-center py-12 text-muted-foreground">
                        No classes scheduled yet. Click "Schedule Class" to begin.
                    </div>
                )}
            </div>
        </div>
    )
}
