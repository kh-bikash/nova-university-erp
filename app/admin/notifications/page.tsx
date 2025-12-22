"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Send, Users, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function AdminNotificationsPage() {
    const { user } = useAuth()

    if (!user || user.role !== "admin") {
        return null
    }

    return (
        <ProtectedRoute>
            <AdminNotificationsContent />
        </ProtectedRoute>
    )
}

function AdminNotificationsContent() {
    const toast = useToast()
    const [notifications, setNotifications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    const [formData, setFormData] = useState({
        title: "",
        message: "",
        type: "info",
        recipient_role: "all", // all, student, faculty, staff
        recipient_id: "" // Optional: for specific user
    })

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
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

    const handleSend = async () => {
        if (!formData.title || !formData.message) {
            toast.toast({ title: "Error", description: "Title and message are required", variant: "destructive" })
            return
        }

        setSending(true)
        try {
            const payload = {
                ...formData,
                recipient_role: formData.recipient_role === 'all' ? null : formData.recipient_role,
                recipient_id: formData.recipient_id || null
            }

            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                toast.toast({ title: "Success", description: "Notification sent successfully" })
                setFormData({
                    title: "",
                    message: "",
                    type: "info",
                    recipient_role: "all",
                    recipient_id: ""
                })
                fetchNotifications()
            } else {
                toast.toast({ title: "Error", description: "Failed to send notification", variant: "destructive" })
            }
        } catch (error) {
            console.error("Error sending notification", error)
            toast.toast({ title: "Error", description: "Failed to send notification", variant: "destructive" })
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                <p className="text-muted-foreground mt-1">Send announcements and alerts</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Send Notification Form */}
                <Card className="p-6 border border-border/50 lg:col-span-1 h-fit">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Send size={20} /> Send Notification
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <Label>Title</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Holiday Announcement"
                            />
                        </div>
                        <div>
                            <Label>Message</Label>
                            <Textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Type your message here..."
                                rows={4}
                            />
                        </div>
                        <div>
                            <Label>Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="warning">Warning</SelectItem>
                                    <SelectItem value="success">Success</SelectItem>
                                    <SelectItem value="error">Urgent</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Recipient Group</Label>
                            <Select
                                value={formData.recipient_role}
                                onValueChange={(val) => setFormData({ ...formData, recipient_role: val })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="student">Students</SelectItem>
                                    <SelectItem value="faculty">Faculty</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button className="w-full gap-2" onClick={handleSend} disabled={sending}>
                            <Send size={16} /> {sending ? 'Sending...' : 'Send Notification'}
                        </Button>
                    </div>
                </Card>

                {/* Recent Notifications List */}
                <Card className="p-6 border border-border/50 lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Bell size={20} /> Recent Notifications
                    </h2>
                    <div className="space-y-4">
                        {notifications.length === 0 && !loading ? (
                            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                No notifications found.
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className={`p-4 rounded-lg border ${notif.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                        notif.type === 'error' ? 'bg-red-50 border-red-200' :
                                            notif.type === 'success' ? 'bg-green-50 border-green-200' :
                                                'bg-blue-50 border-blue-200'
                                    }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-foreground">{notif.title}</h3>
                                        <span className="text-xs text-muted-foreground">
                                            {format(new Date(notif.created_at), 'MMM d, h:mm a')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-foreground/80 mb-2">{notif.message}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Users size={12} />
                                        <span>To: {notif.recipient_role ? notif.recipient_role.toUpperCase() : 'EVERYONE'}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
