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
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const supabase = createServerClient()

    const { data: donations, error } = await supabase
      .from("donations")
      .select(`
        *,
        donor:users!donations_donor_id_fkey(name, email)
      `)
      .order("donation_date", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
    }

    // Format the response
    const formattedDonations = (donations || []).map((donation) => ({
      id: donation.id,
      donor_name: donation.donor?.name || "Unknown",
      donor_email: donation.donor?.email || "Unknown",
      status: donation.status,
      points_awarded: donation.points_awarded,
      donation_date: donation.donation_date,
    }))

    return NextResponse.json(formattedDonations)
  } catch (error) {
    console.error("Fetch donations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
