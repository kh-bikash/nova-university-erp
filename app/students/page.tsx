"use client"

import { useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Student {
  id: string
  name: string
  enrollment: string
  email: string
  department: string
  semester: number
  cgpa: number
  status: string
}

const initialStudents: Student[] = [
  {
    id: "1",
    name: "Aarav Kumar",
    enrollment: "KL2023001",
    email: "aarav@kl.edu",
    department: "Computer Science",
    semester: 4,
    cgpa: 3.8,
    status: "Active",
  },
  {
    id: "2",
    name: "Ananya Sharma",
    enrollment: "KL2023002",
    email: "ananya@kl.edu",
    department: "Information Technology",
    semester: 4,
    cgpa: 3.9,
    status: "Active",
  },
]

export default function StudentsPage() {
  const { user } = useAuth()

  if (!user || !['faculty', 'admin', 'parent'].includes(user.role)) {
    return null
  }

  return (
    <ProtectedRoute>
      <StudentsContent />
    </ProtectedRoute>
  )
}

function StudentsContent() {
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [searchQuery, setSearchQuery] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [form, setForm] = useState({ name: "", enrollment: "", email: "", department: "", semester: "", cgpa: "" })

  const handleAddStudent = () => {
    if (!form.name || !form.enrollment || !form.email || !form.department) {
      alert("Please fill all required fields")
      return
    }

    const newStudent: Student = {
      id: Date.now().toString(),
      name: form.name,
      enrollment: form.enrollment,
      email: form.email,
      department: form.department,
      semester: Number.parseInt(form.semester) || 1,
      cgpa: Number.parseFloat(form.cgpa) || 0,
      status: "Active",
    }

    if (editingStudent) {
      setStudents(students.map((s) => (s.id === editingStudent.id ? newStudent : s)))
      setEditingStudent(null)
    } else {
      setStudents([...students, newStudent])
    }

    setForm({ name: "", enrollment: "", email: "", department: "", semester: "", cgpa: "" })
    setOpenDialog(false)
  }

  const handleDeleteStudent = (id: string) => {
    if (confirm("Are you sure?")) {
      setStudents(students.filter((s) => s.id !== id))
    }
  }

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student)
    setForm({
      name: student.name,
      enrollment: student.enrollment,
      email: student.email,
      department: student.department,
      semester: student.semester.toString(),
      cgpa: student.cgpa.toString(),
    })
    setOpenDialog(true)
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.enrollment.includes(searchQuery) ||
      s.email.includes(searchQuery),
  )

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
          <p className="text-muted-foreground mt-2">Manage and view all enrolled students</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingStudent(null)
                setForm({ name: "", enrollment: "", email: "", department: "", semester: "", cgpa: "" })
              }}
              className="gap-2"
            >
              <Plus size={18} />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
              <DialogDescription>Fill in the student details below</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
                <Input
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Enrollment ID *</label>
                <Input
                  placeholder="KL2023XXX"
                  value={form.enrollment}
                  onChange={(e) => setForm({ ...form, enrollment: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                <Input
                  type="email"
                  placeholder="john@kl.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Department *</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Semester</label>
                <Input
                  type="number"
                  placeholder="4"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">CGPA</label>
                <Input
                  type="number"
                  placeholder="3.8"
                  step="0.1"
                  value={form.cgpa}
                  onChange={(e) => setForm({ ...form, cgpa: e.target.value })}
                />
              </div>
              <Button onClick={handleAddStudent} className="w-full">
                {editingStudent ? "Update Student" : "Add Student"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 border border-border/50">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by name, enrollment number, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>CGPA</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.enrollment}</TableCell>
                  <TableCell>{student.department}</TableCell>
                  <TableCell>{student.semester}</TableCell>
                  <TableCell>{student.cgpa}</TableCell>
                  <TableCell>
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                      {student.status}
                    </span>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditStudent(student)}>
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteStudent(student.id)}
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
  )
}
