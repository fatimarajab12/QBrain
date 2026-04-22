import { Users, Server, Activity, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminSystemStats } from "@/services/admin.service";
import { formatNumber, formatUptime } from "@/utils/admin-helpers";

interface StatsCardsProps {
  stats: AdminSystemStats | null;
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card/70 backdrop-blur border-border/60 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 hover-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.totalUsers || 0)}</div>
          <p className="text-sm text-muted-foreground">
            +{stats?.newUsersLast7Days ?? 0} new users (7d)
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur border-border/60 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 hover-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          <Database className="h-4 w-4 text-violet-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.totalProjects || 0)}</div>
          <p className="text-sm text-muted-foreground">
            +{stats?.newProjectsLast7Days ?? 0} new projects (7d)
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur border-border/60 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 hover-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">API Requests (7d)</CardTitle>
          <Activity className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(stats?.apiRequestsLast7Days ?? 0)}</div>
          <p className="text-sm text-muted-foreground">
            Avg latency: {stats?.avgLatencyMsLast7Days ?? 0}ms · {stats?.activeUsersLast7Days ?? 0} active users (7d)
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/70 backdrop-blur border-border/60 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 hover-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Server Status</CardTitle>
          <Server className="h-4 w-4 text-teal-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-500">{stats?.serverStatus || "Online"}</div>
          <p className="text-sm text-muted-foreground">Uptime: {formatUptime(stats?.uptimeSeconds)}</p>
        </CardContent>
      </Card>
    </div>
  );
};

