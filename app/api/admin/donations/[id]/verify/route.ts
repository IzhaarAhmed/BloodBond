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

    // Update donation status
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .update({
        status: "verified",
        points_awarded: 50,
        verified_at: new Date().toISOString(),
      })
      .eq("id", donationId)
      .select("donor_id")
      .single()

    if (donationError || !donation) {
      return NextResponse.json({ error: "Failed to verify donation" }, { status: 500 })
    }

    // Update donor's total donations and points
    const { error: userError } = await supabase.rpc("update_donor_stats", {
      donor_id: donation.donor_id,
      points_to_add: 50,
      donations_to_add: 1,
    })

    if (userError) {
      // If RPC doesn't exist, use regular update
      await supabase
        .from("users")
        .update({
          total_donations: supabase.raw("total_donations + 1"),
          points: supabase.raw("points + 50"),
          updated_at: new Date().toISOString(),
        })
        .eq("id", donation.donor_id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Verify donation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
