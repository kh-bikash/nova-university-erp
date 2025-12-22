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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Monitor, Wrench, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function AdminInfrastructurePage() {
    const { user } = useAuth()

    if (!user || user.role !== "admin") {
        return null
    }

    return (
        <ProtectedRoute>
            <AdminInfrastructureContent />
        </ProtectedRoute>
    )
}

function AdminInfrastructureContent() {
    const toast = useToast()
    const [assets, setAssets] = useState<any[]>([])
    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Dialogs
    const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false)
    const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false)

    // Forms
    const [assetForm, setAssetForm] = useState({ name: "", type: "equipment", location: "", purchase_date: "", warranty_expiry: "" })
    const [ticketUpdateForm, setTicketUpdateForm] = useState({ id: "", status: "", assigned_to: "", resolution_notes: "" })

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const [aRes, tRes] = await Promise.all([
                fetch('/api/infrastructure/assets'),
                fetch('/api/infrastructure/maintenance')
            ])

            if (aRes.ok) setAssets(await aRes.json())
            if (tRes.ok) setTickets(await tRes.json())
        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateAsset = async () => {
        try {
            const res = await fetch('/api/infrastructure/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assetForm)
            })
            if (res.ok) {
                toast.toast({ title: "Success", description: "Asset added" })
                setIsAssetDialogOpen(false)
                fetchData()
            }
        } catch (error) {
            toast.toast({ title: "Error", description: "Failed to add asset", variant: "destructive" })
        }
    }

    const handleUpdateTicket = async () => {
        try {
            const res = await fetch('/api/infrastructure/maintenance', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ticketUpdateForm)
            })
            if (res.ok) {
                toast.toast({ title: "Success", description: "Ticket updated" })
                setIsTicketDialogOpen(false)
                fetchData()
            }
        } catch (error) {
            toast.toast({ title: "Error", description: "Failed to update ticket", variant: "destructive" })
        }
    }

    const openTicketDialog = (ticket: any) => {
        setTicketUpdateForm({
            id: ticket.id,
            status: ticket.status,
            assigned_to: ticket.assigned_to || "",
            resolution_notes: ticket.resolution_notes || ""
        })
        setIsTicketDialogOpen(true)
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Infrastructure</h1>
                    <p className="text-muted-foreground mt-1">Manage assets and maintenance</p>
                </div>
            </div>

            <Tabs defaultValue="assets" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="assets">Asset Registry</TabsTrigger>
                    <TabsTrigger value="maintenance">Maintenance Board</TabsTrigger>
                </TabsList>

                <TabsContent value="assets" className="space-y-4">
                    <div className="flex justify-end">
                        <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
                            <DialogTrigger asChild><Button><Plus size={16} className="mr-2" /> Add Asset</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add New Asset</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div><Label>Name</Label><Input value={assetForm.name} onChange={e => setAssetForm({ ...assetForm, name: e.target.value })} /></div>
                                    <div><Label>Type</Label>
                                        <Select value={assetForm.type} onValueChange={v => setAssetForm({ ...assetForm, type: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="equipment">Equipment</SelectItem>
                                                <SelectItem value="furniture">Furniture</SelectItem>
                                                <SelectItem value="room">Room/Facility</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div><Label>Location</Label><Input value={assetForm.location} onChange={e => setAssetForm({ ...assetForm, location: e.target.value })} /></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><Label>Purchase Date</Label><Input type="date" value={assetForm.purchase_date} onChange={e => setAssetForm({ ...assetForm, purchase_date: e.target.value })} /></div>
                                        <div><Label>Warranty Expiry</Label><Input type="date" value={assetForm.warranty_expiry} onChange={e => setAssetForm({ ...assetForm, warranty_expiry: e.target.value })} /></div>
                                    </div>
                                    <Button onClick={handleCreateAsset}>Add Asset</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Warranty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assets.map(asset => (
                                    <TableRow key={asset.id}>
                                        <TableCell className="font-medium">{asset.name}</TableCell>
                                        <TableCell className="capitalize">{asset.type}</TableCell>
                                        <TableCell>{asset.location}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${asset.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {asset.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{asset.warranty_expiry ? format(new Date(asset.warranty_expiry), 'MMM d, yyyy') : '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="maintenance">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Issue</TableHead>
                                    <TableHead>Asset</TableHead>
                                    <TableHead>Reported By</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets.map(ticket => (
                                    <TableRow key={ticket.id}>
                                        <TableCell>
                                            <div className="font-medium">{ticket.title}</div>
                                            <div className="text-xs text-muted-foreground max-w-xs truncate">{ticket.description}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div>{ticket.asset_name || 'General'}</div>
                                            <div className="text-xs text-muted-foreground">{ticket.asset_location}</div>
                                        </TableCell>
                                        <TableCell>{ticket.reporter_name}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {ticket.priority}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {ticket.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="outline" onClick={() => openTicketDialog(ticket)}>
                                                Update
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Update Ticket</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Status</Label>
                            <Select value={ticketUpdateForm.status} onValueChange={v => setTicketUpdateForm({ ...ticketUpdateForm, status: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Assigned To</Label>
                            <Input value={ticketUpdateForm.assigned_to} onChange={e => setTicketUpdateForm({ ...ticketUpdateForm, assigned_to: e.target.value })} placeholder="Staff Name" />
                        </div>
                        <div>
                            <Label>Resolution Notes</Label>
                            <Input value={ticketUpdateForm.resolution_notes} onChange={e => setTicketUpdateForm({ ...ticketUpdateForm, resolution_notes: e.target.value })} />
                        </div>
                        <Button onClick={handleUpdateTicket}>Save Changes</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
