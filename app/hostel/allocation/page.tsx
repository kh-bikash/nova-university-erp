"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Home } from "lucide-react"

const hostelsList = [
  { id: "1", name: "Boys Hostel - A", gender: "Male", totalRooms: 50, occupied: 48, available: 2 },
  { id: "2", name: "Boys Hostel - B", gender: "Male", totalRooms: 45, occupied: 40, available: 5 },
  { id: "3", name: "Girls Hostel - A", gender: "Female", totalRooms: 40, occupied: 38, available: 2 },
  { id: "4", name: "Girls Hostel - B", gender: "Female", totalRooms: 35, occupied: 34, available: 1 },
]

const allocationRequests = [
  { id: "1", name: "Aarav Kumar", enrollment: "KL2023001", hostel: "Boys Hostel - A", status: "allocated" },
  { id: "2", name: "Ananya Sharma", enrollment: "KL2023002", hostel: "Girls Hostel - A", status: "allocated" },
  { id: "3", name: "Rajesh Patel", enrollment: "KL2023003", hostel: "Boys Hostel - B", status: "waitlist" },
  { id: "4", name: "Priya Singh", enrollment: "KL2023004", hostel: "Girls Hostel - B", status: "allocated" },
]

export default function HostelAllocationPage() {
  const [selectedHostel, setSelectedHostel] = useState("all")

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Hostel Allocation Management</h1>
        <p className="text-muted-foreground mt-2">Manage hostel allocations and occupancy</p>
      </div>

      {/* Hostel Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hostelsList.map((hostel) => (
          <Card
            key={hostel.id}
            className="p-6 border border-border/50 cursor-pointer hover:border-primary/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <Home className="text-primary" size={24} />
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">{hostel.gender}</span>
            </div>
            <p className="font-semibold text-foreground">{hostel.name}</p>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Rooms</span>
                <span className="font-medium text-foreground">{hostel.totalRooms}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Occupied</span>
                <span className="font-medium text-foreground">{hostel.occupied}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available</span>
                <span className="font-bold text-accent">{hostel.available}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <Card className="p-4 border border-border/50">
        <label className="block text-sm font-medium text-foreground mb-2">Filter by Hostel</label>
        <Select value={selectedHostel} onValueChange={setSelectedHostel}>
          <SelectTrigger className="w-80">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hostels</SelectItem>
            {hostelsList.map((hostel) => (
              <SelectItem key={hostel.id} value={hostel.id}>
                {hostel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Allocation Requests */}
      <Card className="p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">Allocation Status</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Assigned Hostel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocationRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.name}</TableCell>
                  <TableCell className="font-mono">{request.enrollment}</TableCell>
                  <TableCell>{request.hostel}</TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === "allocated" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {request.status === "allocated" ? "Allocated" : "Waitlist"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
