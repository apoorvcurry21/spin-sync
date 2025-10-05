import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Users, MapPin, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

interface NavbarProps {
  isAuthenticated: boolean;
}

const Navbar = ({ isAuthenticated }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      navigate("/");
    }
  };

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) {
    return (
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="SpinSync" className="h-10 w-10" />
            <span className="text-2xl font-bold text-gradient">SpinSync</span>
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/auth?mode=login">Log In</Link>
            </Button>
            <Button asChild className="gradient-primary">
              <Link to="/auth?mode=signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src={logo} alt="SpinSync" className="h-10 w-10" />
          <span className="text-2xl font-bold text-gradient">SpinSync</span>
        </Link>
        
        <div className="flex items-center gap-1">
          <Button
            variant={isActive("/dashboard") ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/dashboard">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
          
          <Button
            variant={isActive("/find-players") ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/find-players">
              <Users className="h-4 w-4 mr-2" />
              Find Players
            </Link>
          </Button>
          
          <Button
            variant={isActive("/find-tables") ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/find-tables">
              <MapPin className="h-4 w-4 mr-2" />
              Find Tables
            </Link>
          </Button>
          
          <Button
            variant={isActive("/profile") ? "secondary" : "ghost"}
            size="sm"
            asChild
          >
            <Link to="/profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Link>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
