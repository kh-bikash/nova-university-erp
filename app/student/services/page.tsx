
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, FileText, CheckCircle, Clock, XCircle } from "lucide-react"

interface ServiceRequest {
    id: string
    service_type: string
    description: string
    status: string
    admin_remarks: string | null
    request_date: string
}

export default function StudentServicesPage() {
    const [requests, setRequests] = useState<ServiceRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    // Form state
    const [serviceType, setServiceType] = useState("")
    const [description, setDescription] = useState("")

    const { toast } = useToast()

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/student/services')
            const json = await res.json()
            if (json.success) {
                setRequests(json.data)
            }
        } catch (error) {
            console.error("Failed to fetch requests:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const res = await fetch('/api/student/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceType, description }),
            })

            const json = await res.json()

            if (json.success) {
                toast({
                    title: "Request Submitted",
                    description: "Your service request has been submitted successfully.",
                })
                setServiceType("")
                setDescription("")
                fetchRequests() // Refresh list
            } else {
                toast({
                    title: "Error",
                    description: json.error || "Failed to submit request",
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
            setSubmitting(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>
            case 'rejected': return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>
            default: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
        }
    }

    const formatType = (type: string) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Student Services</h1>
                <p className="text-muted-foreground mt-2">
                    Request certificates, documents, and other services.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Request Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>New Request</CardTitle>
                        <CardDescription>Submit a new service request to the administration.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="service-type">Service Type</Label>
                                <Select value={serviceType} onValueChange={setServiceType} required>
                                    <SelectTrigger id="service-type">
                                        <SelectValue placeholder="Select a service" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="bonafide">Bonafide Certificate</SelectItem>
                                        <SelectItem value="transfer_certificate">Transfer Certificate</SelectItem>
                                        <SelectItem value="id_card">ID Card Replacement</SelectItem>
                                        <SelectItem value="transcript">Official Transcript</SelectItem>
                                        <SelectItem value="course_completion">Course Completion Certificate</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description / Remarks</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Any specific details involved..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Request"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Requests List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">My Requests</h2>
                    {requests.length === 0 ? (
                        <Card className="bg-muted/50 border-dashed">
                            <CardContent className="p-8 text-center text-muted-foreground">
                                <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                                <p>No service requests found.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {requests.map(req => (
                                <Card key={req.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-base font-semibold">{formatType(req.service_type)}</CardTitle>
                                            {getStatusBadge(req.status)}
                                        </div>
                                        <CardDescription className="text-xs">
                                            {new Date(req.request_date).toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        {req.description && <p className="mb-2 text-muted-foreground">{req.description}</p>}
                                        {req.admin_remarks && (
                                            <div className="bg-muted p-2 rounded text-xs mt-2">
                                                <span className="font-semibold">Admin:</span> {req.admin_remarks}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
