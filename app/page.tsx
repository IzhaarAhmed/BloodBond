"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Trophy, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Save Lives, Earn Rewards</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            BloodBond connects blood donors with recipients and rewards your altruism. Join our community and make a
            difference today.
          </p>
          {!user ? (
            <div className="space-x-4">
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-red-600 border-white hover:bg-white hover:text-red-600 bg-white"
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button size="lg" className="text-white bg-red-800 hover:bg-red-900 border-white">
                  View Leaderboard
                </Button>
              </Link>
            </div>
          ) : (
            <Link href="/dashboard">
              <Button size="lg" className="text-red-600 bg-white hover:bg-gray-100 border-white">
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How BloodBond Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform makes blood donation simple, rewarding, and impactful
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>Donate Blood</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Register as a donor and help save lives in your community</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>Find Donors</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Recipients can quickly find matching donors in their area</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Trophy className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>Earn Points</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Get rewarded with points for every verified donation</CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <CardTitle>Stay Safe</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>All donations are verified and tracked for safety</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">500+</div>
              <div className="text-gray-600">Active Donors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">1,200+</div>
              <div className="text-gray-600">Lives Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-600 mb-2">50+</div>
              <div className="text-gray-600">Partner Hospitals</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of donors and recipients who are already part of the BloodBond community
          </p>
          {!user && (
            <Link href="/register">
              <Button size="lg" className="text-red-600 bg-white hover:bg-gray-100 border-white">
                Join BloodBond Today
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
