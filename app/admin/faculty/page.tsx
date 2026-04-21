"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, Search, Users } from "lucide-react"

interface Faculty {
  id: string
  name: string
  email: string
  phone: string
  department: string
  department_id?: string
  qualification: string
  experience_years: number
  courses_teaching: number
  rating: number
  status: "active" | "inactive"
  joining_date: string
}

function FacultyManagementContent() {
  const [faculty, setFaculty] = useState<Faculty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    qualification: "",
    experience_years: "",
  })

  const [departments, setDepartments] = useState<any[]>([])

  useEffect(() => {
    fetchFaculty()
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments')
      if (res.ok) {
        setDepartments(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  const fetchFaculty = async () => {
    try {
      const res = await fetch('/api/faculty')
      if (res.ok) {
        const data = await res.json()
        // Map API response to UI model
        const mappedData = data.map((f: any) => ({
          id: f.id,
          name: f.full_name,
          email: f.email,
          phone: f.phone_number || "",
          department: f.department_name || "Unassigned",
          department_id: f.department_id, // Store ID for editing
          qualification: f.qualification || "",
          experience_years: f.experience_years || 0,
          courses_teaching: 0, // TODO: Fetch from courses count
          rating: 0, // TODO: Fetch from ratings
          status: "active", // TODO: Add status to faculty table or use user status
          joining_date: f.date_of_joining ? new Date(f.date_of_joining).toISOString().split('T')[0] : "",
        }))
        setFaculty(mappedData)
      }
    } catch (error) {
      console.error('Failed to fetch faculty:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredFaculty = faculty.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAdd = async () => {
    if (formData.name && formData.email) {
      try {
        const res = await fetch('/api/faculty', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: formData.name,
            email: formData.email,
            password: 'password123', // Default password
            employee_id: `FAC${Date.now()}`,
            department_id: formData.department,
            specialization: "General",
            qualification: formData.qualification,
            experience_years: Number.parseInt(formData.experience_years) || 0,
            office_location: "Main Block",
          }),
        })

        if (res.ok) {
          fetchFaculty()
          resetForm()
          setIsOpen(false)
        }
      } catch (error) {
        console.error('Failed to create faculty:', error)
      }
    }
  }

  const handleEdit = (id: string) => {
    const f = faculty.find((x) => x.id === id)
    if (f) {
      setFormData({
        name: f.name,
        email: f.email,
        phone: f.phone,
        department: f.department_id || "", // Use ID
        qualification: f.qualification,
        experience_years: f.experience_years.toString(),
      })
      setEditingId(id)
      setIsOpen(true)
    }
  }

  const handleUpdate = async () => {
    if (editingId && formData.name && formData.email) {
      try {
        const res = await fetch('/api/faculty', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            full_name: formData.name,
            email: formData.email,
            qualification: formData.qualification,
            experience_years: Number.parseInt(formData.experience_years) || 0,
          }),
        })

        if (res.ok) {
          fetchFaculty()
          resetForm()
          setIsOpen(false)
        }
      } catch (error) {
        console.error('Failed to update faculty:', error)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this faculty member?')) {
      try {
        const res = await fetch(`/api/faculty?id=${id}`, {
          method: 'DELETE',
        })

        if (res.ok) {
          fetchFaculty()
        }
      } catch (error) {
        console.error('Failed to delete faculty:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", department: "", qualification: "", experience_years: "" })
    setEditingId(null)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Faculty Management</h1>
          <p className="text-muted-foreground mt-1">Manage university faculty and staff</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2">
              <Plus size={20} />
              Add Faculty
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users size={20} />
                {editingId ? "Edit Faculty" : "Add New Faculty"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="faculty@novauniversity.edu"
                    type="email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="dept">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="qual">Qualification</Label>
                <Input
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="PhD in Computer Science"
                />
              </div>
              <div>
                <Label htmlFor="exp">Years of Experience</Label>
                <Input
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                  placeholder="Years"
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingId ? handleUpdate : handleAdd}>{editingId ? "Update" : "Add"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="p-4 border border-border/50">
        <div className="flex items-center gap-2">
          <Search size={20} className="text-muted-foreground" />
          <Input
            placeholder="Search faculty by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0"
          />
        </div>
      </Card>

      {/* Faculty Table */}
      <Card className="border border-border/50 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead className="text-center">Courses</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFaculty.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-medium">{f.name}</TableCell>
                <TableCell className="text-sm">{f.email}</TableCell>
                <TableCell className="text-sm">{f.phone}</TableCell>
                <TableCell>{f.department}</TableCell>
                <TableCell>{f.experience_years} years</TableCell>
                <TableCell className="text-center">{f.courses_teaching}</TableCell>
                <TableCell>
                  {f.rating > 0 ? (
                    <Badge className="bg-yellow-500">{f.rating}/5</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={f.status === "active" ? "default" : "secondary"}>{f.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(f.id)}>
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(f.id)}>
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Faculty</p>
          <p className="text-3xl font-bold text-primary mt-2">{faculty.length}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Active Faculty</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {faculty.filter((f) => f.status === "active").length}
          </p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Courses</p>
          <p className="text-3xl font-bold text-accent mt-2">
            {faculty.reduce((sum, f) => sum + f.courses_teaching, 0)}
          </p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Avg Rating</p>
          <p className="text-3xl font-bold text-yellow-500 mt-2">
            {(faculty.reduce((sum, f) => sum + f.rating, 0) / faculty.filter((f) => f.rating > 0).length).toFixed(1)}
          </p>
        </Card>
      </div>
    </div>
  )
}

export default function AdminFacultyPage() {
  return (
    <ProtectedRoute>
      <FacultyManagementContent />
    </ProtectedRoute>
  )
}
