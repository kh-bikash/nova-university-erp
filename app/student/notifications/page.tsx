"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Bell, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import { format } from "date-fns"

export default function StudentNotificationsPage() {
    const { user } = useAuth()

    if (!user || user.role !== "student") {
        return null
    }

    return (
        <ProtectedRoute>
            <StudentNotificationsContent />
        </ProtectedRoute>
    )
}

function StudentNotificationsContent() {
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchNotifications() {
            try {
                const res = await fetch('/api/notifications')
                if (res.ok) {
                    setNotifications(await res.json())
                }
            } catch (error) {
                console.error("Failed to fetch notifications", error)
            } finally {
                setLoading(false)
            }
        }
        fetchNotifications()
    }, [])

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="text-yellow-600" size={24} />
            case 'error': return <AlertCircle className="text-red-600" size={24} />
            case 'success': return <CheckCircle className="text-green-600" size={24} />
            default: return <Info className="text-blue-600" size={24} />
        }
    }

    const getBgColor = (type: string) => {
        switch (type) {
            case 'warning': return 'bg-yellow-50 border-yellow-200'
            case 'error': return 'bg-red-50 border-red-200'
            case 'success': return 'bg-green-50 border-green-200'
            default: return 'bg-blue-50 border-blue-200'
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                <p className="text-muted-foreground mt-1">Updates and announcements</p>
            </div>

            <div className="space-y-4 max-w-4xl">
                {notifications.length === 0 && !loading ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                        No new notifications.
                    </div>
                ) : (
                    notifications.map(notif => (
                        <Card key={notif.id} className={`p-6 border ${getBgColor(notif.type)}`}>
                            <div className="flex gap-4">
                                <div className="mt-1">
                                    {getIcon(notif.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg text-foreground">{notif.title}</h3>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                            {format(new Date(notif.created_at), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                    <p className="text-foreground/80 leading-relaxed">{notif.message}</p>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
