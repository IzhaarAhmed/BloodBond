import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { verifyToken } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { points } = await request.json()
    const userId = params.id

    const supabase = createServerClient()

    // Get current user points
    const { data: user } = await supabase.from("users").select("points").eq("id", userId).single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update points
    const newPoints = Math.max(0, (user.points || 0) + points)

    const { error } = await supabase
      .from("users")
      .update({ points: newPoints, updated_at: new Date().toISOString() })
      .eq("id", userId)

    if (error) {
      return NextResponse.json({ error: "Failed to update points" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update user points error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
