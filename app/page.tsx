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
  Sparkles
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10 selection:text-primary">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
              NU
            </div>
            <span className="font-bold text-xl tracking-tight">Nova University ERP</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#about" className="hover:text-primary transition-colors">About</a>
            <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                Get Started
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Sparkles className="h-4 w-4" />
              <span>Next Generation University Management</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 text-balance animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Transform Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Academic Experience
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-balance animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              A comprehensive, all-in-one ERP solution designed to streamline administration, enhance student learning, and empower faculty success.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8 text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-12 px-8 text-lg hover:bg-muted/50 transition-all hover:scale-105 active:scale-95">
                  Existing User?
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Everything You Need</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built with a focus on usability and performance, our platform handles every aspect of university operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 - Large */}
              <Card className="col-span-1 md:col-span-2 p-8 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/50 transition-colors group">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Academic Management</h3>
                <p className="text-muted-foreground">
                  Streamline the entire academic lifecycle. From course registration to grading, transcripts, and certifications. Empower students with real-time access to their academic progress.
                </p>
              </Card>

              {/* Feature 2 */}
              <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/50 transition-colors group">
                <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Faculty Portal</h3>
                <p className="text-muted-foreground text-sm">
                  Dedicated tools for faculty to manage classes, mark attendance, uploads notes, and track student performance.
                </p>
              </Card>

              {/* Feature 3 */}
              <Card className="p-8 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/50 transition-colors group">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Campus Infrastructure</h3>
                <p className="text-muted-foreground text-sm">
                  Manage hostels, transport, and library resources efficiently. Track occupancy and asset utilization.
                </p>
              </Card>

              {/* Feature 4 - Large */}
              <Card className="col-span-1 md:col-span-2 p-8 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/50 transition-colors group">
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Wallet className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Financial Operations</h3>
                <p className="text-muted-foreground">
                  Complete fee management system with online payment integration, scholarship tracking, and automated invoice generation. Get real-time financial insights.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 bg-background relative overflow-hidden">
          <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-primary/5 blur-3xl rounded-l-full"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary opacity-30 blur-lg rounded-xl"></div>
                <div className="relative aspect-square rounded-xl bg-muted overflow-hidden flex items-center justify-center border border-border/50 shadow-2xl">
                  <span className="text-6xl">🏛️</span>
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
                  <ShieldCheck className="h-4 w-4" />
                  <span>About Us</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Empowering the Future of Education</h2>
                <p className="text-muted-foreground text-lg mb-6 text-balance">
                  Nova University is a pioneer in digital education management. We believe in harnessing technology to create seamless, efficient, and inspiring educational environments.
                </p>
                <div className="space-y-4">
                  {[
                    "Global Accreditation & Recognition",
                    "Industry-Leading Faculty Members",
                    "State-of-the-art Research Facilities",
                    "Comprehensive Student Support Systems"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">15k+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Faculty</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">120+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Uptime</div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Get in Touch</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Have questions? Our support team is here to help you 24/7.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-8 border-border/50">
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <input className="w-full p-2 rounded-md border bg-background" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <input className="w-full p-2 rounded-md border bg-background" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input className="w-full p-2 rounded-md border bg-background" type="email" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <textarea className="w-full p-2 rounded-md border bg-background min-h-[120px]" placeholder="How can we help you?" />
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">Send Message</Button>
                </form>
              </Card>

              <div className="space-y-8 flex flex-col justify-center">
                <Card className="p-6 flex items-start gap-4 border-border/50 hover:border-primary/50 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Campus Location</h3>
                    <p className="text-muted-foreground text-sm">
                      123 Education Lane, Knowledge City<br />
                      Academic District, 40001
                    </p>
                  </div>
                </Card>

                <Card className="p-6 flex items-start gap-4 border-border/50 hover:border-primary/50 transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Admissions</h3>
                    <p className="text-muted-foreground text-sm">
                      +1 (555) 123-4567<br />
                      admissions@nova-university.edu
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-muted/20 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              NU
            </div>
            <span className="font-bold text-lg">Nova University ERP</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Nova University. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
