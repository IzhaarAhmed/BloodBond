import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { verifyToken } from "@/lib/auth"

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { is_available } = await request.json()

    const supabase = createServerClient()

    const { error } = await supabase
      .from("users")
      .update({ is_available, updated_at: new Date().toISOString() })
      .eq("id", decoded.id)
      .eq("role", "donor")

    if (error) {
      return NextResponse.json({ error: "Failed to update availability" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update availability error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
