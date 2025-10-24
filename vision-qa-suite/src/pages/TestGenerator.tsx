// TestGenerator.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestCase {
  id: number;
  title: string;
  priority: "high" | "medium" | "low";
  preconditions: string;
  steps: string[];
  expectedResult: string;
}

const TestGenerator = () => {
  const { toast } = useToast();
  const [featureDescription, setFeatureDescription] = useState("");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for test cases
  const mockTestCases: TestCase[] = [
    {
      id: 1,
      title: "Verify login with valid credentials",
      priority: "high",
      preconditions: "User account exists in the system",
      steps: [
        "Navigate to login page",
        "Enter valid email address",
        "Enter valid password",
        "Click login button"
      ],
      expectedResult: "User successfully logged in and redirected to dashboard",
    },
    {
      id: 2,
      title: "Verify login with invalid password",
      priority: "high",
      preconditions: "User account exists in the system",
      steps: [
        "Navigate to login page",
        "Enter valid email address",
        "Enter invalid password",
        "Click login button"
      ],
      expectedResult: "Error message displayed: 'Invalid email or password'",
    },
    {
      id: 3,
      title: "Verify empty field validation",
      priority: "medium",
      preconditions: "None",
      steps: [
        "Navigate to login page",
        "Leave email field empty",
        "Leave password field empty",
        "Click login button"
      ],
      expectedResult: "Validation errors displayed for both fields",
    },
  ];

  const handleGenerate = async () => {
    if (!featureDescription.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate dynamic test cases based on feature description
      let generatedTestCases = [...mockTestCases];
      
      if (featureDescription.toLowerCase().includes('register') || featureDescription.toLowerCase().includes('signup')) {
        generatedTestCases = [
          {
            id: 1,
            title: "Verify user registration with valid data",
            priority: "high",
            preconditions: "User is not logged in",
            steps: [
              "Navigate to registration page",
              "Enter valid email address",
              "Enter valid password",
              "Confirm password",
              "Click register button"
            ],
            expectedResult: "User account created successfully and redirected to dashboard",
          },
          {
            id: 2,
            title: "Verify registration with existing email",
            priority: "high",
            preconditions: "User account already exists with the email",
            steps: [
              "Navigate to registration page",
              "Enter existing email address",
              "Enter valid password",
              "Confirm password",
              "Click register button"
            ],
            expectedResult: "Error message displayed: 'Email already registered'",
          }
        ];
      }

      setTestCases(generatedTestCases);
      
      toast({
        title: "Test Cases Generated",
        description: `${generatedTestCases.length} test cases have been generated successfully`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: "Generation Failed",
        description: "Failed to generate test cases",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive";
      case "medium": return "bg-accent/10 text-accent";
      case "low": return "bg-success/10 text-success";
      default: return "";
    }
  };

  const handleCopyTestCases = async () => {
    const text = testCases.map(tc => 
      `${tc.title}\nPriority: ${tc.priority}\nPreconditions: ${tc.preconditions}\nSteps:\n${tc.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}\nExpected: ${tc.expectedResult}`
    ).join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Test cases copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy test cases",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Test Case Generator</h1>
          <p className="text-muted-foreground">Generate comprehensive test cases from feature descriptions using AI</p>
        </div>

        <Card className="shadow-soft border-border mb-6">
          <CardHeader>
            <CardTitle>Feature Description</CardTitle>
            <CardDescription>Describe the feature you want to test in detail</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Example: User login page where users can authenticate using email and password. Includes 'Remember me' checkbox and 'Forgot password' link..."
                rows={6}
                value={featureDescription}
                onChange={(e) => setFeatureDescription(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
                {error}
              </div>
            )}
            <Button 
              className="gradient-primary w-full" 
              onClick={handleGenerate}
              disabled={!featureDescription.trim() || isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? "Generating..." : "Generate Test Cases"}
            </Button>
          </CardContent>
        </Card>

        {testCases.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Generated Test Cases</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyTestCases}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            {testCases.map((testCase) => (
              <Card key={testCase.id} className="shadow-soft border-border">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{testCase.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(testCase.priority)}>
                          {testCase.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Preconditions</h4>
                    <p className="text-sm text-muted-foreground">{testCase.preconditions}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Steps</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      {testCase.steps.map((step: string, index: number) => (
                        <li key={index} className="text-sm text-muted-foreground">{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Expected Result</h4>
                    <p className="text-sm text-muted-foreground">{testCase.expectedResult}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestGenerator;