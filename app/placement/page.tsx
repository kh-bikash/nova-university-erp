"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Briefcase, MapPin, DollarSign, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"

export default function StudentPlacementPage() {
    const { user } = useAuth()

    if (!user || user.role !== "student") {
        return null
    }

    return (
        <ProtectedRoute>
            <StudentPlacementContent />
        </ProtectedRoute>
    )
}

function StudentPlacementContent() {
    const toast = useToast()
    const [jobs, setJobs] = useState<any[]>([])
    const [myApplications, setMyApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const [applyForm, setApplyForm] = useState({ job_id: "", resume_link: "", cover_letter: "" })
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const [jRes, aRes] = await Promise.all([
                fetch('/api/placement/jobs'),
                fetch('/api/placement/applications')
            ])

            if (jRes.ok) setJobs(await jRes.json())
            if (aRes.ok) setMyApplications(await aRes.json())
        } catch (error) {
            console.error("Failed to fetch data", error)
        } finally {
            setLoading(false)
        }
    }

    const handleApply = async () => {
        try {
            const res = await fetch('/api/placement/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(applyForm)
            })
            if (res.ok) {
                toast.toast({ title: "Success", description: "Application submitted" })
                setIsApplyDialogOpen(false)
                fetchData()
            } else {
                const data = await res.json()
                toast.toast({ title: "Error", description: data.error, variant: "destructive" })
            }
        } catch (error) {
            toast.toast({ title: "Error", description: "Failed to apply", variant: "destructive" })
        }
    }

    const openApplyDialog = (jobId: string) => {
        setApplyForm({ ...applyForm, job_id: jobId })
        setIsApplyDialogOpen(true)
    }

    const hasApplied = (jobId: string) => {
        return myApplications.some(app => app.job_id === jobId)
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Placement Cell</h1>
                <p className="text-muted-foreground mt-1">Explore opportunities and build your career</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold">Active Job Openings</h2>
                    {jobs.map(job => (
                        <Card key={job.id} className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{job.title}</h3>
                                    <p className="text-primary font-medium">{job.company_name}</p>
                                </div>
                                {hasApplied(job.id) ? (
                                    <Button disabled variant="secondary">Applied</Button>
                                ) : (
                                    <Button onClick={() => openApplyDialog(job.id)}>Apply Now</Button>
                                )}
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4 mb-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin size={16} /> {job.location}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <DollarSign size={16} /> {job.salary_range}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar size={16} /> Deadline: {format(new Date(job.deadline_date), 'MMM d')}
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground line-clamp-2">
                                {job.description}
                            </div>
                        </Card>
                    ))}
                </div>

                <div>
                    <h2 className="text-xl font-semibold mb-6">My Applications</h2>
                    <div className="space-y-4">
                        {myApplications.length === 0 ? (
                            <Card className="p-6 text-center text-muted-foreground text-sm">
                                No applications yet.
                            </Card>
                        ) : (
                            myApplications.map(app => (
                                <Card key={app.id} className="p-4">
                                    <h4 className="font-bold">{app.job_title}</h4>
                                    <p className="text-sm text-muted-foreground">{app.company_name}</p>
                                    <div className="mt-2 flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">{format(new Date(app.application_date), 'MMM d')}</span>
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            {app.status}
                                        </span>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Apply for Job</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Resume Link (Google Drive/LinkedIn)</Label>
                            <Input value={applyForm.resume_link} onChange={e => setApplyForm({ ...applyForm, resume_link: e.target.value })} placeholder="https://..." />
                        </div>
                        <div>
                            <Label>Cover Letter (Optional)</Label>
                            <Textarea value={applyForm.cover_letter} onChange={e => setApplyForm({ ...applyForm, cover_letter: e.target.value })} placeholder="Why are you a good fit?" />
                        </div>
                        <Button onClick={handleApply} className="w-full">Submit Application</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
