"use client"

import { useState, useEffect } from "react"
import type { User } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Phone, Mail, MapPin, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface RecipientDashboardProps {
  user: User
}

interface BloodRequest {
  id: string
  blood_group: string
  district: string
  urgency_level: string
  hospital_name: string
  message: string
  status: string
  created_at: string
}

interface Donor {
  id: string
  name: string
  blood_group: string
  district: string
  phone: string
  email: string
  is_available: boolean
  total_donations: number
}

const districts = ["Central", "North", "South", "East", "West"]
const urgencyLevels = ["low", "medium", "high", "critical"]

export default function RecipientDashboard({ user }: RecipientDashboardProps) {
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [availableDonors, setAvailableDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewRequestDialog, setShowNewRequestDialog] = useState(false)
  const { toast } = useToast()

  const [newRequest, setNewRequest] = useState({
    blood_group: user.blood_group,
    district: user.district,
    urgency_level: "medium",
    hospital_name: "",
    message: "",
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token")

      // Fetch my requests
      const requestsResponse = await fetch("/api/blood-requests/my-requests", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (requestsResponse.ok) {
        const requestsData = await requestsResponse.json()
        setRequests(requestsData)
      }

      // Fetch available donors
      const donorsResponse = await fetch(
        `/api/donors/available?blood_group=${user.blood_group}&district=${user.district}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      if (donorsResponse.ok) {
        const donorsData = await donorsResponse.json()
        setAvailableDonors(donorsData)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const createRequest = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/blood-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRequest),
      })

      if (response.ok) {
        toast({
          title: "Request Created",
          description: "Your blood request has been posted successfully",
        })
        setShowNewRequestDialog(false)
        setNewRequest({
          blood_group: user.blood_group,
          district: user.district,
          urgency_level: "medium",
          hospital_name: "",
          message: "",
        })
        fetchDashboardData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create request",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "fulfilled":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipient Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>

        <Dialog open={showNewRequestDialog} onOpenChange={setShowNewRequestDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Blood Request</DialogTitle>
              <DialogDescription>Post a new blood requirement to find matching donors</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select
                    value={newRequest.blood_group}
                    onValueChange={(value) => setNewRequest((prev) => ({ ...prev, blood_group: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>District</Label>
                  <Select
                    value={newRequest.district}
                    onValueChange={(value) => setNewRequest((prev) => ({ ...prev, district: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Urgency Level</Label>
                <Select
                  value={newRequest.urgency_level}
                  onValueChange={(value) => setNewRequest((prev) => ({ ...prev, urgency_level: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Hospital Name</Label>
                <Input
                  value={newRequest.hospital_name}
                  onChange={(e) => setNewRequest((prev) => ({ ...prev, hospital_name: e.target.value }))}
                  placeholder="Enter hospital name"
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={newRequest.message}
                  onChange={(e) => setNewRequest((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="Additional details about your requirement"
                  rows={3}
                />
              </div>

              <Button onClick={createRequest} className="w-full bg-red-600 hover:bg-red-700 text-white">
                Create Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Available Donors */}
        <Card>
          <CardHeader>
            <CardTitle>Available Donors</CardTitle>
            <CardDescription>Donors matching your blood group and district</CardDescription>
          </CardHeader>
          <CardContent>
            {availableDonors.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No available donors found</p>
            ) : (
              <div className="space-y-4">
                {availableDonors.map((donor) => (
                  <div key={donor.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{donor.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{donor.district}</span>
                        </div>
                      </div>
                      <Badge variant="outline">{donor.blood_group}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{donor.total_donations} donations</span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{donor.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{donor.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Requests */}
        <Card>
          <CardHeader>
            <CardTitle>My Blood Requests</CardTitle>
            <CardDescription>Your posted blood requirements</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No requests posted yet</p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{request.hospital_name}</h4>
                        <p className="text-sm text-gray-600">{request.district}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge className={getUrgencyColor(request.urgency_level)}>{request.urgency_level}</Badge>
                        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      </div>
                    </div>
                    <p className="text-sm mb-3">{request.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Blood Group: <strong>{request.blood_group}</strong>
                      </span>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
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
