"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Heart, Trophy, CheckCircle, XCircle, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  blood_group: string
  district: string
  role: string
  total_donations: number
  points: number
  is_available: boolean
}

interface Donation {
  id: string
  donor_name: string
  donor_email: string
  status: string
  points_awarded: number
  donation_date: string
}

export default function AdminPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [users, setUsers] = useState<User[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [pointsToAdd, setPointsToAdd] = useState("")
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/dashboard")
    } else if (user?.role === "admin") {
      fetchAdminData()
    }
  }, [user, loading, router])

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch all users
      const usersResponse = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }

      // Fetch all donations
      const donationsResponse = await fetch("/api/admin/donations", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (donationsResponse.ok) {
        const donationsData = await donationsResponse.json()
        setDonations(donationsData)
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const verifyDonation = async (donationId: string, action: "verify" | "reject") => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/donations/${donationId}/${action}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Donation ${action === "verify" ? "verified" : "rejected"} successfully`,
        })
        fetchAdminData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} donation`,
        variant: "destructive",
      })
    }
  }

  const adjustUserPoints = async (userId: string, points: number) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/users/${userId}/points`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ points }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "User points updated successfully",
        })
        fetchAdminData()
        setSelectedUser(null)
        setPointsToAdd("")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user points",
        variant: "destructive",
      })
    }
  }

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  const stats = {
    totalUsers: users.length,
    totalDonors: users.filter((u) => u.role === "donor").length,
    totalRecipients: users.filter((u) => u.role === "recipient").length,
    pendingDonations: donations.filter((d) => d.status === "pending").length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Manage users, donations, and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
              <Heart className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDonors}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recipients</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRecipients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Donations</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingDonations}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user accounts and points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{user.role}</Badge>
                            <Badge variant="outline">{user.blood_group}</Badge>
                            <span className="text-sm text-gray-500">{user.district}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">{user.points} pts</div>
                          <div className="text-sm text-gray-600">{user.total_donations} donations</div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="mt-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-transparent"
                                onClick={() => setSelectedUser(user)}
                              >
                                Adjust Points
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Adjust Points for {selectedUser?.name}</DialogTitle>
                                <DialogDescription>Add or subtract points from this user's account</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Points to Add/Subtract</Label>
                                  <Input
                                    type="number"
                                    value={pointsToAdd}
                                    onChange={(e) => setPointsToAdd(e.target.value)}
                                    placeholder="Enter points (use negative for subtraction)"
                                  />
                                </div>
                                <div className="flex space-x-2">
                                  <Button
                                    onClick={() => adjustUserPoints(selectedUser!.id, Number.parseInt(pointsToAdd))}
                                    disabled={!pointsToAdd}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Apply Changes
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donations">
            <Card>
              <CardHeader>
                <CardTitle>Donation Management</CardTitle>
                <CardDescription>Verify or reject donation claims</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold">{donation.donor_name}</h4>
                          <p className="text-sm text-gray-600">{donation.donor_email}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(donation.donation_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              donation.status === "verified"
                                ? "default"
                                : donation.status === "rejected"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {donation.status}
                          </Badge>
                          {donation.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => verifyDonation(donation.id, "verify")}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => verifyDonation(donation.id, "reject")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
