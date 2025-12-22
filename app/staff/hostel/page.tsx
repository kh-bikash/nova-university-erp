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
import { Plus, Home, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function StaffHostelPage() {
    return (
        <ProtectedRoute>
            <StaffHostelContent />
        </ProtectedRoute>
    )
}

function StaffHostelContent() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [hostels, setHostels] = useState<any[]>([])
    const [allocations, setAllocations] = useState<any[]>([])
    const [complaints, setComplaints] = useState<any[]>([])
    const [students, setStudents] = useState<any[]>([])

    // Dialog States
    const [isHostelDialogOpen, setIsHostelDialogOpen] = useState(false)
    const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false)
    const [isAllocDialogOpen, setIsAllocDialogOpen] = useState(false)

    // Forms
    const [hostelForm, setHostelForm] = useState({ name: "", gender_type: "male", total_rooms: "50", capacity_per_room: "2" })
    const [roomForm, setRoomForm] = useState({ hostel_id: "", room_number: "", room_type: "double", capacity: "2" })
    const [allocForm, setAllocForm] = useState({ student_id: "", hostel_id: "", room_id: "", academic_year: "2024-2025" })
    const [roomsForAlloc, setRoomsForAlloc] = useState<any[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const [hRes, cRes, sRes, aRes] = await Promise.all([
                fetch('/api/hostel'),
                fetch('/api/hostel/complaints'),
                fetch('/api/students'),
                fetch('/api/hostel/allocation')
            ])

            if (hRes.ok) setHostels(await hRes.json())
            if (cRes.ok) setComplaints(await cRes.json())
            if (sRes.ok) setStudents(await sRes.json())
            if (aRes.ok) setAllocations(await aRes.json())
        } catch (error) {
            console.error("Failed to fetch data", error)
        }
    }

    const handleCreateHostel = async () => {
        const res = await fetch('/api/hostel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'hostel', ...hostelForm })
        })
        if (res.ok) {
            toast({ title: "Hostel created" })
            setIsHostelDialogOpen(false)
            fetchData()
        }
    }

    const handleCreateRoom = async () => {
        const res = await fetch('/api/hostel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'room', ...roomForm })
        })
        if (res.ok) {
            toast({ title: "Room created" })
            setIsRoomDialogOpen(false)
            fetchData()
        }
    }

    const handleFetchRooms = async (hostelId: string) => {
        setAllocForm({ ...allocForm, hostel_id: hostelId })
        const res = await fetch(`/api/hostel?hostel_id=${hostelId}`)
        if (res.ok) {
            setRoomsForAlloc(await res.json())
        }
    }

    const handleAllocate = async () => {
        const res = await fetch('/api/hostel/allocation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                student_id: allocForm.student_id,
                room_id: allocForm.room_id,
                academic_year: allocForm.academic_year
            })
        })
        if (res.ok) {
            toast({ title: "Room allocated" })
            setIsAllocDialogOpen(false)
            fetchData()
        } else {
            const data = await res.json()
            toast({ title: "Error", description: data.error, variant: "destructive" })
        }
    }

    const handleResolveComplaint = async (id: string) => {
        const res = await fetch('/api/hostel/complaints', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'resolved', resolution: 'Fixed by staff' })
        })
        if (res.ok) {
            toast({ title: "Complaint resolved" })
            fetchData()
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <h1 className="text-3xl font-bold">Hostel Operations</h1>
            <p className="text-muted-foreground">Staff management view.</p>

            <Tabs defaultValue="hostels" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="hostels">Hostels & Rooms</TabsTrigger>
                    <TabsTrigger value="allocation">Allocation</TabsTrigger>
                    <TabsTrigger value="complaints">Complaints</TabsTrigger>
                </TabsList>

                <TabsContent value="hostels" className="space-y-4">
                    <div className="flex gap-2">
                        <Dialog open={isHostelDialogOpen} onOpenChange={setIsHostelDialogOpen}>
                            <DialogTrigger asChild><Button><Plus size={16} className="mr-2" /> Add Hostel</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add New Hostel</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div><Label>Name</Label><Input value={hostelForm.name} onChange={e => setHostelForm({ ...hostelForm, name: e.target.value })} /></div>
                                    <div><Label>Type</Label>
                                        <Select value={hostelForm.gender_type} onValueChange={v => setHostelForm({ ...hostelForm, gender_type: v })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent><SelectItem value="male">Boys</SelectItem><SelectItem value="female">Girls</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handleCreateHostel}>Create</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
                            <DialogTrigger asChild><Button variant="outline"><Plus size={16} className="mr-2" /> Add Room</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add Room</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div><Label>Hostel</Label>
                                        <Select value={roomForm.hostel_id} onValueChange={v => setRoomForm({ ...roomForm, hostel_id: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select Hostel" /></SelectTrigger>
                                            <SelectContent>
                                                {hostels.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div><Label>Room Number</Label><Input value={roomForm.room_number} onChange={e => setRoomForm({ ...roomForm, room_number: e.target.value })} /></div>
                                    <Button onClick={handleCreateRoom}>Create</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {hostels.map(h => (
                            <Card key={h.id} className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">{h.name}</h3>
                                        <p className="text-sm text-muted-foreground">{h.gender_type === 'male' ? 'Boys Hostel' : 'Girls Hostel'}</p>
                                    </div>
                                    <Home className="text-primary" size={24} />
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div>Requesting: {h.room_count} rooms</div>
                                    <div>Occupancy: {h.current_occupancy}</div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="allocation">
                    <div className="mb-4">
                        <Dialog open={isAllocDialogOpen} onOpenChange={setIsAllocDialogOpen}>
                            <DialogTrigger asChild><Button>Allocate Room</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Allocate Room</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Select value={allocForm.student_id} onValueChange={v => setAllocForm({ ...allocForm, student_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Student" /></SelectTrigger>
                                        <SelectContent>
                                            {students.map(s => <SelectItem key={s.id} value={s.id}>{s.enrollment_number}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Select value={allocForm.hostel_id} onValueChange={handleFetchRooms}>
                                        <SelectTrigger><SelectValue placeholder="Select Hostel" /></SelectTrigger>
                                        <SelectContent>
                                            {hostels.map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Select value={allocForm.room_id} onValueChange={v => setAllocForm({ ...allocForm, room_id: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select Room" /></SelectTrigger>
                                        <SelectContent>
                                            {roomsForAlloc.map(r => (
                                                <SelectItem key={r.id} value={r.id} disabled={r.current_occupancy >= r.capacity}>{r.room_number}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button onClick={handleAllocate}>Allocate</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Hostel</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {allocations.map(a => (
                                    <TableRow key={a.id}>
                                        <TableCell>{a.student_name}</TableCell>
                                        <TableCell>{a.hostel_name}</TableCell>
                                        <TableCell>{a.room_number}</TableCell>
                                        <TableCell>{a.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="complaints">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {complaints.map(c => (
                                    <TableRow key={c.id}>
                                        <TableCell>{c.student_name}</TableCell>
                                        <TableCell>{c.description}</TableCell>
                                        <TableCell>{c.status}</TableCell>
                                        <TableCell>
                                            {c.status !== 'resolved' && <Button size="sm" onClick={() => handleResolveComplaint(c.id)}>Resolve</Button>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
