import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, Trash2 } from "lucide-react";
import { Transaction } from "@shared/schema";
import { format } from "date-fns";

interface TransactionTableProps {
  transactions: Transaction[];
  isAdmin?: boolean;
  onApprove?: (id: string) => void;
  onFlag?: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

export function TransactionTable({ 
  transactions, 
  isAdmin = false, 
  onApprove, 
  onFlag, 
  onDelete,
  isLoading = false 
}: TransactionTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20" data-testid={`status-approved`}>Approved</Badge>;
      case 'flagged':
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20" data-testid={`status-flagged`}>Flagged</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" data-testid={`status-pending`}>Pending</Badge>;
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No transactions found</p>
        <p className="text-sm mt-2">Transactions will appear here once created</p>
      </div>
    );
  }

  return (
    <div className="border border-card-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead className="font-semibold">Transaction ID</TableHead>
            <TableHead className="font-semibold">Amount</TableHead>
            <TableHead className="font-semibold">Location</TableHead>
            <TableHead className="font-semibold">Description</TableHead>
            <TableHead className="font-semibold">Timestamp</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            {isAdmin && <TableHead className="font-semibold">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} data-testid={`transaction-row-${transaction.id}`}>
              <TableCell className="font-mono text-xs" data-testid={`transaction-id-${transaction.id}`}>
                {transaction.id.slice(0, 8)}...
              </TableCell>
              <TableCell className="font-semibold" data-testid={`transaction-amount-${transaction.id}`}>
                ${parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell data-testid={`transaction-location-${transaction.id}`}>{transaction.location}</TableCell>
              <TableCell className="max-w-xs truncate" data-testid={`transaction-description-${transaction.id}`}>
                {transaction.description || '-'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground" data-testid={`transaction-timestamp-${transaction.id}`}>
                {format(new Date(transaction.timestamp!), 'MMM dd, yyyy HH:mm')}
              </TableCell>
              <TableCell>{getStatusBadge(transaction.status)}</TableCell>
              {isAdmin && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    {transaction.status !== 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onApprove?.(transaction.id)}
                        disabled={isLoading}
                        data-testid={`button-approve-${transaction.id}`}
                        className="h-8"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    {transaction.status !== 'flagged' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onFlag?.(transaction.id)}
                        disabled={isLoading}
                        data-testid={`button-flag-${transaction.id}`}
                        className="h-8"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete?.(transaction.id)}
                      disabled={isLoading}
                      data-testid={`button-delete-${transaction.id}`}
                      className="h-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
