import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const date = searchParams.get("date")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    let query = supabase.from("attendance").select("*").eq("user_id", userId).order("date", { ascending: false })

    if (date) {
      query = query.eq("date", date)
    }

    const { data: attendance, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Attendance GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { userId, action } = body

    if (!userId || !action) {
      return NextResponse.json({ error: "User ID and action required" }, { status: 400 })
    }

    const now = new Date()
    const today = now.toISOString().split("T")[0]

    if (action === "clock_in") {
      // Check if already clocked in today
      const { data: existing } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single()

      if (existing && !existing.clock_out) {
        return NextResponse.json({ error: "Already clocked in today" }, { status: 400 })
      }

      if (existing && existing.clock_out) {
        return NextResponse.json({ error: "Already completed attendance for today" }, { status: 400 })
      }

      const { data: attendance, error } = await supabase
        .from("attendance")
        .insert({
          user_id: userId,
          clock_in: now.toISOString(),
          date: today,
        })
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(attendance, { status: 201 })
    }

    if (action === "clock_out") {
      // Find today's attendance record
      const { data: attendance } = await supabase
        .from("attendance")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single()

      if (!attendance) {
        return NextResponse.json({ error: "No clock-in record found for today" }, { status: 400 })
      }

      if (attendance.clock_out) {
        return NextResponse.json({ error: "Already clocked out today" }, { status: 400 })
      }

      const clockIn = new Date(attendance.clock_in)
      const totalHours = (now.getTime() - clockIn.getTime()) / (1000 * 60 * 60)

      const { data: updatedAttendance, error } = await supabase
        .from("attendance")
        .update({
          clock_out: now.toISOString(),
          total_hours: Math.round(totalHours * 100) / 100,
        })
        .eq("id", attendance.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(updatedAttendance)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Attendance POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
