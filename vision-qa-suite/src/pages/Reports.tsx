import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface ReportStats {
  testCases: { total: number; passed: number; failed: number; trend: number };
  bugs: { critical: number; high: number; medium: number; low: number; trend: number };
  coverage: { value: number; trend: number };
}

interface Activity {
  date: string;
  project: string;
  action: string;
  count: number;
}

const Reports = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Mock data for reports
  const mockStats: ReportStats = {
    testCases: { total: 284, passed: 268, failed: 16, trend: 5.2 },
    bugs: { critical: 5, high: 8, medium: 15, low: 23, trend: -12 },
    coverage: { value: 94.2, trend: 2.1 },
  };

  const mockActivity: Activity[] = [
    { date: "2024-03-15", project: "E-commerce Platform", action: "Test Cases Generated", count: 12 },
    { date: "2024-03-15", project: "Mobile App v2.0", action: "Bug Analyzed", count: 3 },
    { date: "2024-03-14", project: "Admin Dashboard", action: "Visual Comparison", count: 5 },
    { date: "2024-03-14", project: "E-commerce Platform", action: "Test Cases Executed", count: 45 },
  ];

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // TODO: Replace with actual API calls
      // const statsResponse = await fetch('/api/reports/stats');
      // const activityResponse = await fetch('/api/reports/activity');
      
      // const statsData = await statsResponse.json();
      // const activityData = await activityResponse.json();

      setStats(mockStats);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast({
        title: "Error",
        description: "Failed to load reports data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      // Simulate export delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Replace with actual export API calls
      // const response = await fetch(`/api/reports/export/${format}`);
      
      toast({
        title: "Export Successful",
        description: `Report exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Export Failed",
        description: `Failed to export report as ${format.toUpperCase()}`,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendText = (trend: number) => {
    if (trend > 0) return `+${trend}% this month`;
    if (trend < 0) return `${trend}% this month`;
    return "No change this month";
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Data Available</h1>
          <p className="text-muted-foreground">Unable to load reports data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-muted-foreground">Track your testing performance and insights</p>
          </div>
          <div className="flex gap-2">
          
           
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
          <TabsTrigger value="bugs">Bugs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-soft border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Test Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{stats.testCases.total}</div>
                <div className="flex items-center gap-4 text-sm">
                  <div className={`flex items-center gap-1 ${stats.testCases.trend > 0 ? 'text-success' : stats.testCases.trend < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Passed</span>
                    <span className="font-medium text-success">{stats.testCases.passed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Failed</span>
                    <span className="font-medium text-destructive">{stats.testCases.failed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pass Rate</span>
                    <span className="font-medium">
                      {((stats.testCases.passed / stats.testCases.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Active Bugs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className={`flex items-center gap-1 ${stats.bugs.trend > 0 ? 'text-destructive' : stats.bugs.trend < 0 ? 'text-success' : 'text-muted-foreground'}`}>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Critical</span>
                    <span className="font-medium text-destructive">{stats.bugs.critical}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">High</span>
                    <span className="font-medium text-orange-500">{stats.bugs.high}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Medium</span>
                    <span className="font-medium text-yellow-500">{stats.bugs.medium}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Low</span>
                    <span className="font-medium text-blue-500">{stats.bugs.low}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft border-border">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Test Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">{stats.coverage.value}%</div>
                <div className="flex items-center gap-4 text-sm">
                  <div className={`flex items-center gap-1 ${stats.coverage.trend > 0 ? 'text-success' : stats.coverage.trend < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="gradient-primary h-2 rounded-full transition-all"
                      style={{ width: `${stats.coverage.value}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

       
        </TabsContent>

        <TabsContent value="test-cases">
          <Card className="shadow-soft border-border">
            <CardHeader>
              <CardTitle>Test Cases Analytics</CardTitle>
              <CardDescription>Detailed breakdown of test case execution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-success">{stats.testCases.passed}</div>
                    <div className="text-sm text-muted-foreground">Passed</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-destructive">{stats.testCases.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{stats.testCases.total}</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">
                      {((stats.testCases.passed / stats.testCases.total) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
                <p className="text-muted-foreground text-center">
                  Detailed test case analytics charts will be displayed here when backend is connected
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bugs">
          <Card className="shadow-soft border-border">
            <CardHeader>
              <CardTitle>Bug Analytics</CardTitle>
              <CardDescription>Bug trends and classification data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-destructive">{stats.bugs.critical}</div>
                    <div className="text-sm text-muted-foreground">Critical</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-500">{stats.bugs.high}</div>
                    <div className="text-sm text-muted-foreground">High</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-500">{stats.bugs.medium}</div>
                    <div className="text-sm text-muted-foreground">Medium</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-500">{stats.bugs.low}</div>
                    <div className="text-sm text-muted-foreground">Low</div>
                  </div>
                </div>
                <p className="text-muted-foreground text-center">
                  Detailed bug analytics charts will be displayed here when backend is connected
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

     
      </Tabs>
    </div>
  );
};

export default Reports;