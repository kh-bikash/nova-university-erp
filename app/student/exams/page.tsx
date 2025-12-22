"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, Award, FileText } from "lucide-react"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function StudentExamsPage() {
    const { user } = useAuth()

    if (!user || user.role !== "student") {
        return null
    }

    return (
        <ProtectedRoute>
            <StudentExamsContent />
        </ProtectedRoute>
    )
}

function StudentExamsContent() {
    const [exams, setExams] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchExams() {
            try {
                const res = await fetch('/api/exams')
                if (res.ok) {
                    setExams(await res.json())
                }
            } catch (error) {
                console.error("Failed to fetch exams", error)
            } finally {
                setLoading(false)
            }
        }
        fetchExams()
    }, [])

    const upcomingExams = exams.filter(e => new Date(e.exam_date) >= new Date())
    const pastExams = exams.filter(e => new Date(e.exam_date) < new Date())

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">My Exams</h1>
                <p className="text-muted-foreground mt-1">View schedule and results</p>
            </div>

            <Tabs defaultValue="upcoming" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
                    <TabsTrigger value="results">Results & History</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {upcomingExams.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                No upcoming exams scheduled.
                            </div>
                        ) : (
                            upcomingExams.map(exam => (
                                <Card key={exam.id} className="p-6 border-l-4 border-l-primary">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{exam.course_code}</h3>
                                            <p className="text-sm text-muted-foreground">{exam.course_name}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-bold rounded">
                                            {exam.exam_name}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Calendar size={16} className="text-muted-foreground" />
                                            <span className="font-medium">{format(new Date(exam.exam_date), 'EEEE, MMM d, yyyy')}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Clock size={16} className="text-muted-foreground" />
                                            <span>{exam.start_time.slice(0, 5)} - {exam.end_time.slice(0, 5)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <FileText size={16} className="text-muted-foreground" />
                                            <span>Max Marks: {exam.max_marks}</span>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="results">
                    <Card className="border border-border/50">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Exam</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Marks Obtained</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pastExams.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No past exams found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pastExams.map(exam => (
                                        <TableRow key={exam.id}>
                                            <TableCell className="font-medium">{exam.exam_name}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{exam.course_code}</div>
                                                <div className="text-xs text-muted-foreground">{exam.course_name}</div>
                                            </TableCell>
                                            <TableCell>{format(new Date(exam.exam_date), 'MMM d, yyyy')}</TableCell>
                                            <TableCell>
                                                {/* Placeholder for marks - would need to fetch from exam_results */}
                                                <span className="text-muted-foreground italic">Pending</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${exam.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {exam.status === 'published' ? 'Published' : 'Completed'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
