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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit2, Trash2, Search } from "lucide-react"

interface Department {
  id: string
  name: string
  code: string
  head: string
  faculty_count: number
  student_count: number
  budget: number
  description: string
  status: "active" | "inactive"
}

export default function DepartmentsPage() {
  const { user } = useAuth()

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <ProtectedRoute>
      <DepartmentsPageContent />
    </ProtectedRoute>
  )
}

function DepartmentsPageContent() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    head: "",
    budget: "",
    description: "",
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments')
      if (res.ok) {
        const data = await res.json()
        setDepartments(data)
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAdd = async () => {
    if (formData.name && formData.code) {
      try {
        const res = await fetch('/api/departments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            code: formData.code,
            head_faculty_id: null, // TODO: Link to faculty
            budget: Number.parseInt(formData.budget) || 0,
            description: formData.description,
          }),
        })

        if (res.ok) {
          fetchDepartments()
          resetForm()
          setIsOpen(false)
        }
      } catch (error) {
        console.error('Failed to create department:', error)
      }
    }
  }

  const handleEdit = (id: string) => {
    const dept = departments.find((d) => d.id === id)
    if (dept) {
      setFormData({
        name: dept.name,
        code: dept.code,
        head: dept.head || "",
        budget: dept.budget?.toString() || "",
        description: dept.description || "",
      })
      setEditingId(id)
      setIsOpen(true)
    }
  }

  const handleUpdate = async () => {
    if (editingId && formData.name && formData.code) {
      try {
        const res = await fetch('/api/departments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            name: formData.name,
            code: formData.code,
            budget: Number.parseInt(formData.budget) || 0,
            description: formData.description,
          }),
        })

        if (res.ok) {
          fetchDepartments()
          resetForm()
          setIsOpen(false)
        }
      } catch (error) {
        console.error('Failed to update department:', error)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        const res = await fetch(`/api/departments?id=${id}`, {
          method: 'DELETE',
        })

        if (res.ok) {
          fetchDepartments()
        }
      } catch (error) {
        console.error('Failed to delete department:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: "", code: "", head: "", budget: "", description: "" })
    setEditingId(null)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Department Management</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and manage university departments</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2">
              <Plus size={20} />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Department" : "Add New Department"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Department Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div>
                  <Label htmlFor="code">Department Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., CS"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="head">Department Head</Label>
                <Input
                  id="head"
                  value={formData.head}
                  onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                  placeholder="Enter department head name"
                />
              </div>
              <div>
                <Label htmlFor="budget">Annual Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="Enter budget amount"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Department description and details"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={editingId ? handleUpdate : handleAdd}>{editingId ? "Update" : "Create"}</Button>
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
            placeholder="Search departments by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0"
          />
        </div>
      </Card>

      {/* Departments Table */}
      <Card className="border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Head</TableHead>
              <TableHead className="text-right">Faculty</TableHead>
              <TableHead className="text-right">Students</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDepartments.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell className="font-medium">{dept.name}</TableCell>
                <TableCell>{dept.code}</TableCell>
                <TableCell>{dept.head}</TableCell>
                <TableCell className="text-right">{dept.faculty_count}</TableCell>
                <TableCell className="text-right">{dept.student_count}</TableCell>
                <TableCell className="text-right">{(dept.budget / 100000).toFixed(1)}L</TableCell>
                <TableCell>
                  <Badge variant={dept.status === "active" ? "default" : "secondary"}>{dept.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(dept.id)}
                      aria-label={`Edit ${dept.name}`}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(dept.id)}
                      aria-label={`Delete ${dept.name}`}
                    >
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
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Departments</p>
          <p className="text-3xl font-bold text-primary mt-2">{departments.length}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Faculty</p>
          <p className="text-3xl font-bold text-accent mt-2">
            {departments.reduce((sum, d) => sum + d.faculty_count, 0)}
          </p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Students</p>
          <p className="text-3xl font-bold text-secondary mt-2">
            {departments.reduce((sum, d) => sum + d.student_count, 0).toLocaleString()}
          </p>
        </Card>
      </div>
    </div>
  )
}
