"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X, AlertCircle, TrendingUp, AlertTriangle } from "lucide-react"

export default function StudentAttendancePage() {
    const { user } = useAuth()

    if (!user || user.role !== "student") {
        return null
    }

    return (
        <ProtectedRoute>
            <StudentAttendanceContent />
        </ProtectedRoute>
    )
}

function StudentAttendanceContent() {
    const [data, setData] = useState<{ summary: any[], history: any[] } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/attendance/student?t=' + Date.now())
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                }
            } catch (error) {
                console.error("Failed to fetch attendance", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return <div className="p-8 text-center">Loading attendance data...</div>
    }

    if (!data) {
        return <div className="p-8 text-center text-red-500">Failed to load data.</div>
    }

    const summary = data.courses || []
    const history = data.history || []

    const getPercentage = (present: number, total: number) => {
        if (total === 0) return 0
        return Math.round((present / total) * 100)
    }

    return (
        <div className="p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">My Attendance</h1>
                <p className="text-muted-foreground mt-1">Track your academic attendance and shortage alerts</p>
            </div>

            {/* Course Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {summary.map((course: any) => {
                    const percentage = getPercentage(parseInt(course.present_count), parseInt(course.total_classes))
                    const isLow = percentage < 75

                    return (
                        <Card key={course.course_code} className={`p-6 border-l-4 ${isLow ? 'border-l-red-500' : 'border-l-green-500'} shadow-sm`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{course.course_code}</h3>
                                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">{course.course_name}</p>
                                </div>
                                <Badge variant={isLow ? "destructive" : "default"} className="text-lg px-3 py-1">
                                    {percentage}%
                                </Badge>
                            </div>

                            <Progress value={percentage} className={`h-2 mb-4 ${isLow ? "bg-red-100" : "bg-green-100"}`} />

                            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                <div className="bg-green-50 p-2 rounded">
                                    <p className="font-bold text-green-700">{course.present_count}</p>
                                    <p className="text-xs text-green-600">Present</p>
                                </div>
                                <div className="bg-red-50 p-2 rounded">
                                    <p className="font-bold text-red-700">{course.absent_count}</p>
                                    <p className="text-xs text-red-600">Absent</p>
                                </div>
                                <div className="bg-gray-50 p-2 rounded">
                                    <p className="font-bold text-gray-700">{course.total_classes}</p>
                                    <p className="text-xs text-gray-600">Total</p>
                                </div>
                            </div>

                            {isLow && (
                                <div className="mt-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded border border-red-100">
                                    <AlertTriangle size={16} />
                                    <span>Attendance Shortage Warning!</span>
                                </div>
                            )}
                        </Card>
                    )
                })}
            </div>

            {/* Recent History */}
            <Card className="border border-border/50">
                <div className="p-6 border-b border-border/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <TrendingUp size={20} /> Recent Activity
                    </h2>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Course</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                    No attendance records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            history.map((record: any, i: number) => (
                                <TableRow key={i}>
                                    <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <span className="font-medium">{record.course_code}</span>
                                        <span className="text-muted-foreground ml-2 text-sm hidden md:inline">{record.course_name}</span>
                                    </TableCell>
                                    <TableCell>
                                        {record.status === 'present' && <Badge className="bg-green-600"><Check size={12} className="mr-1" /> Present</Badge>}
                                        {record.status === 'absent' && <Badge variant="destructive"><X size={12} className="mr-1" /> Absent</Badge>}
                                        {record.status === 'leave' && <Badge className="bg-yellow-600"><AlertCircle size={12} className="mr-1" /> Leave</Badge>}
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
