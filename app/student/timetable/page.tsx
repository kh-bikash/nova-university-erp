"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, MapPin } from "lucide-react"

export default function StudentTimetablePage() {
    const { user } = useAuth()

    if (!user || user.role !== "student") {
        return null
    }

    return (
        <ProtectedRoute>
            <StudentTimetableContent />
        </ProtectedRoute>
    )
}

function StudentTimetableContent() {
    const [timetable, setTimetable] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTimetable() {
            try {
                const res = await fetch('/api/student/timetable')
                if (res.ok) {
                    const json = await res.json()
                    if (json.success) {
                        setTimetable(json.data)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch timetable", error)
            } finally {
                setLoading(false)
            }
        }
        fetchTimetable()
    }, [])

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading timetable...</div>
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">My Timetable</h1>
                <p className="text-muted-foreground mt-1">View your weekly class schedule</p>
            </div>

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
                                    <Card key={t.id} className="p-4 bg-muted/30 border-l-4 border-l-primary hover:shadow-md transition-shadow">
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

                {timetable.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                        No classes scheduled for you.
                    </div>
                )}
            </div>
        </div>
    )
}
