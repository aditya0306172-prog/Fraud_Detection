import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { StatCard } from "@/components/StatCard";
import { TransactionTable } from "@/components/TransactionTable";
import { TransactionDialog } from "@/components/TransactionDialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { List, DollarSign, AlertTriangle, Plus, User, LogOut, Shield } from "lucide-react";
import { Transaction, InsertTransaction, User as UserType } from "@shared/schema";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import { useLocation } from "wouter";

export default function UserDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>('dashboard');

  // Fetch current user
  const { data: user } = useQuery<UserType>({
    queryKey: ["/api/auth/me"],
  });

  // Fetch user's transactions
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Calculate statistics
  const totalTransactions = transactions.length;
  const approvedAmount = transactions
    .filter(t => t.status === 'approved')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const flaggedCount = transactions.filter(t => t.status === 'flagged').length;

  // Mutation for creating transaction
  const createMutation = useMutation({
    mutationFn: async (data: InsertTransaction) => {
      return await apiRequest("POST", "/api/transactions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      setTransactionDialogOpen(false);
      toast({
        title: "Success",
        description: "Transaction request submitted",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for updating profile
  const [profileData, setProfileData] = useState({
    username: "",
    fullName: "",
    country: "",
    phoneNumber: "",
  });

  // Sync profile data with fetched user data
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        fullName: user.fullName || "",
        country: user.country || "",
        phoneNumber: user.phoneNumber || "",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/auth/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      setLocation("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Fraud Detection</h2>
                <p className="text-xs text-muted-foreground">User Portal</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setCurrentView('dashboard')}
                      isActive={currentView === 'dashboard'}
                      data-testid="nav-dashboard"
                    >
                      <List className="w-4 h-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setCurrentView('profile')}
                      isActive={currentView === 'profile'}
                      data-testid="nav-profile"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border p-4">
            <div className="space-y-2">
              <div className="text-sm">
                <p className="font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {currentView === 'dashboard' ? (
              <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">Welcome, {user?.username}</h1>
                    <p className="text-muted-foreground mt-1">Manage your transactions and view fraud detection status</p>
                  </div>
                  <Button
                    onClick={() => setTransactionDialogOpen(true)}
                    data-testid="button-new-transaction"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Transaction
                  </Button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StatCard
                    title="Total Transactions"
                    value={totalTransactions}
                    icon={List}
                  />
                  <StatCard
                    title="Approved Amount"
                    value={`$${approvedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    icon={DollarSign}
                    valueClassName="text-green-500"
                  />
                  <StatCard
                    title="Flagged Transactions"
                    value={flaggedCount}
                    icon={AlertTriangle}
                    valueClassName="text-red-500"
                  />
                </div>

                {/* Transactions */}
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Your Transactions</h2>
                  {isLoading ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Loading transactions...</p>
                    </div>
                  ) : (
                    <TransactionTable transactions={transactions} />
                  )}
                </div>

                <TransactionDialog
                  open={transactionDialogOpen}
                  onOpenChange={setTransactionDialogOpen}
                  onSubmit={(data) => createMutation.mutate(data)}
                  isLoading={createMutation.isPending}
                />
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Manage Your Profile</h1>
                <div className="bg-card border border-card-border rounded-lg p-8">
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Username</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-background border border-input rounded-md"
                          value={profileData.username}
                          onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                          data-testid="input-profile-username"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-background border border-input rounded-md"
                          value={profileData.fullName}
                          onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                          data-testid="input-profile-fullname"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email (Cannot be changed)</label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 bg-muted border border-input rounded-md"
                          value={user?.email || ""}
                          disabled
                          data-testid="input-profile-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number</label>
                        <input
                          type="tel"
                          className="w-full px-3 py-2 bg-background border border-input rounded-md"
                          value={profileData.phoneNumber}
                          onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                          data-testid="input-profile-phone"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Country</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-background border border-input rounded-md"
                          value={profileData.country}
                          onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                          data-testid="input-profile-country"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        data-testid="button-update-profile"
                      >
                        {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setCurrentView('dashboard')}
                        data-testid="button-back-to-dashboard"
                      >
                        Back to Dashboard
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>

          {/* Footer */}
          <footer className="border-t border-border py-4 px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <p className="text-muted-foreground">&copy; 2025 Fraud Detection System. All Rights Reserved.</p>
              <div className="flex gap-6 text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Contact Us</a>
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
