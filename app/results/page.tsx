"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Award, TrendingUp, BookOpen } from "lucide-react"
import { useState, useEffect } from "react"

export default function ResultsPage() {
    const { user } = useAuth()

    if (!user || user.role !== "student") {
        return null
    }

    return (
        <ProtectedRoute>
            <ResultsContent />
        </ProtectedRoute>
    )
}

function ResultsContent() {
    const [data, setData] = useState<{
        cgpa: number
        totalCredits: number
        semesters: any[]
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/student/cgpa')
                if (res.ok) {
                    const json = await res.json()
                    setData(json)
                }
            } catch (error) {
                console.error("Failed to fetch results", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground">Loading academic performance...</div>
    }

    if (!data) {
        return <div className="p-8 text-center text-muted-foreground">No academic data available.</div>
    }

    const { cgpa, totalCredits, semesters } = data

    return (
        <div className="p-6 lg:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">My Academic Performance</h1>
                <p className="text-muted-foreground mt-1">CGPA and Semester Grades</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 bg-primary/5 border border-primary/20 flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                        <Award size={32} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Cumulative GPA</p>
                        <h2 className="text-3xl font-bold text-primary">{cgpa}</h2>
                    </div>
                </Card>

                <Card className="p-6 border border-border/50 flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-full text-green-700">
                        <BookOpen size={32} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Total Credits</p>
                        <h2 className="text-3xl font-bold">{totalCredits}</h2>
                    </div>
                </Card>

                <Card className="p-6 border border-border/50 flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-full text-blue-700">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">Performance Trend</p>
                        <h2 className="text-lg font-bold text-green-600">
                            {semesters.length > 1
                                ? (semesters[semesters.length - 1].sgpa - semesters[semesters.length - 2].sgpa > 0 ? "+" : "") +
                                (semesters[semesters.length - 1].sgpa - semesters[semesters.length - 2].sgpa).toFixed(2)
                                : "N/A"}
                        </h2>
                    </div>
                </Card>
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">Semester Wise Breakdown</h2>
            <div className="space-y-6">
                {semesters.map((sem) => (
                    <Card key={sem.sem} className="overflow-hidden border border-border/50">
                        <div className="bg-muted/30 p-4 flex justify-between items-center border-b border-border/50">
                            <h3 className="font-bold text-lg">Semester {sem.sem}</h3>
                            <div className="flex gap-4 text-sm">
                                <span className="font-medium">SGPA: <span className="text-primary">{sem.sgpa}</span></span>
                                <span className="text-muted-foreground">Credits: {sem.credits}</span>
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course Code</TableHead>
                                    <TableHead>Course Name</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Points</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sem.courses.map((course: any) => (
                                    <TableRow key={course.code}>
                                        <TableCell className="font-medium">{course.code}</TableCell>
                                        <TableCell>{course.name}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${course.grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                                                course.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {course.grade}
                                            </span>
                                        </TableCell>
                                        <TableCell>{course.points}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                ))}
            </div>
        </div>
    )
}
