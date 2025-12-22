"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function InfrastructurePage() {
    const { user } = useAuth()

    if (!user || (user.role !== "faculty" && user.role !== "admin")) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">Access Restricted</h1>
                <p className="text-muted-foreground">Only Faculty and Admin can access Infrastructure Management.</p>
            </div>
        )
    }

    return (
        <ProtectedRoute>
            <InfrastructureContent />
        </ProtectedRoute>
    )
}

function InfrastructureContent() {
    const toast = useToast()
    const [tickets, setTickets] = useState<any[]>([])
    const [assets, setAssets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [ticketForm, setTicketForm] = useState({ asset_id: "", title: "", description: "", priority: "medium" })
    const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const [tRes, aRes] = await Promise.all([
                fetch('/api/infrastructure/maintenance'),
                fetch('/api/infrastructure/assets')
            ])

            if (tRes.ok) setTickets(await tRes.json())
            if (aRes.ok) setAssets(await aRes.json())
        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTicket = async () => {
        try {
            const res = await fetch('/api/infrastructure/maintenance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketForm)
            })
            if (res.ok) {
                toast.toast({ title: "Success", description: "Ticket raised" })
                setIsTicketDialogOpen(false)
                setTicketForm({ asset_id: "", title: "", description: "", priority: "medium" })
                fetchData()
            } else {
                const data = await res.json()
                toast.toast({ title: "Error", description: data.error, variant: "destructive" })
            }
        } catch (error) {
            toast.toast({ title: "Error", description: "Failed to raise ticket", variant: "destructive" })
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Infrastructure Support</h1>
                    <p className="text-muted-foreground mt-1">Report maintenance issues</p>
                </div>
                <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
                    <DialogTrigger asChild><Button variant="destructive"><AlertTriangle size={16} className="mr-2" /> Report Issue</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Report Maintenance Issue</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label>Asset (Optional)</Label>
                                <Select value={ticketForm.asset_id} onValueChange={v => setTicketForm({ ...ticketForm, asset_id: v })}>
                                    <SelectTrigger><SelectValue placeholder="Select Asset (if applicable)" /></SelectTrigger>
                                    <SelectContent>
                                        {assets.map(a => <SelectItem key={a.id} value={a.id}>{a.name} ({a.location})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Issue Title</Label>
                                <Input value={ticketForm.title} onChange={e => setTicketForm({ ...ticketForm, title: e.target.value })} placeholder="e.g., AC not cooling" />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea value={ticketForm.description} onChange={e => setTicketForm({ ...ticketForm, description: e.target.value })} placeholder="Details about the issue..." />
                            </div>
                            <div>
                                <Label>Priority</Label>
                                <Select value={ticketForm.priority} onValueChange={v => setTicketForm({ ...ticketForm, priority: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleCreateTicket}>Submit Ticket</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {tickets.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground">
                        No tickets raised.
                    </Card>
                ) : (
                    tickets.map(ticket => (
                        <Card key={ticket.id} className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        {ticket.title}
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${ticket.priority === 'critical' ? 'border-red-200 text-red-700 bg-red-50' :
                                                ticket.priority === 'high' ? 'border-orange-200 text-orange-700 bg-orange-50' : 'border-blue-200 text-blue-700 bg-blue-50'
                                            }`}>
                                            {ticket.priority}
                                        </span>
                                    </h3>
                                    <p className="text-muted-foreground mt-1">{ticket.description}</p>
                                    {ticket.asset_name && (
                                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                                            <AlertTriangle size={12} /> {ticket.asset_name} - {ticket.asset_location}
                                        </p>
                                    )}
                                    {ticket.resolution_notes && (
                                        <div className="mt-3 p-2 bg-green-50 text-green-800 text-sm rounded border border-green-100">
                                            <strong>Resolution:</strong> {ticket.resolution_notes}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {ticket.status.toUpperCase()}
                                    </span>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
