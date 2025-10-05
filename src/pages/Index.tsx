import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, MapPin, TrendingUp, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={false} />
      
      {/* Hero Section */}
      <section 
        className="relative h-[600px] flex items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4 z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            Connect. Play. Win.
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join the ultimate table tennis community. Find players, discover tables, and level up your game.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="gradient-primary text-lg px-8 py-6">
              <Link to="/auth?mode=signup">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20">
              <Link to="/auth?mode=signup">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">
            Why Choose <span className="text-gradient">SpinSync</span>?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Everything you need to find players and tables in one place
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-hover border-2">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Find Players</h3>
                <p className="text-muted-foreground">
                  Connect with ping pong enthusiasts in your city
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-2">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full gradient-secondary flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Discover Tables</h3>
                <p className="text-muted-foreground">
                  Find nearby tables and plan your next game
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-2">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Track Progress</h3>
                <p className="text-muted-foreground">
                  Monitor your rating and skill improvement
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-2">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 rounded-full gradient-secondary flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Quick Matches</h3>
                <p className="text-muted-foreground">
                  Send connection requests and organize games fast
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Playing?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of players who are already using SpinSync to improve their game
          </p>
          <Button asChild size="lg" className="gradient-primary text-lg px-8 py-6">
            <Link to="/auth?mode=signup">Sign Up Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 SpinSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
