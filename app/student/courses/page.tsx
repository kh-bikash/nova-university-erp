
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, BookOpen, GraduationCap, Calendar } from "lucide-react"

export default function StudentCoursesPage() {
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/student/courses')
            const json = await res.json()
            if (json.success) {
                setCourses(json.data)
            }
        } catch (error) {
            console.error("Failed to fetch courses:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                    <p className="text-muted-foreground mt-2">
                        View your enrolled courses and academic progress.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {courses.length === 0 ? (
                    <Card className="bg-muted/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                            <BookOpen className="h-12 w-12 mb-4 opacity-50" />
                            <h3 className="font-semibold text-lg">No Courses Enrolled</h3>
                            <p>Go to Academic Registration to enroll in courses.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Card key={course.id} className="flex flex-col border-l-4 border-l-primary">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="secondary">{course.course_code}</Badge>
                                        <Badge variant="outline">{course.credits} Credits</Badge>
                                    </div>
                                    <CardTitle className="line-clamp-2">{course.course_name}</CardTitle>
                                </CardHeader>
                                <CardContent className="mt-auto space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <GraduationCap className="h-3 w-3" /> Grade
                                            </span>
                                            <span className="font-medium">{course.grade || 'Ongoing'}</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" /> Year
                                            </span>
                                            <span className="font-medium">{course.academic_year}</span>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-muted-foreground">Faculty</p>
                                        <p className="font-medium">{course.faculty_name || "Assigned by Dept"}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
