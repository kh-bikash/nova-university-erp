"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Users, Bookmark } from "lucide-react"

interface Event {
  id: string
  name: string
  date: string
  time: string
  location: string
  category: "seminar" | "workshop" | "competition" | "cultural" | "sports"
  description: string
  attendees: number
  capacity: number
  status: "upcoming" | "ongoing" | "completed"
  registered: boolean
}

const mockEvents: Event[] = [
  {
    id: "1",
    name: "Tech Summit 2024",
    date: "2024-12-15",
    time: "10:00 AM",
    location: "Main Auditorium",
    category: "seminar",
    description: "Annual technology summit featuring latest innovations and industry experts.",
    attendees: 250,
    capacity: 500,
    status: "upcoming",
    registered: true,
  },
  {
    id: "2",
    name: "AI Workshop",
    date: "2024-12-01",
    time: "02:00 PM",
    location: "Computer Lab 1",
    category: "workshop",
    description: "Hands-on workshop on Artificial Intelligence and Machine Learning.",
    attendees: 45,
    capacity: 60,
    status: "upcoming",
    registered: false,
  },
  {
    id: "3",
    name: "Code Hackathon",
    date: "2024-11-25",
    time: "09:00 AM",
    location: "Open Court",
    category: "competition",
    description: "24-hour coding competition with exciting prizes.",
    attendees: 120,
    capacity: 150,
    status: "upcoming",
    registered: true,
  },
  {
    id: "4",
    name: "Cultural Fest",
    date: "2024-11-20",
    time: "06:00 PM",
    location: "University Ground",
    category: "cultural",
    description: "Annual cultural festival showcasing diverse talents and traditions.",
    attendees: 1000,
    capacity: 2000,
    status: "completed",
    registered: false,
  },
]

export default function EventsPage() {
  const { user } = useAuth()

  if (!user || !['student', 'admin', 'staff'].includes(user.role)) {
    return null
  }

  return (
    <ProtectedRoute>
      <EventsContent />
    </ProtectedRoute>
  )
}

function EventsContent() {
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [registeredEvents, setRegisteredEvents] = useState<string[]>(
    events.filter((e) => e.registered).map((e) => e.id),
  )

  const toggleRegistration = (id: string) => {
    if (registeredEvents.includes(id)) {
      setRegisteredEvents(registeredEvents.filter((x) => x !== id))
    } else {
      setRegisteredEvents([...registeredEvents, id])
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      seminar: "bg-blue-600",
      workshop: "bg-purple-600",
      competition: "bg-red-600",
      cultural: "bg-pink-600",
      sports: "bg-green-600",
    }
    return colors[category] || "bg-gray-600"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-600">Upcoming</Badge>
      case "ongoing":
        return <Badge className="bg-yellow-600">Ongoing</Badge>
      case "completed":
        return <Badge className="bg-green-600">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">University Events</h1>
          <p className="text-muted-foreground mt-1">Discover and register for events</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="registered">Registered</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="p-6 border border-border/50">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Event Info */}
                <div className="md:col-span-2">
                  <div className="flex gap-3 mb-3">
                    <div
                      className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getCategoryColor(event.category)}`}
                    >
                      {event.category}
                    </div>
                    {getStatusBadge(event.status)}
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{event.name}</h3>
                  <p className="text-muted-foreground mb-4">{event.description}</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-primary" />
                      <span>
                        {event.date} at {event.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-primary" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-primary" />
                      <span>
                        {event.attendees}/{event.capacity} Registered
                      </span>
                    </div>
                  </div>
                </div>

                {/* Registration */}
                <div className="flex flex-col justify-between">
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-primary">
                      {Math.round((event.attendees / event.capacity) * 100)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Seats Filled</p>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                    />
                  </div>
                  <Button
                    onClick={() => toggleRegistration(event.id)}
                    className="w-full mb-2"
                    variant={registeredEvents.includes(event.id) ? "outline" : "default"}
                  >
                    {registeredEvents.includes(event.id) ? "Unregister" : "Register"}
                  </Button>
                  <Button variant="ghost" className="w-full gap-2">
                    <Bookmark size={18} />
                    Save Event
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {events
            .filter((e) => e.status === "upcoming")
            .map((event) => (
              <Card key={event.id} className="p-6 border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{event.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.date} - {event.location}
                    </p>
                  </div>
                  <Button
                    onClick={() => toggleRegistration(event.id)}
                    variant={registeredEvents.includes(event.id) ? "outline" : "default"}
                  >
                    {registeredEvents.includes(event.id) ? "Registered" : "Register Now"}
                  </Button>
                </div>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="registered" className="space-y-4">
          {events
            .filter((e) => registeredEvents.includes(e.id))
            .map((event) => (
              <Card key={event.id} className="p-6 border border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{event.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.date} - {event.location}
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => toggleRegistration(event.id)}>
                    Unregister
                  </Button>
                </div>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="completed">
          {events
            .filter((e) => e.status === "completed")
            .map((event) => (
              <Card key={event.id} className="p-6 border border-border/50 opacity-75">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{event.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Completed - {event.attendees} attendees</p>
                  </div>
                  <Badge className="bg-green-600">Completed</Badge>
                </div>
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Events</p>
          <p className="text-3xl font-bold text-primary mt-2">{events.length}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Upcoming</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {events.filter((e) => e.status === "upcoming").length}
          </p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">You Registered</p>
          <p className="text-3xl font-bold text-accent mt-2">{registeredEvents.length}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {events.filter((e) => e.status === "completed").length}
          </p>
        </Card>
      </div>
    </div>
  )
}
