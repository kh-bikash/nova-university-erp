import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params
    const res = await query('SELECT * FROM students WHERE id = $1', [id])
    if (res.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(res.rows[0])
  } catch (error) {
    console.error('[KL-ERP] Students GET by id error:', error)
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 })
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params
    const body = await request.json()
    const { full_name, dob, gender, department_id, batch_year, address, phone } = body

    const res = await query(
      `UPDATE students SET full_name=$1, dob=$2, gender=$3, department_id=$4, batch_year=$5, address=$6, phone=$7, updated_at = CURRENT_TIMESTAMP WHERE id=$8 RETURNING *`,
      [full_name, dob, gender, department_id, batch_year, address, phone, id]
    )

    if (res.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(res.rows[0])
  } catch (error) {
    console.error('[KL-ERP] Students PUT error:', error)
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { id } = params
    const res = await query('DELETE FROM students WHERE id=$1 RETURNING id', [id])
    if (res.rowCount === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[KL-ERP] Students DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
  }
}
