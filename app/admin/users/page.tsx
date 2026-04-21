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
import { Plus, Edit2, Trash2, Search, Shield, UserPlus, Link as LinkIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  email: string
  full_name: string
  role: "admin" | "faculty" | "student" | "parent"
  department: string
  status: "active" | "inactive"
  created_at: string
}

function UsersPageContent() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Link Parent State
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [parentEmail, setParentEmail] = useState("")

  const [formData, setFormData] = useState<{
    email: string
    full_name: string
    role: "admin" | "faculty" | "student" | "parent"
    department: string
  }>({
    email: "",
    full_name: "",
    role: "student",
    department: "",
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAdd = async () => {
    if (formData.email && formData.full_name) {
      try {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            full_name: formData.full_name,
            role: formData.role,
            department: formData.department,
            password: 'password123', // Default password for now
          }),
        })

        if (res.ok) {
          fetchUsers()
          resetForm()
          setIsOpen(false)
          toast({ title: "Success", description: "User created successfully" })
        }
      } catch (error) {
        console.error('Failed to create user:', error)
      }
    }
  }

  const handleEdit = (id: string) => {
    const user = users.find((u) => u.id === id)
    if (user) {
      setFormData({
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        department: user.department || "",
      })
      setEditingId(id)
      setIsOpen(true)
    }
  }

  const handleUpdate = async () => {
    if (editingId && formData.email && formData.full_name) {
      try {
        const res = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            email: formData.email,
            full_name: formData.full_name,
            role: formData.role,
            department: formData.department,
            status: 'active', // Default to active
          }),
        })

        if (res.ok) {
          fetchUsers()
          resetForm()
          setIsOpen(false)
          toast({ title: "Success", description: "User updated successfully" })
        }
      } catch (error) {
        console.error('Failed to update user:', error)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const res = await fetch(`/api/users?id=${id}`, {
          method: 'DELETE',
        })

        if (res.ok) {
          fetchUsers()
          toast({ title: "Success", description: "User deleted successfully" })
        }
      } catch (error) {
        console.error('Failed to delete user:', error)
      }
    }
  }

  const handleLinkParent = (studentId: string) => {
    setSelectedStudentId(studentId)
    setLinkDialogOpen(true)
  }

  const submitLinkParent = async () => {
    if (!selectedStudentId || !parentEmail) return

    try {
      const res = await fetch('/api/admin/link-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_user_id: selectedStudentId,
          parent_email: parentEmail,
          relationship: 'Guardian'
        })
      })

      const data = await res.json()
      if (res.ok) {
        toast({ title: "Success", description: "Parent linked successfully" })
        setLinkDialogOpen(false)
        setParentEmail("")
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to link parent", variant: "destructive" })
    }
  }

  const resetForm = () => {
    setFormData({ email: "", full_name: "", role: "student", department: "" })
    setEditingId(null)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-destructive"
      case "faculty":
        return "bg-primary"
      case "parent":
        return "bg-orange-500"
      default:
        return "bg-secondary"
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading users...</div>
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and manage system users and roles</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2">
              <Plus size={20} />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield size={20} />
                {editingId ? "Edit User" : "Add New User"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@novauniversity.edu"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dept">Department (Optional)</Label>
                  <Input
                    id="dept"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Enter department"
                  />
                </div>
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
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0"
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
                </TableCell>
                <TableCell>{user.department}</TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {user.role === 'student' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          console.log("Opening Link Parent Dialog for:", user.id);
                          handleLinkParent(user.id);
                        }}
                        title="Link Parent"
                      >
                        <UserPlus size={16} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(user.id)}
                      aria-label={`Edit ${user.full_name}`}
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      aria-label={`Delete ${user.full_name}`}
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

      {/* Link Parent Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Parent Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Enter the email address of the existing Parent user you want to link to this student.
            </p>
            <div>
              <Label>Parent Email</Label>
              <Input
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="parent@example.com"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
              <Button onClick={submitLinkParent}>Link Parent</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <ProtectedRoute>
      <UsersPageContent />
    </ProtectedRoute>
  )
}
