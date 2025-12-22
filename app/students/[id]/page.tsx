"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone, MapPin, Users, BookOpen, FileText } from "lucide-react"

export default function StudentDetailPage({ params }: { params: { id: string } }) {
  // Sample student data - in production, fetch from API
  const student = {
    id: params.id,
    name: "Aarav Kumar",
    enrollment: "KL2023001",
    email: "aarav@kl.edu",
    phone: "+91 98765 43210",
    dateOfBirth: "2004-05-15",
    gender: "Male",
    bloodGroup: "O+",
    address: "123 Main Street, City, State",
    department: "Computer Science",
    semester: 4,
    cgpa: 3.8,
    fatherName: "Mr. Kumar Singh",
    motherName: "Mrs. Sharma Singh",
    enrollmentDate: "2021-07-01",
  }

  const courses = [
    { code: "CS401", name: "Advanced Algorithms", credits: 4, grade: "A" },
    { code: "CS402", name: "Database Systems", credits: 3, grade: "A-" },
    { code: "CS403", name: "Web Development", credits: 3, grade: "A" },
  ]

  const attendance = [
    { course: "Advanced Algorithms", percentage: 95 },
    { course: "Database Systems", percentage: 92 },
    { course: "Web Development", percentage: 90 },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Student Profile</h1>
        <p className="text-muted-foreground mt-2">Comprehensive student information and academic records</p>
      </div>

      {/* Student Header Card */}
      <Card className="p-8 border border-border/50 bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{student.name}</h2>
            <p className="text-muted-foreground">{student.enrollment}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="font-semibold text-foreground">{student.department}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex gap-3">
            <Mail className="text-primary" size={20} />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium text-foreground">{student.email}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="text-primary" size={20} />
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium text-foreground">{student.phone}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="text-primary" size={20} />
            <div>
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="font-medium text-foreground">{student.address}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">CGPA</p>
            <p className="text-2xl font-bold text-accent">{student.cgpa}</p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="border-b bg-transparent p-0 w-full justify-start rounded-none">
          <TabsTrigger
            value="courses"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <BookOpen size={18} className="mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <FileText size={18} className="mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger
            value="family"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Users size={18} className="mr-2" />
            Family Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          <Card className="p-6 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Enrolled Courses</h3>
            <div className="space-y-3">
              {courses.map((course, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-4 bg-card rounded-lg border border-border/30"
                >
                  <div>
                    <p className="font-semibold text-foreground">{course.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.code} • {course.credits} Credits
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-accent">{course.grade}</p>
                    <p className="text-xs text-muted-foreground">Grade</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          <Card className="p-6 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Course Attendance</h3>
            <div className="space-y-3">
              {attendance.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-4 bg-card rounded-lg border border-border/30"
                >
                  <p className="font-medium text-foreground">{item.course}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${item.percentage}%` }} />
                    </div>
                    <p className="font-semibold text-foreground w-12 text-right">{item.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="family" className="mt-6">
          <Card className="p-6 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Family Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-card rounded-lg border border-border/30">
                <p className="text-sm text-muted-foreground mb-1">Father's Name</p>
                <p className="font-semibold text-foreground">{student.fatherName}</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border/30">
                <p className="text-sm text-muted-foreground mb-1">Mother's Name</p>
                <p className="font-semibold text-foreground">{student.motherName}</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border/30">
                <p className="text-sm text-muted-foreground mb-1">Date of Birth</p>
                <p className="font-semibold text-foreground">{student.dateOfBirth}</p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-border/30">
                <p className="text-sm text-muted-foreground mb-1">Blood Group</p>
                <p className="font-semibold text-foreground">{student.bloodGroup}</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
