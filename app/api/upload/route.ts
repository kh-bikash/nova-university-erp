
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = `${uuidv4()}${path.extname(file.name)}`
        const uploadDir = path.join(process.cwd(), 'public/uploads')

        try {
            await require('fs/promises').mkdir(uploadDir, { recursive: true })
        } catch (e) {
            // ignore exist error
        }

        await writeFile(path.join(uploadDir, filename), buffer)

        const fileUrl = `/uploads/${filename}`

        return NextResponse.json({
            success: true,
            url: fileUrl
        })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
