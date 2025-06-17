import { supabase } from "./supabase"
import { z } from "zod"

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  department: z.string().optional(),
  phone: z.string().optional(),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export type LoginData = z.infer<typeof loginSchema>
export type SignupData = z.infer<typeof signupSchema>
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>

// Auth functions
export async function signIn(data: LoginData) {
  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) throw error
}

export async function signUp(data: SignupData) {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (error) throw error

  // Create profile
  if (authData.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email: data.email,
      full_name: data.fullName,
      department: data.department,
      phone: data.phone,
      hire_date: new Date().toISOString().split("T")[0],
    })

    if (profileError) throw profileError
  }

  return authData
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) throw error
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return { ...user, profile }
}

export async function updateProfile(
  userId: string,
  updates: Partial<{
    full_name: string
    department: string
    phone: string
  }>,
) {
  const { error } = await supabase.from("profiles").update(updates).eq("id", userId)

  if (error) throw error
}
