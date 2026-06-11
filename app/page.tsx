"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  BookOpen,
  GraduationCap,
  Users,
  Building2,
  Wallet,
  Calendar,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  PhoneCall,
  Mail,
  MapPin,
  Lock
} from "lucide-react"

export default function LandingPage() {
  // Bento Block 1: Academic Ledger Interactive State
  const [selectedSem, setSelectedSem] = useState(1)
  const sem1Grades = [
    { course: "CS-301 Advanced Algorithms", grade: "A", credits: 4, status: "Approved" },
    { course: "CS-302 Database Systems", grade: "A-", credits: 4, status: "Approved" },
    { course: "CS-303 Operating Systems", grade: "B+", credits: 3, status: "Approved" },
    { course: "CS-304 Software Engineering", grade: "A", credits: 3, status: "Approved" },
  ]
  const sem2Grades = [
    { course: "CS-401 Machine Learning", grade: "B", credits: 4, status: "Pending" },
    { course: "CS-402 Distributed Systems", grade: "--", credits: 4, status: "Draft" },
    { course: "CS-403 Computer Graphics", grade: "A", credits: 3, status: "Approved" },
    { course: "CS-404 Compiler Design", grade: "--", credits: 3, status: "Draft" },
  ]
  const activeGrades = selectedSem === 1 ? sem1Grades : sem2Grades

  // Bento Block 2: Attendance Manager Interactive State
  const [attendance, setAttendance] = useState([
    { name: "John Doe", id: "STU-001", status: "Present" },
    { name: "Jane Smith", id: "STU-002", status: "Present" },
    { name: "Bob Johnson", id: "STU-003", status: "Absent" },
    { name: "Alice Williams", id: "STU-004", status: "Present" },
  ])
  const toggleAttendance = (index: number) => {
    setAttendance(
      attendance.map((student, i) =>
        i === index
          ? { ...student, status: student.status === "Present" ? "Absent" : "Present" }
          : student
      )
    )
  }
  const presentCount = attendance.filter((s) => s.status === "Present").length

  // Bento Block 4: Financial Ledger Interactive State
  const [invoices, setInvoices] = useState([
    { id: "INV-26-001", desc: "Tuition Fee Sem 1", amount: "$4,500.00", status: "Approved" },
    { id: "INV-26-002", desc: "Hostel Charges Sem 1", amount: "$1,200.00", status: "Pending" },
    { id: "INV-26-003", desc: "Library Fine Ref", amount: "$15.00", status: "Approved" },
  ])
  const handlePayInvoice = (id: string) => {
    setInvoices(
      invoices.map((inv) => (inv.id === id ? { ...inv, status: "Approved" } : inv))
    )
  }

  // Contact Form State
  const [formEmail, setFormEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formEmail.includes("@")) {
      setEmailError("Please enter a valid academic or organizational email address.")
      return
    }
    setEmailError("")
    setFormSubmitted(true)
    setTimeout(() => setFormSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/10 selection:text-primary">
      
      {/* Visual Accent Top Bar */}
      <div className="h-1 bg-primary w-full" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/90 backdrop-blur-md shadow-subtle transition-all duration-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-sm bg-primary flex items-center justify-center text-primary-foreground font-serif text-lg font-bold shadow-medium">
              NU
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-primary dark:text-foreground">
              Nova University ERP
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary hover:text-primary transition-colors">
            <a href="#features" className="hover:text-primary transition-colors">System Features</a>
            <a href="#demo" className="hover:text-primary transition-colors">Interactive Demo</a>
            <a href="#contact" className="hover:text-primary transition-colors">Institutional Inquiries</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium text-primary hover:bg-muted h-9 rounded-sm px-4 transition-colors duration-150">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary hover:bg-primary-dark text-white shadow-medium font-medium h-9 rounded-sm px-4 transition-all duration-150 active:scale-98">
                Request Account
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-b from-card to-background border-b border-border overflow-hidden">
          {/* Grid Pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(to_right,#1e293b40_1px,transparent_1px),linear-gradient(to_bottom,#1e293b40_1px,transparent_1px)] opacity-60" />
          
          <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6 border border-primary/20">
              <Sparkles className="h-3 w-3" />
              <span>CorpScale Certified Architecture</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-foreground mb-6 max-w-4xl mx-auto leading-tight text-balance">
              Professional Grade ERP for <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-tertiary dark:from-white dark:to-tertiary">
                Modern Academic Institutions
              </span>
            </h1>

            <p className="text-lg text-secondary dark:text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
              A comprehensive system built for long-session productivity. Engineered with clean layouts, strict accessibility, and microsecond responses for university operations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="h-11 px-6 rounded-sm bg-primary hover:bg-primary-dark text-white shadow-medium font-medium transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0">
                  Deploy Workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#demo">
                <Button variant="outline" size="lg" className="h-11 px-6 rounded-sm bg-card hover:bg-muted text-primary border-border shadow-subtle font-medium transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0">
                  Interactive Demo
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Bento Grid Preview Section */}
        <section id="demo" className="py-24 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Live Sandbox Preview</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mt-2 text-foreground">
                High Density Information Architecture
              </h2>
              <p className="text-secondary dark:text-muted-foreground max-w-2xl mx-auto mt-3 text-sm">
                Interact with the mock module dashboards below to experience our data density, strict border layouts, and immediate response budgets.
              </p>
            </div>

            {/* Bento Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Bento Card 1: Academic Ledger (Col Span 2) */}
              <Card className="col-span-1 md:col-span-2 bg-card border border-border shadow-subtle rounded-sm p-5 hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-medium transition-all duration-150 group">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 bg-primary/10 text-primary rounded-xs flex items-center justify-center">
                      <GraduationCap className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-foreground">Academic Ledger</h3>
                      <p className="text-xs text-secondary">Student Gradebook & Enrollment</p>
                    </div>
                  </div>
                  {/* Semester Toggle Selector */}
                  <div className="flex bg-muted p-0.5 rounded-xs">
                    <button
                      onClick={() => setSelectedSem(1)}
                      className={`px-3 py-1 text-xs font-semibold rounded-xs transition-all duration-100 ${
                        selectedSem === 1 ? "bg-card text-primary shadow-subtle" : "text-secondary hover:text-primary"
                      }`}
                    >
                      Semester 1
                    </button>
                    <button
                      onClick={() => setSelectedSem(2)}
                      className={`px-3 py-1 text-xs font-semibold rounded-xs transition-all duration-100 ${
                        selectedSem === 2 ? "bg-card text-primary shadow-subtle" : "text-secondary hover:text-primary"
                      }`}
                    >
                      Semester 2
                    </button>
                  </div>
                </div>

                {/* Dense Table Layout (CorpScale standard: 8px cell padding, 12px header padding, 0px border radius) */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-muted/40">
                        <th className="p-3 font-semibold text-secondary">Course Code & Description</th>
                        <th className="p-3 font-semibold text-secondary text-center">Grade</th>
                        <th className="p-3 font-semibold text-secondary text-center">Credits</th>
                        <th className="p-3 font-semibold text-secondary text-right">Workflow Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeGrades.map((g, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-border hover:bg-muted/30 transition-colors duration-100"
                        >
                          <td className="p-2 font-medium text-foreground">{g.course}</td>
                          <td className="p-2 text-center font-mono font-medium">{g.grade}</td>
                          <td className="p-2 text-center font-mono">{g.credits}</td>
                          <td className="p-2 text-right">
                            <span
                              className={`inline-flex items-center rounded-xs px-2 py-0.5 text-[10px] font-semibold ${
                                g.status === "Approved"
                                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                  : g.status === "Pending"
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                  : "bg-slate-500/10 text-slate-700 dark:text-slate-400"
                              }`}
                            >
                              {g.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[11px] text-secondary">
                  <span>Showing dense academic ledger details (keyboard navigability ready)</span>
                  <Link href="/login" className="text-tertiary hover:underline inline-flex items-center gap-0.5">
                    Open module <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Card>

              {/* Bento Card 2: Faculty Portal (Col Span 1) */}
              <Card className="bg-card border border-border shadow-subtle rounded-sm p-5 hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-medium transition-all duration-150 group">
                <div className="flex items-center gap-2.5 border-b border-border pb-4 mb-4">
                  <div className="h-8 w-8 bg-primary/10 text-primary rounded-xs flex items-center justify-center">
                    <Users className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground">Faculty Panel</h3>
                    <p className="text-xs text-secondary">Attendance Marking System</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-secondary">Class: CS-301 Algorithms</span>
                    <span className="text-primary font-mono bg-accent/60 px-1.5 py-0.5 rounded-xs">
                      {presentCount}/{attendance.length} Present ({((presentCount / attendance.length) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  
                  {/* Attendance List */}
                  <div className="divide-y divide-border border-y border-border bg-muted/20">
                    {attendance.map((student, idx) => (
                      <div
                        key={idx}
                        className="py-1.5 flex items-center justify-between text-xs hover:bg-muted/40 transition-colors duration-100"
                      >
                        <div>
                          <div className="font-semibold text-foreground leading-none">{student.name}</div>
                          <span className="text-[10px] text-secondary font-mono">{student.id}</span>
                        </div>
                        <button
                          onClick={() => toggleAttendance(idx)}
                          className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold border transition-all duration-100 ${
                            student.status === "Present"
                              ? "bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20"
                              : "bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20"
                          }`}
                        >
                          {student.status}
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-secondary mt-1 italic">
                    💡 Click status tags above to toggle simulated attendance values.
                  </p>
                </div>
              </Card>

              {/* Bento Card 3: Campus Infrastructure (Col Span 1) */}
              <Card className="bg-card border border-border shadow-subtle rounded-sm p-5 hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-medium transition-all duration-150 group">
                <div className="flex items-center gap-2.5 border-b border-border pb-4 mb-4">
                  <div className="h-8 w-8 bg-primary/10 text-primary rounded-xs flex items-center justify-center">
                    <Building2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground">Infrastructure</h3>
                    <p className="text-xs text-secondary">Asset Management & Live Status</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Progress Indicators */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-foreground">Hostel Block A Capacity</span>
                      <span className="font-mono text-secondary">92%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-xs overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "92%" }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-foreground">Main Library Occupancy</span>
                      <span className="font-mono text-secondary">48%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-xs overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: "48%" }} />
                    </div>
                  </div>

                  {/* Active Services */}
                  <div className="border-t border-border pt-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-secondary flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Bus Route 4 Tracker
                      </span>
                      <span className="font-semibold text-green-700 dark:text-green-400 bg-green-500/10 px-1.5 py-0.25 rounded-xs">
                        Arrived
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-secondary flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> Block B AC Mainte.
                      </span>
                      <span className="font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.25 rounded-xs">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Bento Card 4: Financial Operations (Col Span 2) */}
              <Card className="col-span-1 md:col-span-2 bg-card border border-border shadow-subtle rounded-sm p-5 hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-medium transition-all duration-150 group">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 bg-primary/10 text-primary rounded-xs flex items-center justify-center">
                      <Wallet className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-foreground">Financial Accounts</h3>
                      <p className="text-xs text-secondary">Student Ledger & Invoicing</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-foreground">Account Status: Good Standing</span>
                </div>

                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-muted/40">
                          <th className="p-3 font-semibold text-secondary">Invoice Ref</th>
                          <th className="p-3 font-semibold text-secondary">Description</th>
                          <th className="p-3 font-semibold text-secondary text-right">Amount</th>
                          <th className="p-3 font-semibold text-secondary text-center">Status</th>
                          <th className="p-3 font-semibold text-secondary text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.map((inv, idx) => (
                          <tr key={idx} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-2 font-mono text-foreground">{inv.id}</td>
                            <td className="p-2 text-foreground font-medium">{inv.desc}</td>
                            <td className="p-2 text-right font-mono font-medium">{inv.amount}</td>
                            <td className="p-2 text-center">
                              <span
                                className={`inline-flex items-center rounded-xs px-2 py-0.5 text-[10px] font-semibold ${
                                  inv.status === "Approved"
                                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                }`}
                              >
                                {inv.status === "Approved" ? "Paid" : "Pending"}
                              </span>
                            </td>
                            <td className="p-2 text-right">
                              {inv.status === "Pending" ? (
                                <button
                                  onClick={() => handlePayInvoice(inv.id)}
                                  className="px-2.5 py-1 text-[10px] font-semibold bg-primary hover:bg-primary-dark text-white rounded-xs border-none shadow-subtle transition-all duration-100 hover:scale-102 active:scale-98"
                                >
                                  Quick Pay
                                </button>
                              ) : (
                                <span className="text-[10px] text-secondary font-mono">Completed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
              
              {/* Bento Card 5: Real-time Analytics (Col Span 1) */}
              <Card className="bg-card border border-border shadow-subtle rounded-sm p-5 hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-medium transition-all duration-150 group">
                <div className="flex items-center gap-2.5 border-b border-border pb-4 mb-4">
                  <div className="h-8 w-8 bg-primary/10 text-primary rounded-xs flex items-center justify-center">
                    <TrendingUp className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-foreground">System Metrics</h3>
                    <p className="text-xs text-secondary">Performance & Engagement</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-3 bg-muted/40 rounded-xs border border-border/80">
                    <div className="text-secondary text-[11px] font-medium uppercase tracking-wider">Average Semester CGPA</div>
                    <div className="text-2xl font-serif font-bold text-foreground mt-0.5 font-mono">3.74 / 4.00</div>
                    <p className="text-[10px] text-green-600 font-semibold mt-1 flex items-center gap-0.5">
                      ▲ +0.08 from last semester
                    </p>
                  </div>

                  <div className="p-3 bg-muted/40 rounded-xs border border-border/80">
                    <div className="text-secondary text-[11px] font-medium uppercase tracking-wider">Active Course Roster</div>
                    <div className="text-2xl font-serif font-bold text-foreground mt-0.5 font-mono">12 Active</div>
                    <p className="text-[10px] text-secondary mt-1">
                      Within structural graduation limit
                    </p>
                  </div>
                </div>
              </Card>

            </div>
          </div>
        </section>

        {/* System Overview Statistics (Noto Serif Bold) */}
        <section className="py-20 border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-serif font-bold text-primary mb-2">15,420+</div>
              <div className="text-xs text-secondary uppercase tracking-widest font-semibold">Enrolled Students</div>
            </div>
            <div>
              <div className="text-4xl font-serif font-bold text-primary mb-2">524+</div>
              <div className="text-xs text-secondary uppercase tracking-widest font-semibold">Active Faculty Members</div>
            </div>
            <div>
              <div className="text-4xl font-serif font-bold text-primary mb-2">128+</div>
              <div className="text-xs text-secondary uppercase tracking-widest font-semibold">Degree Courses Offered</div>
            </div>
            <div>
              <div className="text-4xl font-serif font-bold text-primary mb-2">99.99%</div>
              <div className="text-xs text-secondary uppercase tracking-widest font-semibold">System Uptime Guarantee</div>
            </div>
          </div>
        </section>

        {/* Feature Cards Showcase */}
        <section id="features" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Enterprise Features</span>
              <h2 className="text-3xl font-serif font-bold mt-2 text-foreground">Built for Scale & Security</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-card border border-border rounded-sm shadow-subtle hover:border-slate-400 dark:hover:border-slate-700 transition-all duration-150">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-xs flex items-center justify-center mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-foreground mb-2">Role-Based Access (RBAC)</h3>
                <p className="text-secondary dark:text-muted-foreground text-xs leading-relaxed">
                  Highly granular permissions structure segregating Admins, Faculty, Students, and Parents. Cryptographically signed JWT workflows verify every request context.
                </p>
              </div>

              <div className="p-6 bg-card border border-border rounded-sm shadow-subtle hover:border-slate-400 dark:hover:border-slate-700 transition-all duration-150">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-xs flex items-center justify-center mb-4">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-foreground mb-2">Automated Scheduler</h3>
                <p className="text-secondary dark:text-muted-foreground text-xs leading-relaxed">
                  Intelligent algorithms construct constraint-free timetables for courses, professors, and exam halls automatically. Minimizes conflict resolution intervals.
                </p>
              </div>

              <div className="p-6 bg-card border border-border rounded-sm shadow-subtle hover:border-slate-400 dark:hover:border-slate-700 transition-all duration-150">
                <div className="h-10 w-10 bg-primary/10 text-primary rounded-xs flex items-center justify-center mb-4">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-foreground mb-2">Unified Library Systems</h3>
                <p className="text-secondary dark:text-muted-foreground text-xs leading-relaxed">
                  Fully indexed digital repository cataloging book allocations, reserve queues, due dates, and academic journals. Direct notifications on pending collections.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Inquiry Section */}
        <section id="contact" className="py-24 bg-muted/40 border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Institutional Admissions</span>
              <h2 className="text-3xl font-serif font-bold mt-2 text-foreground">Request Administration Access</h2>
              <p className="text-secondary dark:text-muted-foreground max-w-xl mx-auto mt-3 text-xs">
                Submit an official inquiry. Our systems operations group will configure and dispatch credentials for your campus division.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              
              {/* Form Card */}
              <Card className="p-6 bg-card border border-border shadow-subtle rounded-sm">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">First Name</label>
                      <input
                        required
                        className="w-full px-3 py-2 text-xs border border-border-input hover:border-border-input-hover focus:border-primary focus:ring-2 focus:ring-primary/12 bg-card rounded-sm text-foreground focus:outline-none transition-all duration-150"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-foreground">Last Name</label>
                      <input
                        required
                        className="w-full px-3 py-2 text-xs border border-border-input hover:border-border-input-hover focus:border-primary focus:ring-2 focus:ring-primary/12 bg-card rounded-sm text-foreground focus:outline-none transition-all duration-150"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Institutional Email</label>
                    <input
                      required
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className={`w-full px-3 py-2 text-xs border bg-card rounded-sm text-foreground focus:outline-none transition-all duration-150 ${
                        emailError
                          ? "border-error focus:border-error focus:ring-2 focus:ring-error/10 bg-red-500/5"
                          : "border-border-input hover:border-border-input-hover focus:border-primary focus:ring-2 focus:ring-primary/12"
                      }`}
                      placeholder="john.doe@university.edu"
                    />
                    {emailError && (
                      <p className="text-[11px] text-error font-medium flex items-center gap-1 mt-0.5">
                        <AlertCircle className="h-3 w-3" /> {emailError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">Inquiry Details</label>
                    <textarea
                      required
                      className="w-full px-3 py-2 text-xs border border-border-input hover:border-border-input-hover focus:border-primary focus:ring-2 focus:ring-primary/12 bg-card rounded-sm text-foreground focus:outline-none min-h-[100px] transition-all duration-150"
                      placeholder="Specify your university branch and administrative requirements..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-dark text-white rounded-sm border-none shadow-medium py-2 text-xs font-semibold h-9 transition-all duration-150"
                  >
                    Send Registration Request
                  </Button>

                  {formSubmitted && (
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-sm flex items-center gap-2 text-green-700 dark:text-green-400 text-xs">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Request successfully dispatched. An administrator will verify your credentials.</span>
                    </div>
                  )}
                </form>
              </Card>

              {/* Support info card */}
              <div className="space-y-6 flex flex-col justify-center">
                <Card className="p-5 flex items-start gap-4 border border-border shadow-subtle hover:border-slate-400 dark:hover:border-slate-700 transition-all duration-150 rounded-sm">
                  <div className="h-9 w-9 rounded-xs bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-foreground mb-0.5">Campus Headquarters</h4>
                    <p className="text-secondary dark:text-muted-foreground text-xs leading-relaxed">
                      123 Education Lane, Knowledge City<br />
                      Academic District, Suite 400
                    </p>
                  </div>
                </Card>

                <Card className="p-5 flex items-start gap-4 border border-border shadow-subtle hover:border-slate-400 dark:hover:border-slate-700 transition-all duration-150 rounded-sm">
                  <div className="h-9 w-9 rounded-xs bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-foreground mb-0.5">Academic Inquiries</h4>
                    <p className="text-secondary dark:text-muted-foreground text-xs leading-relaxed">
                      admin-office@nova-university.edu<br />
                      +1 (555) 123-4567
                    </p>
                  </div>
                </Card>

                <Card className="p-5 flex items-start gap-4 border border-border shadow-subtle hover:border-slate-400 dark:hover:border-slate-700 transition-all duration-150 rounded-sm">
                  <div className="h-9 w-9 rounded-xs bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-foreground mb-0.5">Security & Compliance Office</h4>
                    <p className="text-secondary dark:text-muted-foreground text-xs leading-relaxed">
                      compliance@nova-university.edu<br />
                      FERPA / HEA Secure Vault Certified
                    </p>
                  </div>
                </Card>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-sm bg-primary flex items-center justify-center text-primary-foreground font-serif text-sm font-bold shadow-medium">
              NU
            </div>
            <span className="font-serif font-bold text-base text-primary dark:text-foreground">Nova University ERP</span>
          </div>
          <div className="text-xs text-secondary">
            &copy; {new Date().getFullYear()} Nova University System. All rights reserved. CorpScale v1.4.
          </div>
          <div className="flex gap-6 text-xs text-secondary">
            <a href="#" className="hover:text-primary hover:underline transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary hover:underline transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
