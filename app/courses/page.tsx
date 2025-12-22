"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: string
  code: string
  name: string
  department: string
  faculty: string
  faculty_id?: string
  credits: number
  semester: number
  capacity: number
  enrolled: number
  status: string
}

export default function CoursesPage() {
  const { user } = useAuth()

  if (!user || !['student', 'faculty', 'admin'].includes(user.role)) {
    return null
  }

  return (
    <ProtectedRoute>
      <CoursesContent />
    </ProtectedRoute>
  )
}

function CoursesContent() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [courses, setCourses] = useState<Course[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [semesterFilter, setSemesterFilter] = useState("all")
  const [openDialog, setOpenDialog] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [form, setForm] = useState({
    code: "",
    name: "",
    department: "",
    faculty: "",
    credits: "",
    semester: "",
    capacity: "",
  })

  const [facultyList, setFacultyList] = useState<any[]>([])

  useEffect(() => {
    fetchCourses()
    fetchDepartments()
    fetchFaculty()
  }, [user])

  const fetchFaculty = async () => {
    try {
      const res = await fetch('/api/faculty')
      if (res.ok) {
        setFacultyList(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch faculty:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      let url = '/api/courses'
      if (user?.role === 'faculty') {
        url += '?faculty_id=me'
      }
      const res = await fetch(url, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        const data = json.data || []
        const mappedData = data.map((c: any) => ({
          id: c.id,
          code: c.course_code,
          name: c.course_name,
          department: c.department_name || "Unassigned",
          faculty: c.faculty_name || "Unassigned",
          faculty_id: c.faculty_id,
          credits: c.credits,
          semester: c.semester,
          capacity: c.max_students || 60,
          enrolled: c.enrolled_count || 0,
          status: "Active",
        }))
        setCourses(mappedData)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments', { cache: 'no-store' })
      if (res.ok) {
        setDepartments(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  const handleAddCourse = async () => {
    if (!form.code || !form.name || !form.department || !form.credits || !form.semester || !form.capacity) {
      alert("Please fill all required fields")
      return
    }

    try {
      const payload = {
        course_code: form.code,
        course_name: form.name,
        department_id: form.department, // This must be the ID
        credits: parseInt(form.credits),
        semester: parseInt(form.semester),
        max_students: parseInt(form.capacity),
        faculty_id: form.faculty === "unassigned" ? null : form.faculty,
        description: ""
      }

      const url = editingCourse ? `/api/courses?id=${editingCourse.id}` : '/api/courses'
      const method = editingCourse ? 'PUT' : 'POST'

      // For PUT, we need to include ID in body if API expects it, or just rely on query param
      // The API implementation for PUT expects body.id
      const body = editingCourse ? { ...payload, id: editingCourse.id } : payload

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      if (res.ok) {
        toast({ title: "Success", description: `Course ${editingCourse ? 'updated' : 'added'} successfully` })
        setOpenDialog(false)
        fetchCourses()
        setForm({ code: "", name: "", department: "", faculty: "", credits: "", semester: "", capacity: "" })
        setEditingCourse(null)
      } else {
        const err = await res.json()
        toast({ title: "Error", description: err.error || "Failed to save course", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error saving course:", error)
      toast({ title: "Error", description: "Failed to save course", variant: "destructive" })
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (confirm("Are you sure?")) {
      try {
        const res = await fetch(`/api/courses?id=${id}`, { method: 'DELETE' })
        if (res.ok) {
          toast({ title: "Success", description: "Course deleted" })
          fetchCourses()
        }
      } catch (error) {
        console.error("Error deleting course:", error)
      }
    }
  }

  const handleEditCourse = (course: Course) => {
    // Find department ID based on name if possible, or we need to store ID in course object
    // The API returns department_name, but we need ID for the form select.
    // Ideally we should store department_id in the course object.
    // For now, let's try to find it in the departments list.
    const dept = departments.find(d => d.name === course.department)

    setEditingCourse(course)
    setForm({
      code: course.code,
      name: course.name,
      department: dept ? dept.id : "", // Use ID if found
      faculty: course.faculty_id || "unassigned",
      credits: course.credits.toString(),
      semester: course.semester.toString(),
      capacity: course.capacity.toString(),
    })
    setOpenDialog(true)
  }

  const filteredCourses = courses.filter((c) => {
    const matchesSearch = c.code.includes(searchQuery) || c.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDept = departmentFilter === "all" || c.department === departmentFilter
    const matchesSem = semesterFilter === "all" || c.semester.toString() === semesterFilter
    return matchesSearch && matchesDept && matchesSem
  })

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Course Management</h1>
          <p className="text-muted-foreground mt-2">View and manage all university courses</p>
        </div>
        {user?.role === 'admin' && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingCourse(null)
                  setForm({ code: "", name: "", department: "", faculty: "", credits: "", semester: "", capacity: "" })
                }}
                className="gap-2"
              >
                <Plus size={18} />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCourse ? "Edit Course" : "Add New Course"}</DialogTitle>
                <DialogDescription>Fill in the course details below</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Course Code *</label>
                  <Input
                    placeholder="CS401"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Course Name *</label>
                  <Input
                    placeholder="Advanced Algorithms"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Faculty Assignment</label>
                  <select
                    value={form.faculty || "unassigned"}
                    onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="unassigned">Unassigned</option>
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>{f.full_name} ({f.employee_id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Credits *</label>
                  <Input
                    type="number"
                    placeholder="4"
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Semester *</label>
                  <Input
                    type="number"
                    placeholder="4"
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Capacity *</label>
                  <Input
                    type="number"
                    placeholder="60"
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddCourse} className="w-full">
                  {editingCourse ? "Update Course" : "Add Course"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card className="p-6 border border-border/50">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Department</label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(d => (
                  <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Semester</label>
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
                <SelectItem value="3">Semester 3</SelectItem>
                <SelectItem value="4">Semester 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Courses Table */}
      <Card className="p-6 border border-border/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Enrollment</TableHead>
                <TableHead>Status</TableHead>
                {user?.role === 'admin' && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-mono font-semibold">{course.code}</TableCell>
                  <TableCell className="font-medium">{course.name}</TableCell>
                  <TableCell>{course.faculty}</TableCell>
                  <TableCell>{course.credits}</TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {course.enrolled}/{course.capacity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                      {course.status}
                    </span>
                  </TableCell>
                  {user?.role === 'admin' && (
                    <TableCell className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditCourse(course)}>
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
