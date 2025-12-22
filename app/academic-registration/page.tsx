"use client"

import { Card } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function AcademicRegistrationPage() {
    return (
        <div className="p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Academic Registration</h1>
            <Card className="p-12 text-center border-dashed">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Course Registration</h3>
                <p className="text-muted-foreground">Register for your courses for the upcoming semester.</p>
            </Card>
        </div>
    )
}
