import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { StatCard } from "@/components/StatCard";
import { TransactionTable } from "@/components/TransactionTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { List, DollarSign, AlertTriangle, Plus, LogOut } from "lucide-react";
import { Transaction } from "@shared/schema";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Fetch all transactions
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions/all"],
  });

  // Calculate statistics
  const totalTransactions = transactions.length;
  const approvedAmount = transactions
    .filter(t => t.status === 'approved')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const flaggedCount = transactions.filter(t => t.status === 'flagged').length;

  // Mutation for updating transaction status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/transactions/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/all"] });
      toast({
        title: "Success",
        description: "Transaction status updated",
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

  // Mutation for deleting transaction
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/all"] });
      toast({
        title: "Success",
        description: "Transaction deleted",
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

  // Mutation for adding random transaction
  const addRandomMutation = useMutation({
    mutationFn: async () => {
      const randomAmount = (Math.random() * 10000 + 100).toFixed(2);
      const locations = ["New York, USA", "London, UK", "Tokyo, Japan", "Paris, France", "Sydney, Australia", "Mumbai, India"];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      const descriptions = ["Online purchase", "ATM withdrawal", "Wire transfer", "Payment to vendor", "Subscription renewal"];
      const randomDescription = descriptions[Math.floor(Math.random() * descriptions.length)];
      
      return await apiRequest("POST", "/api/transactions", {
        amount: randomAmount,
        location: randomLocation,
        description: randomDescription,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/all"] });
      toast({
        title: "Success",
        description: "Random transaction added",
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-2 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Fraud Detection System</h1>
              <p className="text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

        {/* Admin Panel */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Transaction Review Panel</h2>
            <Button 
              onClick={() => addRandomMutation.mutate()}
              disabled={addRandomMutation.isPending}
              data-testid="button-add-random"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Random Transaction
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : (
            <TransactionTable
              transactions={transactions}
              isAdmin={true}
              onApprove={(id) => updateStatusMutation.mutate({ id, status: 'approved' })}
              onFlag={(id) => updateStatusMutation.mutate({ id, status: 'flagged' })}
              onDelete={(id) => deleteMutation.mutate(id)}
              isLoading={updateStatusMutation.isPending || deleteMutation.isPending}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 sm:px-6 lg:px-8 mt-12">
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
