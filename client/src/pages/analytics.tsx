import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Candidate, JobDescription } from "@shared/schema";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function Analytics() {
  const [jobDescription, setJobDescription] = useState("");
  const { toast } = useToast();

  const { data: candidates = [] } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const { data: jobDescriptions = [] } = useQuery<JobDescription[]>({
    queryKey: ["/api/job-descriptions"],
  });

  const uploadCsvMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiRequest("POST", "/api/candidates/upload-csv", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({
        title: "Success",
        description: "Candidates uploaded and analyzed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload CSV file",
        variant: "destructive",
      });
    },
  });

  const analyzeBiasMutation = useMutation({
    mutationFn: async (description: string) => {
      return apiRequest("POST", "/api/job-descriptions/analyze-bias", { description });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/job-descriptions"] });
      setJobDescription("");
      toast({
        title: "Analysis Complete",
        description: "Job description bias analysis completed",
      });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadCsvMutation.mutate(file);
    }
  };

  // Aggregate skills data
  const skillsData = candidates.reduce((acc, candidate) => {
    candidate.skills.forEach((skill) => {
      if (!acc[skill]) acc[skill] = 0;
      acc[skill]++;
    });
    return acc;
  }, {} as Record<string, number>);

  const topSkills = Object.entries(skillsData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  // Experience distribution
  const experienceRanges = [
    { range: "0-2 years", min: 0, max: 2 },
    { range: "3-5 years", min: 3, max: 5 },
    { range: "6-10 years", min: 6, max: 10 },
    { range: "10+ years", min: 11, max: 100 },
  ];

  const experienceData = experienceRanges.map((range) => ({
    range: range.range,
    count: candidates.filter((c) => c.experience >= range.min && c.experience <= range.max).length,
  }));

  // Status distribution
  const statusData = [
    { status: "Applied", count: candidates.filter((c) => c.status === "applied").length },
    { status: "Shortlisted", count: candidates.filter((c) => c.status === "shortlisted").length },
    { status: "Interviewed", count: candidates.filter((c) => c.status === "interviewed").length },
    { status: "Rejected", count: candidates.filter((c) => c.status === "rejected").length },
    { status: "Hired", count: candidates.filter((c) => c.status === "hired").length },
  ].filter((d) => d.count > 0);

  // Sample radar chart data (top candidates comparison)
  const topCandidates = candidates
    .filter((c) => c.overallScore !== null && c.overallScore !== undefined)
    .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))
    .slice(0, 3);

  const radarData = [
    { subject: "Technical", ...Object.fromEntries(topCandidates.map((c, i) => [`candidate${i}`, (c.overallScore || 0) * 0.9])) },
    { subject: "Communication", ...Object.fromEntries(topCandidates.map((c, i) => [`candidate${i}`, (c.overallScore || 0) * 0.85])) },
    { subject: "Problem Solving", ...Object.fromEntries(topCandidates.map((c, i) => [`candidate${i}`, (c.overallScore || 0) * 0.95])) },
    { subject: "Experience", ...Object.fromEntries(topCandidates.map((c, i) => [`candidate${i}`, Math.min(c.experience * 10, 100)])) },
    { subject: "Cultural Fit", ...Object.fromEntries(topCandidates.map((c, i) => [`candidate${i}`, (c.overallScore || 0) * 0.88])) },
  ];

  const latestBiasReport = jobDescriptions[jobDescriptions.length - 1];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics & Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload candidate data and analyze job descriptions for bias
        </p>
      </div>

      {/* CSV Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Candidate Data</CardTitle>
          <CardDescription>
            Upload a CSV file with candidate information for AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg hover-elevate transition-all">
            <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm font-medium mb-2">
              {uploadCsvMutation.isPending ? "Uploading..." : "Drag and drop or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground mb-4">CSV files only</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
              data-testid="input-csv-upload"
              disabled={uploadCsvMutation.isPending}
            />
            <label htmlFor="csv-upload">
              <Button asChild disabled={uploadCsvMutation.isPending} data-testid="button-upload-csv">
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Select CSV File
                </span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Bias Detection Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Description Bias Detection</CardTitle>
          <CardDescription>
            Analyze job descriptions for potential bias and get inclusive suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste your job description here..."
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            data-testid="textarea-job-description"
          />
          <Button
            onClick={() => analyzeBiasMutation.mutate(jobDescription)}
            disabled={!jobDescription.trim() || analyzeBiasMutation.isPending}
            data-testid="button-analyze-bias"
          >
            {analyzeBiasMutation.isPending ? "Analyzing..." : "Analyze for Bias"}
          </Button>

          {latestBiasReport && (
            <div className="mt-6 p-4 border-l-4 border-l-chart-3 bg-muted/50 rounded-md space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold mb-2">Fairness Analysis</h4>
                  <p className="text-xs text-muted-foreground mb-3">{latestBiasReport.title}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-accent" data-testid="text-fairness-score">
                    {latestBiasReport.fairnessScore || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Fairness Score</div>
                </div>
              </div>

              {latestBiasReport.biasIndicators && latestBiasReport.biasIndicators.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-chart-3" />
                    Bias Indicators Detected
                  </h5>
                  <ul className="space-y-1">
                    {latestBiasReport.biasIndicators.map((indicator, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-chart-3 mt-0.5">•</span>
                        <span>{indicator}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {latestBiasReport.suggestions && latestBiasReport.suggestions.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-accent" />
                    Inclusive Suggestions
                  </h5>
                  <ul className="space-y-1">
                    {latestBiasReport.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-accent mt-0.5">✓</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      {candidates.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Skills Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Skills Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {topSkills.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topSkills}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="skill" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">No skill data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Experience Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Experience Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {experienceData.some((d) => d.count > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={experienceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {experienceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">No experience data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Candidate Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="status" type="category" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                    <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">No status data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Candidates Comparison Radar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Candidates Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              {topCandidates.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    {topCandidates.map((candidate, index) => (
                      <Radar
                        key={candidate.id}
                        name={candidate.name}
                        dataKey={`candidate${index}`}
                        stroke={COLORS[index]}
                        fill={COLORS[index]}
                        fillOpacity={0.2}
                      />
                    ))}
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <p className="text-sm">No scored candidates available for comparison</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
