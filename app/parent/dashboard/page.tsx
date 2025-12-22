"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, BookOpen, TrendingUp, AlertCircle, Phone, Mail } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function ParentDashboard() {
    const { user } = useAuth()

    if (!user || user.role !== "parent") return null

    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    )
}

function DashboardContent() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetch('/api/parent/dashboard')
                if (res.ok) {
                    setData(await res.json())
                }
            } catch (error) {
                console.error("Failed to load dashboard", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    if (loading) return <div className="p-8">Loading...</div>

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Parent Portal</h1>
                <p className="text-muted-foreground mt-2">Monitor your child's academic progress and activities.</p>
            </div>

            {!data?.children?.length ? (
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <User className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">No Students Linked</h3>
                        <p className="text-muted-foreground max-w-sm mt-2">
                            No student profiles are currently linked to your account. Please contact the administration to link your child's profile.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {data.children.map((child: any) => (
                        <Card key={child.id} className="overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="bg-muted/10 pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                            {child.name[0]}
                                        </div>
                                        <div>
                                            <CardTitle>{child.name}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 mt-1">
                                                <span>{child.enrollment_number}</span>
                                                <span>•</span>
                                                <span>{child.dept_code} - Sem {child.semester}</span>
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant={child.stats.pendingFees > 0 ? "destructive" : "default"}>
                                        {child.stats.pendingFees > 0 ? "Fees Due" : "Clear"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 pt-6">
                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* Attendance */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-muted-foreground">Attendance</span>
                                            <span className={`font-bold ${child.stats.attendance < 75 ? 'text-destructive' : 'text-green-600'}`}>
                                                {child.stats.attendance}%
                                            </span>
                                        </div>
                                        <Progress value={child.stats.attendance} className="h-2" />
                                        <p className="text-xs text-muted-foreground mt-1">Target: 75%</p>
                                    </div>

                                    {/* CGPA */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-muted-foreground">Performance (CGPA)</span>
                                            <span className="font-bold">{child.stats.cgpa}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm mt-1">
                                            <TrendingUp size={16} className="text-blue-500" />
                                            <span>Good standing</span>
                                        </div>
                                    </div>

                                    {/* Fees */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-muted-foreground">Fee Status</span>
                                            <span className="font-bold">{child.stats.pendingFees > 0 ? formatCurrency(child.stats.pendingFees) : "Paid"}</span>
                                        </div>
                                        {child.stats.pendingFees > 0 && (
                                            <Button size="sm" variant="outline" className="w-full mt-2 h-8 text-xs bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">
                                                Pay Now
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 border-t pt-6">
                                    <Button variant="ghost" className="justify-start gap-2 h-auto py-2">
                                        <Calendar size={18} className="text-muted-foreground" />
                                        <span>Timetable</span>
                                    </Button>
                                    <Button variant="ghost" className="justify-start gap-2 h-auto py-2">
                                        <BookOpen size={18} className="text-muted-foreground" />
                                        <span>Results</span>
                                    </Button>
                                    <Button variant="ghost" className="justify-start gap-2 h-auto py-2">
                                        <AlertCircle size={18} className="text-muted-foreground" />
                                        <span>Attendance</span>
                                    </Button>
                                    <Button variant="ghost" className="justify-start gap-2 h-auto py-2">
                                        <Mail size={18} className="text-muted-foreground" />
                                        <span>Contact Mentor</span>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
