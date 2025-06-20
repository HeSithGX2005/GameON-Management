import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect dashboard and other authenticated routes
  if (
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/projects") ||
    req.nextUrl.pathname.startsWith("/tasks") ||
    req.nextUrl.pathname.startsWith("/attendance") ||
    req.nextUrl.pathname.startsWith("/leave")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (session && ["/login", "/signup"].includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return res
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/projects/:path*",
    "/tasks/:path*",
    "/attendance/:path*",
    "/leave/:path*",
    "/login",
    "/signup",
  ],
}
