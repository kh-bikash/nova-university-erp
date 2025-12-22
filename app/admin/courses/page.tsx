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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, Search, BookOpen } from "lucide-react"

interface Course {
  id: string
  code: string
  name: string
  department: string
  credits: number
  semester: number
  faculty: string
  faculty_id?: string
  capacity: number
  enrolled: number
  prerequisites: string[]
  description: string
  status: "active" | "inactive"
}

function AdminCoursesContent() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    department: "",
    credits: "3",
    semester: "1",
    faculty: "unassigned",
    capacity: "60",
    prerequisites: "",
    description: "",
  })

  const [departments, setDepartments] = useState<any[]>([])
  const [facultyList, setFacultyList] = useState<any[]>([])

  useEffect(() => {
    fetchCourses()
    fetchDepartments()
    fetchFaculty()
  }, [])

  const fetchFaculty = async () => {
    try {
      const res = await fetch('/api/faculty')
      if (res.ok) {
        const data = await res.json()
        setFacultyList(data)
      }
    } catch (error) {
      console.error('Failed to fetch faculty:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments')
      if (res.ok) {
        const data = await res.json()
        setDepartments(data)
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        const data = json.data || []
        const mappedData = data.map((c: any) => ({
          id: c.id,
          code: c.course_code,
          name: c.course_name,
          department: c.department_name || "Unassigned",
          credits: c.credits,
          semester: c.semester,
          faculty: c.faculty_name || "Unassigned",
          faculty_id: c.faculty_id,
          capacity: c.max_students || 60,
          enrolled: c.enrolled_count || 0,
          prerequisites: [], // TODO: Handle prerequisites
          description: c.description || "",
          status: "active",
        }))
        setCourses(mappedData)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAdd = async () => {
    if (formData.code && formData.name) {
      try {
        const res = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_code: formData.code,
            course_name: formData.name,
            department_id: formData.department,
            credits: Number.parseInt(formData.credits) || 3,
            semester: Number.parseInt(formData.semester) || 1,
            description: formData.description,
            faculty_id: formData.faculty === "unassigned" ? null : formData.faculty,
            max_students: Number.parseInt(formData.capacity) || 60,
          }),
        })

        if (res.ok) {
          fetchCourses()
          resetForm()
          setIsOpen(false)
        }
      } catch (error) {
        console.error('Failed to create course:', error)
      }
    }
  }

  const handleEdit = (id: string) => {
    const course = courses.find((c) => c.id === id)
    if (course) {
      // Find faculty ID from the list based on name if needed, but ideally course object should have faculty_id
      // Since the API returns faculty_name, we might need to adjust the API or the frontend mapping.
      // Let's assume for now we need to match by name if ID isn't available, or better yet, update fetchCourses to include faculty_id.

      setFormData({
        code: course.code,
        name: course.name,
        department: departments.find(d => d.name === course.department)?.id || "",
        credits: course.credits.toString(),
        semester: course.semester.toString(),
        faculty: course.faculty_id || "unassigned",
        capacity: course.capacity.toString(),
        prerequisites: course.prerequisites.join(", "),
        description: course.description,
      })
      setEditingId(id)
      setIsOpen(true)
    }
  }

  const handleUpdate = async () => {
    if (editingId && formData.code && formData.name) {
      try {
        const res = await fetch('/api/courses', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            course_name: formData.name,
            department_id: formData.department,
            credits: Number.parseInt(formData.credits) || 3,
            semester: Number.parseInt(formData.semester) || 1,
            description: formData.description,
            faculty_id: formData.faculty === "unassigned" ? null : formData.faculty,
            max_students: Number.parseInt(formData.capacity) || 60,
          }),
        })

        if (res.ok) {
          fetchCourses()
          resetForm()
          setIsOpen(false)
        }
      } catch (error) {
        console.error('Failed to update course:', error)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        const res = await fetch(`/api/courses?id=${id}`, {
          method: 'DELETE',
        })

        if (res.ok) {
          fetchCourses()
        }
      } catch (error) {
        console.error('Failed to delete course:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      department: "",
      credits: "3",
      semester: "1",
      faculty: "unassigned",
      capacity: "60",
      prerequisites: "",
      description: "",
    })
    setEditingId(null)
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading courses...</div>
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Course Management</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and manage university courses</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="gap-2">
              <Plus size={20} />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen size={20} />
                {editingId ? "Edit Course" : "Add New Course"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Course Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., CSE201"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Course Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Data Structures"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="dept">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger id="dept">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="faculty">Faculty Assignment</Label>
                  <Select
                    value={formData.faculty || "unassigned"}
                    onValueChange={(value) => setFormData({ ...formData, faculty: value })}
                  >
                    <SelectTrigger id="faculty">
                      <SelectValue placeholder="Select Faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {Array.isArray(facultyList) && facultyList.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.full_name} ({f.employee_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(!facultyList || facultyList.length === 0) && (
                    <p className="text-xs text-muted-foreground mt-1">No faculty members found.</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={formData.semester}
                      onValueChange={(value) => setFormData({ ...formData, semester: value })}
                    >
                      <SelectTrigger id="semester">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="credits">Credits</Label>
                    <Input
                      id="credits"
                      type="number"
                      min="1"
                      max="6"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prereq">Prerequisites</Label>
                    <Input
                      id="prereq"
                      value={formData.prerequisites}
                      onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                      placeholder="e.g., CSE101, CSE102"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="desc">Description</Label>
                <Textarea
                  id="desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Course description and content"
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
        </Dialog >
      </div >

      {/* Search */}
      < Card className="p-4 border border-border/50" >
        <div className="flex items-center gap-2">
          <Search size={20} className="text-muted-foreground" />
          <Input
            placeholder="Search courses by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-0"
          />
        </div>
      </Card >

      {/* Courses Table */}
      < Card className="border border-border/50 overflow-x-auto" >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="text-center">Sem</TableHead>
              <TableHead className="text-center">Credits</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead className="text-center">Enrolled</TableHead>
              <TableHead>Prerequisites</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-mono font-bold">{course.code}</TableCell>
                <TableCell className="font-medium">{course.name}</TableCell>
                <TableCell>{course.department}</TableCell>
                <TableCell className="text-center">{course.semester}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{course.credits}</Badge>
                </TableCell>
                <TableCell>{course.faculty}</TableCell>
                <TableCell className="text-center">
                  {course.enrolled}/{course.capacity}
                </TableCell>
                <TableCell>
                  {course.prerequisites.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {course.prerequisites.map((prereq) => (
                        <Badge key={prereq} variant="secondary" className="text-xs">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">None</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(course.id)}>
                      <Edit2 size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(course.id)}>
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card >

      {/* Stats */}
      < div className="grid md:grid-cols-4 gap-4" >
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Courses</p>
          <p className="text-3xl font-bold text-primary mt-2">{courses.length}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Credits Offered</p>
          <p className="text-3xl font-bold text-accent mt-2">{courses.reduce((sum, c) => sum + c.credits, 0)}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Total Enrolled</p>
          <p className="text-3xl font-bold text-secondary mt-2">{courses.reduce((sum, c) => sum + c.enrolled, 0)}</p>
        </Card>
        <Card className="p-6 border border-border/50">
          <p className="text-sm text-muted-foreground">Avg Enrollment %</p>
          <p className="text-3xl font-bold text-primary mt-2">
            {Math.round((courses.reduce((sum, c) => sum + (c.enrolled / c.capacity) * 100, 0) / courses.length) * 100) /
              100}
            %
          </p>
        </Card>
      </div >
    </div >
  )
}

export default function AdminCoursesPage() {
  return (
    <ProtectedRoute>
      <AdminCoursesContent />
    </ProtectedRoute>
  )
}
