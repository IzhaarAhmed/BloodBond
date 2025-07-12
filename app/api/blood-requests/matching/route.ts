import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get user's blood group and district
    const { data: user } = await supabase.from("users").select("blood_group, district").eq("id", decoded.id).single()

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find matching blood requests
    const { data: requests, error } = await supabase
      .from("blood_requests")
      .select(`
        *,
        recipient:users!blood_requests_recipient_id_fkey(name, phone)
      `)
      .eq("blood_group", user.blood_group)
      .eq("district", user.district)
      .eq("status", "active")
      .order("urgency_level", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch matching requests" }, { status: 500 })
    }

    return NextResponse.json(requests || [])
  } catch (error) {
    console.error("Fetch matching requests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
