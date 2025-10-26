import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  valueClassName?: string;
}

export function StatCard({ title, value, icon: Icon, valueClassName = "" }: StatCardProps) {
  return (
    <Card className="p-6 hover-elevate">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-3xl font-bold ${valueClassName}`} data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </p>
        </div>
        <div className="text-primary">
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </Card>
  );
}
