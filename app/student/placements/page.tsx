
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Briefcase, MapPin, Building, DollarSign, Calendar, CheckCircle } from "lucide-react"

interface Job {
    id: string
    title: string
    description: string
    requirements: string
    location: string
    salary_range: string
    job_type: string
    deadline_date: string
    company_name: string
    industry: string
    application_status: string | null
}

export default function StudentPlacementsPage() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState<string | null>(null)
    const { toast } = useToast()

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        try {
            const res = await fetch('/api/placements/jobs')
            const json = await res.json()
            if (json.success) {
                setJobs(json.data)
            } else {
                console.error("Failed to fetch jobs:", json.error)
            }
        } catch (error) {
            console.error("Failed to fetch jobs:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleApply = async (jobId: string) => {
        setApplying(jobId)
        try {
            const res = await fetch('/api/placements/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobId }),
            })

            const json = await res.json()

            if (json.success) {
                toast({
                    title: "Success",
                    description: "Successfully applied for job",
                })
                // Update local state
                setJobs(prev => prev.map(job =>
                    job.id === jobId ? { ...job, application_status: 'applied' } : job
                ))
            } else {
                toast({
                    title: "Error",
                    description: json.error || "Failed to apply",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            })
        } finally {
            setApplying(null)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Placement Cell</h1>
                    <p className="text-muted-foreground mt-2">
                        Explore and apply for campus placement opportunities.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {jobs.length === 0 ? (
                    <Card className="bg-muted/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                            <Briefcase className="h-12 w-12 mb-4 opacity-50" />
                            <h3 className="font-semibold text-lg">No Active Openings</h3>
                            <p>Check back later for new placement drives.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {jobs.map((job) => (
                            <Card key={job.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="capitalize">{job.job_type}</Badge>
                                        {job.application_status && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                                                <CheckCircle className="w-3 h-3 mr-1" /> {job.application_status}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle>{job.title}</CardTitle>
                                    <CardDescription className="flex items-center gap-1 mt-1">
                                        <Building className="h-3 w-3" /> {job.company_name} • {job.industry}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <MapPin className="h-4 w-4" /> {job.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <DollarSign className="h-4 w-4" /> {job.salary_range}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                                            <Calendar className="h-4 w-4" /> Apply by {new Date(job.deadline_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="text-sm">
                                        <p className="font-medium mb-1">Requirements:</p>
                                        <p className="text-muted-foreground line-clamp-2">{job.requirements || "See full details"}</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full"
                                        onClick={() => handleApply(job.id)}
                                        disabled={!!job.application_status || applying === job.id}
                                    >
                                        {applying === job.id ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : job.application_status ? (
                                            "Applied"
                                        ) : (
                                            "Apply Now"
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
