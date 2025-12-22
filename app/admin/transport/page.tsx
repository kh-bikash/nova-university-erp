"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Bus, MapPin, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminTransportPage() {
    const { user } = useAuth()

    if (!user || user.role !== "admin") {
        return null
    }

    return (
        <ProtectedRoute>
            <AdminTransportContent />
        </ProtectedRoute>
    )
}

function AdminTransportContent() {
    const toast = useToast()
    const [routes, setRoutes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Dialogs
    const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false)
    const [isStopDialogOpen, setIsStopDialogOpen] = useState(false)

    // Forms
    const [routeForm, setRouteForm] = useState({ route_number: "", route_name: "", driver_name: "", driver_contact: "", vehicle_number: "", capacity: "40" })
    const [stopForm, setStopForm] = useState({ route_id: "", stop_name: "", pickup_time: "", fee_amount: "0" })

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const res = await fetch('/api/transport/routes')
            if (res.ok) setRoutes(await res.json())
        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateRoute = async () => {
        try {
            const res = await fetch('/api/transport/routes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'route', ...routeForm })
            })
            if (res.ok) {
                toast.toast({ title: "Success", description: "Route created" })
                setIsRouteDialogOpen(false)
                fetchData()
            }
        } catch (error) {
            toast.toast({ title: "Error", description: "Failed to create route", variant: "destructive" })
        }
    }

    const handleCreateStop = async () => {
        try {
            const res = await fetch('/api/transport/routes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'stop', ...stopForm })
            })
            if (res.ok) {
                toast.toast({ title: "Success", description: "Stop added" })
                setIsStopDialogOpen(false)
                fetchData()
            }
        } catch (error) {
            toast.toast({ title: "Error", description: "Failed to add stop", variant: "destructive" })
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Transport Management</h1>
                    <p className="text-muted-foreground mt-1">Manage bus routes and stops</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={isRouteDialogOpen} onOpenChange={setIsRouteDialogOpen}>
                        <DialogTrigger asChild><Button><Plus size={16} className="mr-2" /> Add Route</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add New Route</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                                <div><Label>Route Number</Label><Input value={routeForm.route_number} onChange={e => setRouteForm({ ...routeForm, route_number: e.target.value })} /></div>
                                <div><Label>Route Name</Label><Input value={routeForm.route_name} onChange={e => setRouteForm({ ...routeForm, route_name: e.target.value })} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Driver Name</Label><Input value={routeForm.driver_name} onChange={e => setRouteForm({ ...routeForm, driver_name: e.target.value })} /></div>
                                    <div><Label>Driver Contact</Label><Input value={routeForm.driver_contact} onChange={e => setRouteForm({ ...routeForm, driver_contact: e.target.value })} /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Vehicle No.</Label><Input value={routeForm.vehicle_number} onChange={e => setRouteForm({ ...routeForm, vehicle_number: e.target.value })} /></div>
                                    <div><Label>Capacity</Label><Input type="number" value={routeForm.capacity} onChange={e => setRouteForm({ ...routeForm, capacity: e.target.value })} /></div>
                                </div>
                                <Button onClick={handleCreateRoute}>Create Route</Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={isStopDialogOpen} onOpenChange={setIsStopDialogOpen}>
                        <DialogTrigger asChild><Button variant="outline"><Plus size={16} className="mr-2" /> Add Stop</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add Stop to Route</DialogTitle></DialogHeader>
                            <div className="space-y-4 py-4">
                                <div><Label>Route</Label>
                                    <Select value={stopForm.route_id} onValueChange={v => setStopForm({ ...stopForm, route_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Route" /></SelectTrigger>
                                        <SelectContent>
                                            {routes.map(r => <SelectItem key={r.id} value={r.id}>{r.route_number} - {r.route_name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div><Label>Stop Name</Label><Input value={stopForm.stop_name} onChange={e => setStopForm({ ...stopForm, stop_name: e.target.value })} /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><Label>Pickup Time</Label><Input type="time" value={stopForm.pickup_time} onChange={e => setStopForm({ ...stopForm, pickup_time: e.target.value })} /></div>
                                    <div><Label>Fee Amount</Label><Input type="number" value={stopForm.fee_amount} onChange={e => setStopForm({ ...stopForm, fee_amount: e.target.value })} /></div>
                                </div>
                                <Button onClick={handleCreateStop}>Add Stop</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-6">
                {routes.map(route => (
                    <Card key={route.id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <Bus size={20} className="text-primary" /> {route.route_number}: {route.route_name}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Driver: {route.driver_name} ({route.driver_contact}) | Vehicle: {route.vehicle_number}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                    <MapPin size={16} /> {route.stop_count} Stops
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users size={16} /> {route.active_subscribers} / {route.capacity}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
