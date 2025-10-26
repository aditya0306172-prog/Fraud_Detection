import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Background Image */}
      <div 
        className="relative flex-1 flex items-center justify-center py-20 px-4"
        style={{
          backgroundImage: "linear-gradient(rgba(17, 24, 39, 0.85), rgba(17, 24, 39, 0.9)), url('https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Hero Content */}
          <div className="text-center md:text-left space-y-6">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <Shield className="w-12 h-12 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Fraud Detection System
              </h1>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Secure & Seamless
            </h2>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Our advanced system monitors transactions in real-time, using intelligent rules to flag suspicious activity instantly. 
              Keep your finances safe with role-based access and a clear, intuitive interface.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto" data-testid="button-get-started">
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="w-full sm:w-auto backdrop-blur-sm" data-testid="button-learn-more">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Feature Highlights */}
          <div className="space-y-4">
            <Card className="p-6 backdrop-blur-sm bg-card/80 border-card-border hover-elevate">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Real-Time Monitoring</h3>
                  <p className="text-muted-foreground">
                    Every transaction is analyzed instantly using advanced fraud detection rules
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 backdrop-blur-sm bg-card/80 border-card-border hover-elevate">
              <div className="flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Intelligent Flagging</h3>
                  <p className="text-muted-foreground">
                    Suspicious transactions are automatically flagged for admin review
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 backdrop-blur-sm bg-card/80 border-card-border hover-elevate">
              <div className="flex items-start gap-4">
                <TrendingUp className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Role-Based Access</h3>
                  <p className="text-muted-foreground">
                    Separate dashboards for users and administrators with tailored permissions
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-background py-20 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our System</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover-elevate">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Advanced Security</h3>
              <p className="text-muted-foreground">
                Multi-layered security with encrypted data and secure authentication
              </p>
            </Card>
            <Card className="p-6 text-center hover-elevate">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Real-Time Analytics</h3>
              <p className="text-muted-foreground">
                Track your transaction statistics and fraud detection metrics instantly
              </p>
            </Card>
            <Card className="p-6 text-center hover-elevate">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-3">Easy to Use</h3>
              <p className="text-muted-foreground">
                Intuitive interface designed for both users and administrators
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground">&copy; 2025 Fraud Detection System. All Rights Reserved.</p>
          <div className="flex gap-6 text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Contact Us</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
