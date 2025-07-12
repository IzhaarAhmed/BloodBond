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

    const { data: requests, error } = await supabase
      .from("blood_requests")
      .select("*")
      .eq("recipient_id", decoded.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
    }

    return NextResponse.json(requests || [])
  } catch (error) {
    console.error("Fetch my requests error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
