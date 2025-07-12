import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const { data: donors, error } = await supabase
      .from("users")
      .select("id, name, district, blood_group, total_donations, points")
      .eq("role", "donor")
      .gt("total_donations", 0)
      .order("points", { ascending: false })
      .order("total_donations", { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 })
    }

    // Add rank to each donor
    const leaderboard = (donors || []).map((donor, index) => ({
      ...donor,
      rank: index + 1,
    }))

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error("Fetch leaderboard error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
