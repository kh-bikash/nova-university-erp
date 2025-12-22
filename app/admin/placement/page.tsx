"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Briefcase, Building, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function AdminPlacementPage() {
    const { user } = useAuth()

    if (!user || user.role !== "admin") {
        return null
    }

    return (
        <ProtectedRoute>
            <AdminPlacementContent />
        </ProtectedRoute>
    )
}

function AdminPlacementContent() {
    const toast = useToast()
    const [jobs, setJobs] = useState<any[]>([])
    const [companies, setCompanies] = useState<any[]>([]) // Need API to fetch companies separately if needed, or extract from jobs
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Dialogs
    const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false)
    const [isJobDialogOpen, setIsJobDialogOpen] = useState(false)

    // Forms
    const [companyForm, setCompanyForm] = useState({ name: "", industry: "", website: "", contact_email: "", contact_phone: "", address: "" })
    const [jobForm, setJobForm] = useState({ company_id: "", title: "", description: "", requirements: "", location: "", salary_range: "", job_type: "full-time", deadline_date: "" })

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const jRes = await fetch('/api/placement/jobs')
            if (jRes.ok) {
                const jobsData = await jRes.json()
                setJobs(jobsData)
            }

            const cRes = await fetch('/api/placement/companies')
            if (cRes.ok) {
                setCompanies(await cRes.json())
            }

            const aRes = await fetch('/api/placement/applications')
            if (aRes.ok) setApplications(await aRes.json())

        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCompany = async () => {
        try {
            const res = await fetch('/api/placement/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'company', ...companyForm })
            })
            if (res.ok) {
                toast.toast({ title: "Success", description: "Company added" })
                setIsCompanyDialogOpen(false)
                // Fetch companies again
                const cRes = await fetch('/api/placement/companies')
                if (cRes.ok) setCompanies(await cRes.json())
            }
        } catch (error) {
            toast.toast({ title: "Error", description: "Failed to add company", variant: "destructive" })
        }
    }

    const handleCreateJob = async () => {
        try {
            const res = await fetch('/api/placement/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'job', ...jobForm })
            })
            if (res.ok) {
                toast.toast({ title: "Success", description: "Job posted" })
                setIsJobDialogOpen(false)
                fetchData()
            }
        } catch (error) {
            toast.toast({ title: "Error", description: "Failed to post job", variant: "destructive" })
        }
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Placement Cell</h1>
                    <p className="text-muted-foreground mt-1">Manage drives and applications</p>
                </div>
            </div>

            <Tabs defaultValue="jobs" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="jobs">Job Postings</TabsTrigger>
                    <TabsTrigger value="applications">Applications</TabsTrigger>
                </TabsList>

                <TabsContent value="jobs" className="space-y-4">
                    <div className="flex gap-2 justify-end">
                        <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
                            <DialogTrigger asChild><Button variant="outline"><Plus size={16} className="mr-2" /> Add Company</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Add Company</DialogTitle></DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div><Label>Name</Label><Input value={companyForm.name} onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })} /></div>
                                    <div><Label>Industry</Label><Input value={companyForm.industry} onChange={e => setCompanyForm({ ...companyForm, industry: e.target.value })} /></div>
                                    <div><Label>Website</Label><Input value={companyForm.website} onChange={e => setCompanyForm({ ...companyForm, website: e.target.value })} /></div>
                                    <Button onClick={handleCreateCompany}>Add Company</Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={isJobDialogOpen} onOpenChange={setIsJobDialogOpen}>
                            <DialogTrigger asChild><Button><Plus size={16} className="mr-2" /> Post Job</Button></DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader><DialogTitle>Post New Job</DialogTitle></DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                    <div className="col-span-2">
                                        <Label>Company</Label>
                                        <Select value={jobForm.company_id} onValueChange={v => setJobForm({ ...jobForm, company_id: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select Company" /></SelectTrigger>
                                            <SelectContent>
                                                {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-span-2"><Label>Job Title</Label><Input value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} /></div>
                                    <div className="col-span-2"><Label>Description</Label><Textarea value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} /></div>
                                    <div><Label>Location</Label><Input value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} /></div>
                                    <div><Label>Salary Range</Label><Input value={jobForm.salary_range} onChange={e => setJobForm({ ...jobForm, salary_range: e.target.value })} /></div>
                                    <div><Label>Deadline</Label><Input type="date" value={jobForm.deadline_date} onChange={e => setJobForm({ ...jobForm, deadline_date: e.target.value })} /></div>
                                </div>
                                <Button onClick={handleCreateJob} className="w-full">Post Job</Button>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-4">
                        {jobs.map(job => (
                            <Card key={job.id} className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg">{job.title}</h3>
                                        <p className="text-primary font-medium">{job.company_name}</p>
                                        <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                                            <span>{job.location}</span>
                                            <span>{job.salary_range}</span>
                                            <span>Deadline: {format(new Date(job.deadline_date), 'MMM d, yyyy')}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">{job.applicant_count}</div>
                                        <div className="text-xs text-muted-foreground">Applicants</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="applications">
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Job Role</TableHead>
                                    <TableHead>CGPA</TableHead>
                                    <TableHead>Applied Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map(app => (
                                    <TableRow key={app.id}>
                                        <TableCell>
                                            <div className="font-medium">{app.student_name}</div>
                                            <div className="text-xs text-muted-foreground">{app.enrollment_number}</div>
                                        </TableCell>
                                        <TableCell>{app.job_title}</TableCell>
                                        <TableCell>{app.cgpa}</TableCell>
                                        <TableCell>{format(new Date(app.application_date), 'MMM d, yyyy')}</TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                {app.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
