// BugAnalyzer.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertCircle, Lightbulb, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BugAnalysis {
  severity: "critical" | "high" | "medium" | "low";
  type: string;
  category: string;
  impact: string;
  rootCause: string;
  suggestedFix: string;
  estimatedTime: string;
  affectedAreas: string[];
}

const BugAnalyzer = () => {
  const { toast } = useToast();
  const [bugReport, setBugReport] = useState("");
  const [analysis, setAnalysis] = useState<BugAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for bug analysis
  const mockBugAnalysis: BugAnalysis = {
    severity: "high",
    type: "functional",
    category: "Authentication",
    impact: "Users cannot log in to the application, blocking access to all features",
    rootCause: "Session validation logic is incorrectly checking expired tokens",
    suggestedFix: "Update the token validation middleware to properly handle token expiration. Implement automatic token refresh mechanism before expiration.",
    estimatedTime: "2-4 hours",
    affectedAreas: ["Login Module", "Session Management", "API Authentication"],
  };

  const handleAnalyze = async () => {
    if (!bugReport.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response based on bug report content
      let mockResponse = { ...mockBugAnalysis };
      
      // Adjust analysis based on keywords in bug report
      if (bugReport.toLowerCase().includes('critical') || bugReport.toLowerCase().includes('crash')) {
        mockResponse.severity = "critical";
        mockResponse.impact = "Application crashes completely, affecting all users";
        mockResponse.estimatedTime = "4-6 hours";
      } else if (bugReport.toLowerCase().includes('ui') || bugReport.toLowerCase().includes('design')) {
        mockResponse.type = "UI/UX";
        mockResponse.category = "User Interface";
        mockResponse.severity = "medium";
        mockResponse.impact = "Visual inconsistency affects user experience but functionality remains intact";
        mockResponse.estimatedTime = "1-2 hours";
      }

      setAnalysis(mockResponse);
      
      toast({
        title: "Analysis Complete",
        description: "Bug report has been analyzed successfully",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze bug report",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-destructive/80 text-white";
      case "medium": return "bg-accent text-accent-foreground";
      case "low": return "bg-success text-white";
      default: return "";
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bug Report Analyzer</h1>
          <p className="text-muted-foreground">Analyze and classify bug reports with AI-powered severity detection</p>
        </div>

        <Card className="shadow-soft border-border mb-6">
          <CardHeader>
            <CardTitle>Bug Report</CardTitle>
            <CardDescription>Paste or type your bug report for analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bug-report">Bug Description</Label>
              <Textarea
                id="bug-report"
                placeholder="Example: Users are unable to log in after entering correct credentials. The login button shows loading state but then displays 'Session expired' error immediately..."
                rows={8}
                value={bugReport}
                onChange={(e) => setBugReport(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                {error}
              </div>
            )}
            <Button 
              className="gradient-primary w-full" 
              onClick={handleAnalyze}
              disabled={!bugReport.trim() || isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isAnalyzing ? "Analyzing..." : "Analyze Bug Report"}
            </Button>
          </CardContent>
        </Card>

        {analysis && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Analysis Results</h2>

            <Card className="shadow-soft border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Severity</Label>
                    <Badge className={`${getSeverityColor(analysis.severity)} mt-1`}>
                      {analysis.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Type</Label>
                    <Badge variant="outline" className="mt-1">
                      {analysis.type}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <Badge variant="outline" className="mt-1">
                      {analysis.category}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Label className="text-sm font-semibold mb-2 block">Impact Analysis</Label>
                  <p className="text-sm text-muted-foreground">{analysis.impact}</p>
                </div>

                <div className="pt-4 border-t border-border">
                  <Label className="text-sm font-semibold mb-2 block">Root Cause</Label>
                  <p className="text-sm text-muted-foreground">{analysis.rootCause}</p>
                </div>
              </CardContent>
            </Card>

            
            
          </div>
        )}
      </div>
    </div>
  );
};

export default BugAnalyzer;