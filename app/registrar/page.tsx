"use client"

import { Card } from "@/components/ui/card"
import { Building2 } from "lucide-react"

export default function RegistrarPage() {
    return (
        <div className="p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Registrar Office</h1>
            <Card className="p-12 text-center border-dashed">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Administrative Services</h3>
                <p className="text-muted-foreground">Contact the registrar office for official inquiries.</p>
            </Card>
        </div>
    )
}
