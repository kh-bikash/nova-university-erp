
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, BookOpen } from "lucide-react"

interface Course {
    id: string
    course_code: string
    course_name: string
    credits: number
    semester: number
    department_name: string
    faculty_name: string | null
}

export default function AcademicRegistrationPage() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [enrolling, setEnrolling] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/student/registration/available')
            const json = await res.json()
            if (json.success) {
                setCourses(json.data)
            } else {
                toast({
                    title: "Error",
                    description: json.error || "Failed to fetch courses",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error("Failed to fetch courses:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleEnroll = async (courseId: string) => {
        setEnrolling(courseId)
        try {
            const res = await fetch('/api/student/registration/enroll', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId }),
            })

            const json = await res.json()

            if (json.success) {
                toast({
                    title: "Success",
                    description: "Successfully enrolled in course",
                })
                // Remove from list
                setCourses(prev => prev.filter(c => c.id !== courseId))
            } else {
                toast({
                    title: "Error",
                    description: json.error || "Failed to enroll",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
        } finally {
            setEnrolling(null)
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
                    <h1 className="text-3xl font-bold tracking-tight">Academic Registration</h1>
                    <p className="text-muted-foreground mt-2">
                        Register for courses for the upcoming academic session.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {courses.length === 0 ? (
                    <Card className="bg-muted/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                            <BookOpen className="h-12 w-12 mb-4 opacity-50" />
                            <h3 className="font-semibold text-lg">No Courses Available</h3>
                            <p>You have registered for all available courses or none are open yet.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {courses.map((course) => (
                            <Card key={course.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline">{course.course_code}</Badge>
                                        <Badge>{course.credits} Credits</Badge>
                                    </div>
                                    <CardTitle className="line-clamp-2">{course.course_name}</CardTitle>
                                    <CardDescription>{course.department_name}</CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto pt-0">
                                    <div className="mb-4 text-sm text-muted-foreground">
                                        <div className="flex justify-between py-1 border-b border-border/50">
                                            <span>Semester</span>
                                            <span className="font-medium text-foreground">{course.semester}</span>
                                        </div>
                                        <div className="flex justify-between py-1 pt-2">
                                            <span>Faculty</span>
                                            <span className="font-medium text-foreground">{course.faculty_name || "TBA"}</span>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full"
                                        onClick={() => handleEnroll(course.id)}
                                        disabled={enrolling === course.id}
                                    >
                                        {enrolling === course.id ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Plus className="mr-2 h-4 w-4" />
                                        )}
                                        Register Course
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
