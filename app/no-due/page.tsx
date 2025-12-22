"use client"

import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function NoDuePage() {
    return (
        <div className="p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">No Due Certificate</h1>
            <Card className="p-12 text-center border-dashed">
                <CheckCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Clearance Status</h3>
                <p className="text-muted-foreground">Check your no-due status across departments.</p>
            </Card>
        </div>
    )
}
