"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Bus, MapPin, Clock, Phone, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TransportPage() {
    const { user } = useAuth()

    if (!user || (user.role !== "student" && user.role !== "faculty")) {
        return null
    }

    return (
        <ProtectedRoute>
            <TransportContent />
        </ProtectedRoute>
    )
}

function TransportContent() {
    const toast = useToast()
    const [subscription, setSubscription] = useState<any>(null)
    const [routes, setRoutes] = useState<any[]>([])
    const [stops, setStops] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [subForm, setSubForm] = useState({ route_id: "", stop_id: "", academic_year: "2024-2025" })
    const [isSubDialogOpen, setIsSubDialogOpen] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const [sRes, rRes] = await Promise.all([
                fetch('/api/transport/subscription'),
                fetch('/api/transport/routes')
            ])

            if (sRes.ok) {
                const data = await sRes.json()
                setSubscription(data)
            }
            if (rRes.ok) setRoutes(await rRes.json())
        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setLoading(false)
        }
    }

    const handleFetchStops = async (routeId: string) => {
        setSubForm({ ...subForm, route_id: routeId })
        const res = await fetch(`/api/transport/routes?route_id=${routeId}`)
        if (res.ok) {
            setStops(await res.json())
        }
    }

    const handleSubscribe = async () => {
        try {
            const res = await fetch('/api/transport/subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subForm)
            })
            if (res.ok) {
                toast.toast({ title: "Success", description: "Subscribed successfully" })
                setIsSubDialogOpen(false)
                fetchData()
            } else {
                const data = await res.json()
                toast.toast({ title: "Error", description: data.error, variant: "destructive" })
            }
        } catch (error) {
            toast.toast({ title: "Error", description: "Failed to subscribe", variant: "destructive" })
        }
    }

    if (loading) return <div className="p-8">Loading...</div>

    if (!subscription) {
        return (
            <div className="p-6 lg:p-8">
                <h1 className="text-3xl font-bold text-foreground mb-6">My Transport</h1>
                <Card className="p-12 text-center border-dashed">
                    <Bus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Active Subscription</h3>
                    <p className="text-muted-foreground mb-6">You have not subscribed to any transport route.</p>

                    <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
                        <DialogTrigger asChild><Button>Subscribe Now</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Subscribe to Transport</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                                <div><Label>Route</Label>
                                    <Select value={subForm.route_id} onValueChange={handleFetchStops}>
                                        <SelectTrigger><SelectValue placeholder="Select Route" /></SelectTrigger>
                                        <SelectContent>
                                            {routes.map(r => <SelectItem key={r.id} value={r.id}>{r.route_number} - {r.route_name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div><Label>Stop</Label>
                                    <Select value={subForm.stop_id} onValueChange={v => setSubForm({ ...subForm, stop_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Stop" /></SelectTrigger>
                                        <SelectContent>
                                            {stops.map(s => <SelectItem key={s.id} value={s.id}>{s.stop_name} ({s.pickup_time})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleSubscribe}>Confirm Subscription</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">My Transport</h1>
                <p className="text-muted-foreground mt-1">Route details and timings</p>
            </div>

            <Card className="p-6 border-l-4 border-l-primary">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <Bus size={24} className="text-primary" /> {subscription.route_name}
                        </h3>
                        <p className="text-muted-foreground">Vehicle: {subscription.vehicle_number}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Active</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted/30 rounded-full"><MapPin size={18} /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pickup Stop</p>
                                <p className="font-medium">{subscription.stop_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted/30 rounded-full"><Clock size={18} /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Pickup Time</p>
                                <p className="font-medium">{subscription.pickup_time}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted/30 rounded-full"><Users size={18} /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Driver Name</p>
                                <p className="font-medium">{subscription.driver_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted/30 rounded-full"><Phone size={18} /></div>
                            <div>
                                <p className="text-sm text-muted-foreground">Driver Contact</p>
                                <p className="font-medium">{subscription.driver_contact}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
