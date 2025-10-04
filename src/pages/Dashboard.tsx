import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Bell, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

interface ConnectionRequest {
  id: string;
  sender: {
    name: string;
    skill_level: string;
    city: string;
  };
  message: string | null;
  created_at: string;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [stats, setStats] = useState({ connections: 0, requests: 0 });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadRequests();
      loadStats();
    }
  }, [user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();
    setProfile(data);
  };

  const loadRequests = async () => {
    const { data } = await supabase
      .from("connection_requests")
      .select(`
        id,
        message,
        created_at,
        sender:sender_id (
          name,
          skill_level,
          city
        )
      `)
      .eq("receiver_id", user?.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(3);

    if (data) {
      setRequests(data as any);
    }
  };

  const loadStats = async () => {
    const { data: connectionsData } = await supabase
      .from("connections")
      .select("id", { count: "exact" })
      .eq("user_id", user?.id);

    const { data: requestsData } = await supabase
      .from("connection_requests")
      .select("id", { count: "exact" })
      .eq("receiver_id", user?.id)
      .eq("status", "pending");

    setStats({
      connections: connectionsData?.length || 0,
      requests: requestsData?.length || 0,
    });
  };

  const handleAcceptRequest = async (requestId: string) => {
    await supabase
      .from("connection_requests")
      .update({ status: "accepted" })
      .eq("id", requestId);
    
    loadRequests();
    loadStats();
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isAuthenticated={true} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gradient mb-2">
            Welcome back, {profile.name}!
          </h1>
          <p className="text-muted-foreground">
            Ready to play some ping pong?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.connections}</p>
              <p className="text-sm text-muted-foreground">Active players</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.requests}</p>
              <p className="text-sm text-muted-foreground">Pending requests</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{profile.rating}</p>
              <p className="text-sm text-muted-foreground">Current rating</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Connection Requests</CardTitle>
              <CardDescription>
                {requests.length > 0
                  ? "Players who want to connect with you"
                  : "No pending requests"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{request.sender.name}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary">
                        {request.sender.skill_level}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {request.sender.city}
                      </span>
                    </div>
                    {request.message && (
                      <p className="text-sm text-muted-foreground mt-2">
                        "{request.message}"
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="gradient-primary"
                    onClick={() => handleAcceptRequest(request.id)}
                  >
                    Accept
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Get started with SpinSync</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/find-players")}
              >
                <Users className="mr-2 h-4 w-4" />
                Find Players Nearby
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate("/find-tables")}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Discover Tables
              </Button>
              <Button
                className="w-full justify-start gradient-primary"
                onClick={() => navigate("/profile")}
              >
                Complete Your Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
