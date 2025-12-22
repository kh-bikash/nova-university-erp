"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Hostel {
  id: string
  name: string
  gender: string
  totalRooms: number
  warden: string
  phone: string
  address: string
}

interface HostelRoom {
  id: string
  hostelId: string
  roomNumber: string
  capacity: number
  occupied: number
  students: string[]
  bedType: string
}

export default function HostelManagementPage() {
  const { user } = useAuth()

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <ProtectedRoute>
      <HostelManagementContent />
    </ProtectedRoute>
  )
}

function HostelManagementContent() {
  const [hostels, setHostels] = useState<Hostel[]>([
    {
      id: "1",
      name: "Boys Hostel - A",
      gender: "Male",
      totalRooms: 50,
      warden: "Dr. Kumar",
      phone: "98765-43210",
      address: "Campus North",
    },
    {
      id: "2",
      name: "Girls Hostel - A",
      gender: "Female",
      totalRooms: 40,
      warden: "Dr. Sharma",
      phone: "98765-43211",
      address: "Campus South",
    },
  ])

  const [rooms, setRooms] = useState<HostelRoom[]>([
    {
      id: "1",
      hostelId: "1",
      roomNumber: "A-101",
      capacity: 2,
      occupied: 2,
      students: ["KL2023001", "KL2023002"],
      bedType: "Double",
    },
    {
      id: "2",
      hostelId: "1",
      roomNumber: "A-102",
      capacity: 2,
      occupied: 1,
      students: ["KL2023003"],
      bedType: "Double",
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [openHostelDialog, setOpenHostelDialog] = useState(false)
  const [openRoomDialog, setOpenRoomDialog] = useState(false)
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null)
  const [editingRoom, setEditingRoom] = useState<HostelRoom | null>(null)

  const [hostelForm, setHostelForm] = useState({
    name: "",
    gender: "",
    totalRooms: "",
    warden: "",
    phone: "",
    address: "",
  })
  const [roomForm, setRoomForm] = useState({ hostelId: "", roomNumber: "", capacity: "", bedType: "" })

  const handleAddHostel = () => {
    if (!hostelForm.name || !hostelForm.gender || !hostelForm.totalRooms) {
      alert("Please fill all required fields")
      return
    }

    const newHostel: Hostel = {
      id: Date.now().toString(),
      name: hostelForm.name,
      gender: hostelForm.gender,
      totalRooms: Number.parseInt(hostelForm.totalRooms),
      warden: hostelForm.warden,
      phone: hostelForm.phone,
      address: hostelForm.address,
    }

    if (editingHostel) {
      setHostels(hostels.map((h) => (h.id === editingHostel.id ? newHostel : h)))
      setEditingHostel(null)
    } else {
      setHostels([...hostels, newHostel])
    }

    setHostelForm({ name: "", gender: "", totalRooms: "", warden: "", phone: "", address: "" })
    setOpenHostelDialog(false)
  }

  const handleAddRoom = () => {
    if (!roomForm.hostelId || !roomForm.roomNumber || !roomForm.capacity) {
      alert("Please fill all required fields")
      return
    }

    const newRoom: HostelRoom = {
      id: Date.now().toString(),
      hostelId: roomForm.hostelId,
      roomNumber: roomForm.roomNumber,
      capacity: Number.parseInt(roomForm.capacity),
      occupied: 0,
      students: [],
      bedType: roomForm.bedType,
    }

    if (editingRoom) {
      setRooms(rooms.map((r) => (r.id === editingRoom.id ? newRoom : r)))
      setEditingRoom(null)
    } else {
      setRooms([...rooms, newRoom])
    }

    setRoomForm({ hostelId: "", roomNumber: "", capacity: "", bedType: "" })
    setOpenRoomDialog(false)
  }

  const handleDeleteHostel = (id: string) => {
    if (confirm("Are you sure?")) {
      setHostels(hostels.filter((h) => h.id !== id))
    }
  }

  const handleDeleteRoom = (id: string) => {
    if (confirm("Are you sure?")) {
      setRooms(rooms.filter((r) => r.id !== id))
    }
  }

  const handleEditHostel = (hostel: Hostel) => {
    setEditingHostel(hostel)
    setHostelForm({
      name: hostel.name,
      gender: hostel.gender,
      totalRooms: hostel.totalRooms.toString(),
      warden: hostel.warden,
      phone: hostel.phone,
      address: hostel.address,
    })
    setOpenHostelDialog(true)
  }

  const handleEditRoom = (room: HostelRoom) => {
    setEditingRoom(room)
    setRoomForm({
      hostelId: room.hostelId,
      roomNumber: room.roomNumber,
      capacity: room.capacity.toString(),
      bedType: room.bedType,
    })
    setOpenRoomDialog(true)
  }

  const filteredHostels = hostels.filter((h) => h.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredRooms = rooms.filter((r) => r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Hostel Management</h1>
        <p className="text-muted-foreground mt-2">Manage hostels, rooms, and allocations</p>
      </div>

      {/* Hostels Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Hostels</h2>
          <Dialog open={openHostelDialog} onOpenChange={setOpenHostelDialog}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingHostel(null)
                  setHostelForm({ name: "", gender: "", totalRooms: "", warden: "", phone: "", address: "" })
                }}
                className="gap-2"
              >
                <Plus size={18} />
                Add Hostel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingHostel ? "Edit Hostel" : "Add New Hostel"}</DialogTitle>
                <DialogDescription>Fill in the hostel details below</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Hostel Name *</label>
                  <Input
                    placeholder="e.g., Boys Hostel - C"
                    value={hostelForm.name}
                    onChange={(e) => setHostelForm({ ...hostelForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Gender *</label>
                  <select
                    value={hostelForm.gender}
                    onChange={(e) => setHostelForm({ ...hostelForm, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Co-ed">Co-ed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Total Rooms *</label>
                  <Input
                    type="number"
                    placeholder="50"
                    value={hostelForm.totalRooms}
                    onChange={(e) => setHostelForm({ ...hostelForm, totalRooms: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Warden Name</label>
                  <Input
                    placeholder="Dr. Kumar"
                    value={hostelForm.warden}
                    onChange={(e) => setHostelForm({ ...hostelForm, warden: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                  <Input
                    placeholder="98765-43210"
                    value={hostelForm.phone}
                    onChange={(e) => setHostelForm({ ...hostelForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Address</label>
                  <Input
                    placeholder="Campus North"
                    value={hostelForm.address}
                    onChange={(e) => setHostelForm({ ...hostelForm, address: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddHostel} className="w-full">
                  {editingHostel ? "Update Hostel" : "Add Hostel"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6 border border-border/50">
          <div className="mb-4">
            <Input
              placeholder="Search hostels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Total Rooms</TableHead>
                  <TableHead>Warden</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHostels.map((hostel) => (
                  <TableRow key={hostel.id}>
                    <TableCell className="font-medium">{hostel.name}</TableCell>
                    <TableCell>{hostel.gender}</TableCell>
                    <TableCell>{hostel.totalRooms}</TableCell>
                    <TableCell>{hostel.warden}</TableCell>
                    <TableCell>{hostel.phone}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditHostel(hostel)}>
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteHostel(hostel.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Rooms Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Hostel Rooms</h2>
          <Dialog open={openRoomDialog} onOpenChange={setOpenRoomDialog}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingRoom(null)
                  setRoomForm({ hostelId: "", roomNumber: "", capacity: "", bedType: "" })
                }}
                className="gap-2"
              >
                <Plus size={18} />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingRoom ? "Edit Room" : "Add New Room"}</DialogTitle>
                <DialogDescription>Fill in the room details below</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Hostel *</label>
                  <select
                    value={roomForm.hostelId}
                    onChange={(e) => setRoomForm({ ...roomForm, hostelId: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="">Select Hostel</option>
                    {hostels.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Room Number *</label>
                  <Input
                    placeholder="e.g., A-101"
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Capacity *</label>
                  <Input
                    type="number"
                    placeholder="2"
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Bed Type</label>
                  <select
                    value={roomForm.bedType}
                    onChange={(e) => setRoomForm({ ...roomForm, bedType: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="">Select Type</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                  </select>
                </div>
                <Button onClick={handleAddRoom} className="w-full">
                  {editingRoom ? "Update Room" : "Add Room"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6 border border-border/50">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Occupied</TableHead>
                  <TableHead>Bed Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.roomNumber}</TableCell>
                    <TableCell>{hostels.find((h) => h.id === room.hostelId)?.name}</TableCell>
                    <TableCell>{room.capacity}</TableCell>
                    <TableCell>{room.occupied}</TableCell>
                    <TableCell>{room.bedType}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditRoom(room)}>
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteRoom(room.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
