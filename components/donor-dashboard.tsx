"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Heart, Trophy, Calendar, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DonorDashboardProps {
  user: User
}

interface Donation {
  id: string
  status: string
  points_awarded: number
  donation_date: string
  verified_at: string | null
}

interface BloodRequest {
  id: string
  blood_group: string
  district: string
  urgency_level: string
  hospital_name: string
  message: string
  recipient: {
    name: string
    phone: string
  }
  created_at: string
}

export default function DonorDashboard({ user }: DonorDashboardProps) {
  const [isAvailable, setIsAvailable] = useState(user.is_available || false)
  const [donations, setDonations] = useState<Donation[]>([])
  const [matchingRequests, setMatchingRequests] = useState<BloodRequest[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch donations
      const donationsResponse = await fetch("/api/donations/my-donations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (donationsResponse.ok) {
        const donationsData = await donationsResponse.json()
        setDonations(donationsData)
      }

      // Fetch matching requests
      const requestsResponse = await fetch("/api/blood-requests/matching", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setMatchingRequests(requestsData)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateAvailability = async (available: boolean) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/donors/availability", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_available: available }),
      })

      if (response.ok) {
        setIsAvailable(available)
        toast({
          title: "Availability Updated",
          description: `You are now ${available ? "available" : "unavailable"} for donations`,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      })
    }
  }

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Donor Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.total_donations || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.points || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Group</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{user.blood_group}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch checked={isAvailable} onCheckedChange={updateAvailability} />
              <Label>{isAvailable ? "Available" : "Unavailable"}</Label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Matching Blood Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Matching Blood Requests</CardTitle>
            <CardDescription>Requests matching your blood group and district</CardDescription>
          </CardHeader>
          <CardContent>
            {matchingRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No matching requests found</p>
            ) : (
              <div className="space-y-4">
                {matchingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{request.hospital_name}</h4>
                        <p className="text-sm text-gray-600">{request.district}</p>
                      </div>
                      <Badge className={getUrgencyColor(request.urgency_level)}>{request.urgency_level}</Badge>
                    </div>
                    <p className="text-sm mb-3">{request.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Blood Group: <strong>{request.blood_group}</strong>
                      </span>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{request.recipient.phone}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Donation History */}
        <Card>
          <CardHeader>
            <CardTitle>Donation History</CardTitle>
            <CardDescription>Your recent donations and status</CardDescription>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No donations recorded yet</p>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div key={donation.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{new Date(donation.donation_date).toLocaleDateString()}</span>
                      </div>
                      <Badge variant={donation.status === "verified" ? "default" : "secondary"}>
                        {donation.status}
                      </Badge>
                    </div>
                    {donation.status === "verified" && (
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">+{donation.points_awarded} points</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
