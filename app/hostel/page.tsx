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
import { Home, Bed, Users, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function StudentHostelPage() {
  const { user } = useAuth()

  if (!user || user.role !== "student") {
    return null
  }

  return (
    <ProtectedRoute>
      <StudentHostelContent />
    </ProtectedRoute>
  )
}

function StudentHostelContent() {
  const toast = useToast()
  const [allocation, setAllocation] = useState<any>(null)
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isComplaintOpen, setIsComplaintOpen] = useState(false)
  const [complaintForm, setComplaintForm] = useState({ complaint_type: "maintenance", description: "" })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [aRes, cRes] = await Promise.all([
        fetch('/api/hostel/allocation'),
        fetch('/api/hostel/complaints')
      ])

      if (aRes.ok) {
        const data = await aRes.json()
        setAllocation(data)
      }
      if (cRes.ok) setComplaints(await cRes.json())
    } catch (error) {
      console.error("Failed to fetch data", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRaiseComplaint = async () => {
    if (!complaintForm.description) return

    try {
      const res = await fetch('/api/hostel/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintForm)
      })
      if (res.ok) {
        toast.toast({ title: "Success", description: "Complaint submitted" })
        setIsComplaintOpen(false)
        setComplaintForm({ complaint_type: "maintenance", description: "" })
        fetchData()
      } else {
        const data = await res.json()
        toast.toast({ title: "Error", description: data.error || "Failed to submit", variant: "destructive" })
      }
    } catch (error) {
      toast.toast({ title: "Error", description: "Failed to submit complaint", variant: "destructive" })
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  if (!allocation) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">My Hostel</h1>
        <Card className="p-12 text-center border-dashed">
          <Home className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No Room Allocated</h3>
          <p className="text-muted-foreground">You have not been allocated a hostel room yet. Please contact the warden.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Hostel</h1>
          <p className="text-muted-foreground mt-1">Room details and services</p>
        </div>
        <Dialog open={isComplaintOpen} onOpenChange={setIsComplaintOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" variant="destructive">
              <AlertTriangle size={18} /> Report Issue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Report an Issue</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Issue Type</Label>
                <Select value={complaintForm.complaint_type} onValueChange={v => setComplaintForm({ ...complaintForm, complaint_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance (Electric/Plumbing)</SelectItem>
                    <SelectItem value="cleanliness">Cleanliness</SelectItem>
                    <SelectItem value="discipline">Discipline/Noise</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={complaintForm.description}
                  onChange={e => setComplaintForm({ ...complaintForm, description: e.target.value })}
                  placeholder="Describe the issue in detail..."
                />
              </div>
              <Button onClick={handleRaiseComplaint}>Submit Complaint</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-l-4 border-l-primary">
          <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
            <Home size={20} className="text-primary" /> Room Details
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Hostel Name</p>
                <p className="font-semibold">{allocation.hostel_name}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Room Number</p>
                <p className="font-semibold text-xl">{allocation.room_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bed size={16} />
              <span>{allocation.room_type.charAt(0).toUpperCase() + allocation.room_type.slice(1)} Occupancy</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-xl mb-4">Recent Complaints</h3>
          <div className="space-y-4">
            {complaints.length === 0 ? (
              <p className="text-muted-foreground text-sm">No complaints raised.</p>
            ) : (
              complaints.map(c => (
                <div key={c.id} className="p-3 border rounded-lg text-sm">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{c.complaint_type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{c.status}</span>
                  </div>
                  <p className="text-muted-foreground">{c.description}</p>
                  {c.resolution && (
                    <div className="mt-2 pt-2 border-t text-xs text-green-700">
                      <strong>Resolution:</strong> {c.resolution}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
