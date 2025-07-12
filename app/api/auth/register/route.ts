import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { hashPassword, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, age, blood_group, phone, district, role } = await request.json()

    // Validate input
    if (!email || !password || !name || !age || !blood_group || !phone || !district || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (age < 18 || age > 65) {
      return NextResponse.json({ error: "Age must be between 18 and 65" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password
    const password_hash = await hashPassword(password)

    // Create user
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email,
        password_hash,
        name,
        age,
        blood_group,
        phone,
        district,
        role,
        is_available: role === "donor" ? false : null,
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Generate token
    const token = generateToken(user)

    // Remove password hash from response
    const { password_hash: _, ...userWithoutPassword } = user

    return NextResponse.json({ token, user: userWithoutPassword })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
