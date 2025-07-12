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

    const donationId = params.id
    const supabase = createServerClient()

    const { error } = await supabase
      .from("donations")
      .update({
        status: "rejected",
        points_awarded: 0,
      })
      .eq("id", donationId)

    if (error) {
      return NextResponse.json({ error: "Failed to reject donation" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reject donation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
