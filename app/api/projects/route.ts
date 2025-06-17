import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { z } from "zod"

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(["planning", "active", "on_hold", "completed", "cancelled"]).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Get user's projects with related data
    const { data: projects, error } = await supabase
      .from("projects")
      .select(`
        *,
        project_assignments!inner(user_id),
        tasks(id, status),
        profiles!projects_created_by_fkey(full_name)
      `)
      .eq("project_assignments.user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate progress for each project
    const projectsWithProgress = projects.map((project) => {
      const totalTasks = project.tasks.length
      const completedTasks = project.tasks.filter((task: any) => task.status === "done").length
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      return {
        ...project,
        progress_percentage: progress,
        created_by_name: project.profiles?.full_name,
        task_count: totalTasks,
        completed_tasks: completedTasks,
      }
    })

    return NextResponse.json(projectsWithProgress)
  } catch (error) {
    console.error("Projects API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const body = await request.json()
    const { userId, ...projectData } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    // Validate user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const validatedData = projectSchema.parse(projectData)

    const { data: project, error } = await supabase
      .from("projects")
      .insert({
        ...validatedData,
        created_by: userId,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Projects POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
