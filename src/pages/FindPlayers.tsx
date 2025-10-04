import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

interface Player {
  id: string;
  name: string;
  city: string;
  skill_level: string;
  rating: number;
  availability: string | null;
}

const FindPlayers = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [skillFilter, setSkillFilter] = useState("all");
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadPlayers();
    }
  }, [user]);

  useEffect(() => {
    filterPlayers();
  }, [searchQuery, skillFilter, players]);

  const loadPlayers = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", user?.id)
      .order("rating", { ascending: false });

    if (data) {
      setPlayers(data);
    }
  };

  const filterPlayers = () => {
    let filtered = players;

    if (searchQuery) {
      filtered = filtered.filter(
        (player) =>
          player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          player.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (skillFilter !== "all") {
      filtered = filtered.filter((player) => player.skill_level === skillFilter);
    }

    setFilteredPlayers(filtered);
  };

  const sendConnectionRequest = async (receiverId: string) => {
    if (!user) return;

    setSendingRequest(receiverId);
    try {
      const { error } = await supabase.from("connection_requests").insert({
        sender_id: user.id,
        receiver_id: receiverId,
        message: "Hey! Let's play some ping pong together!",
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already sent",
            description: "You've already sent a request to this player",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Request sent!",
          description: "Your connection request has been sent",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingRequest(null);
    }
  };

  if (loading) {
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
          <h1 className="text-4xl font-bold text-gradient mb-2">Find Players</h1>
          <p className="text-muted-foreground">
            Connect with ping pong enthusiasts in your area
          </p>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by skill" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <Card key={player.id} className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{player.name}</span>
                  <Badge
                    variant={
                      player.skill_level === "pro"
                        ? "default"
                        : player.skill_level === "advanced"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {player.skill_level}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {player.city}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rating:</span>
                  <span className="font-semibold">{player.rating}</span>
                </div>

                {player.availability && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Availability: </span>
                    <span>{player.availability}</span>
                  </div>
                )}

                <Button
                  className="w-full gradient-primary"
                  onClick={() => sendConnectionRequest(player.id)}
                  disabled={sendingRequest === player.id}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendingRequest === player.id ? "Sending..." : "Connect"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPlayers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No players found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindPlayers;
