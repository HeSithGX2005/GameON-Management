"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  Play,
  Square,
  Calendar,
  CheckCircle,
  AlertCircle,
  Users,
  FolderOpen,
  ClipboardList,
  LogOut,
  Building2,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { signOut } from "@/lib/auth"
import type { Profile, Project, Task, AttendanceRecord } from "@/lib/supabase"

interface DashboardUser {
  id: string
  email: string
  profile: Profile
}

interface ProjectWithProgress extends Project {
  task_count: number
  completed_tasks: number
  created_by_name: string
}

interface TaskWithProject extends Task {
  projects: { name: string }
}

export default function Dashboard() {
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [projects, setProjects] = useState<ProjectWithProgress[]>([])
  const [tasks, setTasks] = useState<TaskWithProject[]>([])
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  async function checkUser() {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/login")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single()

      if (!profile) {
        toast({
          title: "Error",
          description: "Profile not found",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      setUser({ ...authUser, profile })
    } catch (error) {
      console.error("Error checking user:", error)
      router.push("/login")
    }
  }

  async function fetchDashboardData() {
    if (!user) return

    try {
      // Fetch projects
      const projectsResponse = await fetch(`/api/projects?userId=${user.id}`)
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData.slice(0, 5)) // Limit to 5 for dashboard
      }

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from("tasks")
        .select(`
          *,
          projects(name),
          task_assignments!inner(user_id)
        `)
        .eq("task_assignments.user_id", user.id)
        .in("status", ["todo", "in_progress", "review"])
        .order("due_date", { ascending: true })
        .limit(5)

      setTasks(tasksData || [])

      // Fetch today's attendance
      const today = new Date().toISOString().split("T")[0]
      const attendanceResponse = await fetch(`/api/attendance?userId=${user.id}&date=${today}`)
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json()
        setTodayAttendance(attendanceData[0] || null)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleAttendanceAction(action: "clock_in" | "clock_out") {
    if (!user) return

    setAttendanceLoading(true)
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          action,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update attendance")
      }

      toast({
        title: "Success",
        description: action === "clock_in" ? "Clocked in successfully!" : "Clocked out successfully!",
      })

      // Refresh attendance data
      const today = new Date().toISOString().split("T")[0]
      const attendanceResponse = await fetch(`/api/attendance?userId=${user.id}&date=${today}`)
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json()
        setTodayAttendance(attendanceData[0] || null)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update attendance",
        variant: "destructive",
      })
    } finally {
      setAttendanceLoading(false)
    }
  }

  async function handleSignOut() {
    try {
      await signOut()
      router.push("/login")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isAdmin = user.profile.role === "admin"
  const isClockedIn = todayAttendance && !todayAttendance.clock_out

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">EMS</h1>
              </div>
              <div className="hidden md:block">
                <h2 className="text-lg font-semibold">Welcome back, {user.profile.full_name}!</h2>
                <p className="text-gray-600 text-sm">
                  {user.profile.department} • {isAdmin ? "Administrator" : "Employee"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Attendance Controls */}
              <div className="flex gap-2">
                {!isClockedIn ? (
                  <Button
                    onClick={() => handleAttendanceAction("clock_in")}
                    className="flex items-center gap-2"
                    disabled={attendanceLoading}
                  >
                    <Play className="h-4 w-4" />
                    {attendanceLoading ? "Clocking In..." : "Clock In"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleAttendanceAction("clock_out")}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={attendanceLoading}
                  >
                    <Square className="h-4 w-4" />
                    {attendanceLoading ? "Clocking Out..." : "Clock Out"}
                  </Button>
                )}
              </div>
              <Button variant="ghost" onClick={handleSignOut} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        {/* Mobile Welcome */}
        <div className="md:hidden">
          <h2 className="text-lg font-semibold">Welcome back, {user.profile.full_name}!</h2>
          <p className="text-gray-600 text-sm">
            {user.profile.department} • {isAdmin ? "Administrator" : "Employee"}
          </p>
        </div>

        {/* Attendance Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayAttendance ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Clock In</p>
                  <p className="font-medium">{new Date(todayAttendance.clock_in).toLocaleTimeString()}</p>
                </div>
                {todayAttendance.clock_out && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Clock Out</p>
                      <p className="font-medium">{new Date(todayAttendance.clock_out).toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Hours</p>
                      <p className="font-medium">{todayAttendance.total_hours}h</p>
                    </div>
                  </>
                )}
                <Badge variant={isClockedIn ? "default" : "secondary"}>
                  {isClockedIn ? "Clocked In" : "Clocked Out"}
                </Badge>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No attendance record for today</p>
                <p className="text-sm text-muted-foreground mt-1">Click "Clock In" to start your day</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Projects */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Active Projects
              </CardTitle>
              <CardDescription>Projects you're currently working on</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projects.length > 0 ? (
                projects.map((project, index) => (
                  <div key={project.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{project.name}</h4>
                      <Badge variant={project.status === "active" ? "default" : "secondary"}>{project.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>
                          Progress ({project.completed_tasks}/{project.task_count} tasks)
                        </span>
                        <span>{project.progress_percentage}%</span>
                      </div>
                      <Progress value={project.progress_percentage} />
                    </div>
                    {index < projects.length - 1 && <Separator />}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No active projects</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                Upcoming Tasks
              </CardTitle>
              <CardDescription>Tasks that need your attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground">{task.projects.name}</p>
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={task.status === "in_progress" ? "default" : "secondary"}>
                        {task.status.replace("_", " ")}
                      </Badge>
                      {task.status === "in_progress" ? (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No upcoming tasks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col" onClick={() => router.push("/projects")}>
                <FolderOpen className="h-6 w-6 mb-2" />
                Projects
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={() => router.push("/tasks")}>
                <CheckCircle className="h-6 w-6 mb-2" />
                My Tasks
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={() => router.push("/attendance")}>
                <Clock className="h-6 w-6 mb-2" />
                Attendance
              </Button>
              <Button variant="outline" className="h-20 flex-col" onClick={() => router.push("/leave")}>
                <Calendar className="h-6 w-6 mb-2" />
                Leave Request
              </Button>
              {isAdmin && (
                <>
                  <Button variant="outline" className="h-20 flex-col" onClick={() => router.push("/admin")}>
                    <Users className="h-6 w-6 mb-2" />
                    Admin Panel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
