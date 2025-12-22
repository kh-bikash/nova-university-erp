"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Download, FileText } from "lucide-react"

const enrollmentData = [
  { month: "Jan", students: 2400, faculty: 120, courses: 32 },
  { month: "Feb", students: 2500, faculty: 125, courses: 32 },
  { month: "Mar", students: 2600, faculty: 130, courses: 35 },
  { month: "Apr", students: 2700, faculty: 135, courses: 35 },
  { month: "May", students: 2800, faculty: 140, courses: 36 },
]

const performanceData = [
  { name: "CS", attendance: 92, gpa: 3.7, placement: 95 },
  { name: "IT", attendance: 90, gpa: 3.6, placement: 92 },
  { name: "ECE", attendance: 88, gpa: 3.5, placement: 88 },
  { name: "Civil", attendance: 85, gpa: 3.4, placement: 85 },
]

const departmentMetrics = [
  { name: "CS", value: 650, fill: "#3b82f6" },
  { name: "IT", value: 580, fill: "#10b981" },
  { name: "ECE", value: 420, fill: "#f59e0b" },
  { name: "Civil", value: 380, fill: "#ef4444" },
]

export default function ReportsPage() {
  const { user } = useAuth()

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <ProtectedRoute>
      <ReportsContent />
    </ProtectedRoute>
  )
}

function ReportsContent() {
  const handleExport = (format: string) => {
    console.log(`Exporting report as ${format}`)
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">University-wide reports and performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => handleExport("PDF")}>
            <Download size={18} />
            Export PDF
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent" onClick={() => handleExport("CSV")}>
            <Download size={18} />
            Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="enrollment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enrollment">Enrollment Trends</TabsTrigger>
          <TabsTrigger value="performance">Department Performance</TabsTrigger>
          <TabsTrigger value="academic">Academic Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="enrollment" className="space-y-4">
          <Card className="p-6 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Enrollment & Faculty Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                />
                <Legend />
                <Line type="monotone" dataKey="students" stroke="var(--color-primary)" strokeWidth={2} />
                <Line type="monotone" dataKey="faculty" stroke="var(--color-accent)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 border border-border/50">
              <h3 className="font-semibold text-foreground mb-4">Department Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentMetrics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }: any) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 border border-border/50">
              <h3 className="font-semibold text-foreground mb-4">Key Metrics by Department</h3>
              <div className="space-y-4">
                {performanceData.map((dept) => (
                  <div key={dept.name} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{dept.name} Department</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Attendance</p>
                        <p className="font-bold text-primary">{dept.attendance}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg GPA</p>
                        <p className="font-bold text-accent">{dept.gpa}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Placement</p>
                        <p className="font-bold text-secondary">{dept.placement}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card className="p-6 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Department Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                />
                <Legend />
                <Bar dataKey="attendance" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="gpa" fill="var(--color-accent)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="placement" fill="var(--color-secondary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Templates */}
      <Card className="p-6 border border-border/50">
        <h3 className="font-semibold text-foreground mb-4">Report Templates</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Student Report", "Faculty Report", "Department Report", "Financial Report"].map((report) => (
            <div
              key={report}
              className="p-4 border border-border/50 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <FileText size={20} className="text-primary" />
                <span className="font-medium">{report}</span>
              </div>
              <Button variant="ghost" size="sm" className="w-full justify-start pl-0">
                Generate
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
