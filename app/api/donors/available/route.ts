import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const blood_group = searchParams.get("blood_group")
    const district = searchParams.get("district")

    const supabase = createServerClient()

    let query = supabase
      .from("users")
      .select("id, name, blood_group, district, phone, email, is_available, total_donations")
      .eq("role", "donor")
      .eq("is_available", true)

    if (blood_group) {
      query = query.eq("blood_group", blood_group)
    }

    if (district) {
      query = query.eq("district", district)
    }

    const { data: donors, error } = await query.order("total_donations", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch donors" }, { status: 500 })
    }

    return NextResponse.json(donors || [])
  } catch (error) {
    console.error("Fetch available donors error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
