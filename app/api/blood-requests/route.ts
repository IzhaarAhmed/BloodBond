import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { blood_group, district, urgency_level, hospital_name, message } = await request.json()

    if (!blood_group || !district || !urgency_level || !hospital_name) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data: request_data, error } = await supabase
      .from("blood_requests")
      .insert({
        recipient_id: decoded.id,
        blood_group,
        district,
        urgency_level,
        hospital_name,
        message,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
    }

    return NextResponse.json(request_data)
  } catch (error) {
    console.error("Create blood request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
