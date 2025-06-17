import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client for admin operations
export const createServerClient = () => {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Types for our database
export interface Profile {
  id: string
  email: string
  full_name: string
  role: "admin" | "employee"
  department: string | null
  hire_date: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled"
  progress_percentage: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  project_id: string
  milestone_id: string | null
  title: string
  description: string | null
  status: "todo" | "in_progress" | "review" | "done" | "on_hold"
  due_date: string | null
  estimated_hours: number | null
  actual_hours: number
  priority: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AttendanceRecord {
  id: string
  user_id: string
  clock_in: string
  clock_out: string | null
  total_hours: number | null
  date: string
  notes: string | null
  created_at: string
}

export interface LeaveRequest {
  id: string
  user_id: string
  leave_type: "sick" | "vacation" | "personal" | "emergency"
  start_date: string
  end_date: string
  days_requested: number
  reason: string | null
  status: "pending" | "approved" | "rejected"
  approved_by: string | null
  approved_at: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
}
