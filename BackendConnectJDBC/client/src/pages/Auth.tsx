import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Shield } from "lucide-react";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; role?: string }) => {
      return await apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; username: string; country: string }) => {
      return await apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: () => {
      toast({
        title: "Account created!",
        description: "You can now log in with your credentials.",
      });
      setIsLogin(true);
      setPassword("");
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ email, password, role });
    } else {
      registerMutation.mutate({ email, password, username, country });
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{
        backgroundImage: "linear-gradient(rgba(17, 24, 39, 0.85), rgba(17, 24, 39, 0.9)), url('https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070&auto=format&fit=crop')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Auth Form */}
        <Card className="p-8 backdrop-blur-xl bg-card/80 border-card-border" data-testid="card-auth">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Fraud Detection System</h1>
          </div>

          {/* Tab Buttons */}
          <div className="flex justify-center mb-6 border-b border-border">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-6 py-2 text-lg font-semibold transition-colors ${
                isLogin 
                  ? "border-b-2 border-primary text-foreground" 
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-login"
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-6 py-2 text-lg font-semibold transition-colors ${
                !isLogin 
                  ? "border-b-2 border-primary text-foreground" 
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-testid="tab-register"
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  data-testid="input-username"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                data-testid="input-password"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g., USA"
                  required
                  data-testid="input-country"
                />
              </div>
            )}

            {isLogin && (
              <div className="space-y-2">
                <Label htmlFor="role">Login As</Label>
                <Select value={role} onValueChange={(value: "user" | "admin") => setRole(value)}>
                  <SelectTrigger data-testid="select-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending || registerMutation.isPending}
              data-testid="button-submit-auth"
            >
              {(loginMutation.isPending || registerMutation.isPending)
                ? (isLogin ? "Logging in..." : "Creating account...")
                : (isLogin ? "Login" : "Create Account")}
            </Button>
          </form>
        </Card>

        {/* Right: Marketing Content */}
        <div className="text-center md:text-left space-y-6 text-white">
          <h2 className="text-4xl font-bold">Secure & Seamless</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            Our advanced system monitors transactions in real-time, using intelligent rules to flag suspicious activity instantly. 
            Keep your finances safe with role-based access and a clear, intuitive interface.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 p-2 rounded-full">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Advanced Security</h3>
                <p className="text-gray-400">Encrypted data and secure authentication</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
