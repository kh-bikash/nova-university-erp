"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Bell, Mail, Calendar, AlertCircle, CheckCircle, Trash2, Archive, Search } from "lucide-react"

interface Notification {
  id: string
  type: "grade" | "attendance" | "fee" | "event" | "announcement" | "message"
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: "high" | "medium" | "low"
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "grade",
    title: "Grades Posted",
    message: "Your grades for CS401 Mid-Term have been posted. Check your results.",
    timestamp: "2 hours ago",
    read: false,
    priority: "high",
  },
  {
    id: "2",
    type: "attendance",
    title: "Low Attendance Alert",
    message: "Your attendance in IT401 is below 75%. Contact your instructor.",
    timestamp: "5 hours ago",
    read: false,
    priority: "high",
  },
  {
    id: "3",
    type: "fee",
    title: "Fee Payment Reminder",
    message: "Your fee payment is due by November 30, 2024.",
    timestamp: "1 day ago",
    read: true,
    priority: "medium",
  },
  {
    id: "4",
    type: "event",
    title: "Seminar Scheduled",
    message: "Tech Summit 2024 is scheduled for December 15th at 10 AM.",
    timestamp: "2 days ago",
    read: true,
    priority: "low",
  },
  {
    id: "5",
    type: "announcement",
    title: "Holiday Announcement",
    message: "University will be closed for Diwali holidays from Nov 1-3.",
    timestamp: "3 days ago",
    read: true,
    priority: "medium",
  },
]

export default function NotificationsPage() {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  )
}

function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  const filteredNotifications = notifications.filter(
    (n) =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      grade: "bg-blue-600",
      attendance: "bg-orange-600",
      fee: "bg-red-600",
      event: "bg-purple-600",
      announcement: "bg-green-600",
      message: "bg-indigo-600",
    }
    return colors[type] || "bg-gray-600"
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      grade: <CheckCircle size={18} />,
      attendance: <AlertCircle size={18} />,
      fee: <Mail size={18} />,
      event: <Calendar size={18} />,
      announcement: <Bell size={18} />,
      message: <Mail size={18} />,
    }
    return icons[type] || <Bell size={18} />
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const toggleNotificationSelection = (id: string) => {
    setSelectedNotifications((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with important updates and announcements</p>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-destructive text-lg px-3 py-2">
            <Bell size={16} className="mr-2" />
            {unreadCount} Unread
          </Badge>
        )}
      </div>

      {/* Search */}
      <Card className="p-4 border border-border/50">
        <div className="flex items-center gap-2">
          <Search size={20} className="text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0"
          />
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <Card className="p-4 border border-primary/50 bg-primary/5">
          <div className="flex justify-between items-center">
            <p className="font-medium text-foreground">{selectedNotifications.length} notification(s) selected</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                <Archive size={16} />
                Archive
              </Button>
              <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                <Trash2 size={16} />
                Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelectedNotifications([])}>
                Clear
              </Button>
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="important">Important</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-4 border cursor-pointer transition-colors ${
                notif.read ? "border-border/50" : "border-primary/30 bg-primary/5"
              }`}
            >
              <div className="flex gap-4">
                <Checkbox
                  checked={selectedNotifications.includes(notif.id)}
                  onCheckedChange={() => toggleNotificationSelection(notif.id)}
                  className="mt-1"
                />
                <div onClick={() => markAsRead(notif.id)} className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg text-white ${getTypeColor(notif.type)}`}>
                      {getTypeIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{notif.title}</h4>
                        {!notif.read && <div className="w-2 h-2 bg-destructive rounded-full" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{notif.timestamp}</p>
                    </div>
                    <Badge
                      variant={
                        notif.priority === "high"
                          ? "destructive"
                          : notif.priority === "medium"
                            ? "default"
                            : "secondary"
                      }
                    >
                      {notif.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground">{notif.message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(notif.id)
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3">
          {filteredNotifications
            .filter((n) => !n.read)
            .map((notif) => (
              <Card key={notif.id} className="p-4 border border-primary/30 bg-primary/5">
                <div className="flex gap-4">
                  <div className={`p-2 rounded-lg text-white ${getTypeColor(notif.type)}`}>
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="flex-1" onClick={() => markAsRead(notif.id)}>
                    <h4 className="font-semibold text-foreground">{notif.title}</h4>
                    <p className="text-sm text-foreground mt-1">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{notif.timestamp}</p>
                  </div>
                </div>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="important">
          {filteredNotifications
            .filter((n) => n.priority === "high")
            .map((notif) => (
              <Card key={notif.id} className="p-4 border border-destructive/30 mb-3">
                <div className="flex gap-4">
                  <div className={`p-2 rounded-lg text-white ${getTypeColor(notif.type)}`}>
                    {getTypeIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">{notif.title}</h4>
                    <p className="text-sm text-foreground mt-1">{notif.message}</p>
                  </div>
                </div>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="archived">
          <Card className="p-8 text-center">
            <Archive size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No archived notifications</p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Notifications</p>
          <p className="text-3xl font-bold text-primary mt-2">{notifications.length}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Unread</p>
          <p className="text-3xl font-bold text-destructive mt-2">{unreadCount}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">High Priority</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {notifications.filter((n) => n.priority === "high").length}
          </p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Announcements</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {notifications.filter((n) => n.type === "announcement").length}
          </p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Alerts</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {notifications.filter((n) => n.type === "fee" || n.type === "attendance").length}
          </p>
        </Card>
      </div>
    </div>
  )
}
