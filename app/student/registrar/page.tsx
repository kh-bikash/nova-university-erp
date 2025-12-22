
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, FileText, CreditCard, GraduationCap, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function RegistrarPage() {
    return (
        <div className="p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Registrar Office</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your academic records, official documents, and university enrollment.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Document Services
                        </CardTitle>
                        <CardDescription>Request official transcripts, bonafide certificates, and ID cards.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/student/services">
                            <Button className="w-full group">
                                Go to Services
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            Fee & Payments
                        </CardTitle>
                        <CardDescription>View fee structure, payment history, and dues.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/student/fees">
                            <Button variant="outline" className="w-full group">
                                Manage Fees
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            Academic Policies
                        </CardTitle>
                        <CardDescription>Access university handbook, rules, and academic calendar.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="secondary" className="w-full cursor-not-allowed" disabled>
                            View Handbook (Coming Soon)
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Contact Registrar</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <p><strong>Office Hours:</strong> Mon-Fri, 9:00 AM - 4:00 PM</p>
                        <p><strong>Email:</strong> registrar@university.edu</p>
                        <p><strong>Location:</strong> Admin Block, Ground Floor</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
