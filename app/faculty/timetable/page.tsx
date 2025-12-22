"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, MapPin } from "lucide-react"

export default function FacultyTimetablePage() {
    const { user } = useAuth()

    if (!user || user.role !== "faculty") {
        return null
    }

    return (
        <ProtectedRoute>
            <FacultyTimetableContent />
        </ProtectedRoute>
    )
}

function FacultyTimetableContent() {
    const [timetable, setTimetable] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    useEffect(() => {
        async function fetchTimetable() {
            if (!user?.id) return
            try {
                // We need to fetch faculty ID first, or API handles user_id lookup?
                // The API expects faculty_id. But we can modify API to handle 'me' for faculty too.
                // Or we fetch faculty profile first.
                // Let's fetch faculty profile first.
                const fRes = await fetch('/api/faculty') // This returns list, not my profile.
                // Wait, /api/faculty returns list.
                // We should use a dedicated profile endpoint or filter.
                // Actually, let's try to fetch timetable with faculty_id derived from user.
                // But we don't have faculty_id in user context.
                // Let's modify API to support faculty_id='me' similar to student_id='me'.

                // For now, let's assume API supports faculty_id='me' (I will add it).
                const res = await fetch('/api/timetable?faculty_id=me')
                if (res.ok) {
                    setTimetable(await res.json())
                }
            } catch (error) {
                console.error("Failed to fetch timetable", error)
            } finally {
                setLoading(false)
            }
        }
        fetchTimetable()
    }, [user])

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading schedule...</div>
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">My Schedule</h1>
                <p className="text-muted-foreground mt-1">View your weekly teaching schedule</p>
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
                                    <Card key={t.id} className="p-4 bg-muted/30 border-l-4 border-l-accent hover:shadow-md transition-shadow">
                                        <div className="font-bold text-lg">{t.course_code}</div>
                                        <div className="text-sm text-muted-foreground mb-2">{t.course_name}</div>
                                        <div className="flex items-center gap-2 text-sm mt-2">
                                            <Clock size={14} /> {t.start_time.slice(0, 5)} - {t.end_time.slice(0, 5)}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm mt-1">
                                            <MapPin size={14} /> {t.room_number}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </Card>
                    )
                })}

                {timetable.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                        No classes scheduled.
                    </div>
                )}
            </div>
        </div>
    )
}
