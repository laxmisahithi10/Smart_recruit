import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, Award } from "lucide-react";
import type { Candidate, Interview } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: candidates = [], isLoading: loadingCandidates } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const { data: interviews = [], isLoading: loadingInterviews } = useQuery<Interview[]>({
    queryKey: ["/api/interviews"],
  });

  const totalCandidates = candidates.length;
  const shortlistedCandidates = candidates.filter(c => c.status === "shortlisted").length;
  const upcomingInterviews = interviews.filter(i => i.status === "scheduled").length;
  const completedInterviews = interviews.filter(i => i.status === "completed").length;

  const recentCandidates = candidates.slice(-5).reverse();
  const upcomingInterviewsList = interviews
    .filter(i => i.status === "scheduled")
    .sort((a, b) => {
      if (!a.scheduledDate || !b.scheduledDate) return 0;
      return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    })
    .slice(0, 5);

  const stats = [
    {
      title: "Total Candidates",
      value: totalCandidates,
      icon: Users,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      testId: "stat-total-candidates",
    },
    {
      title: "Shortlisted",
      value: shortlistedCandidates,
      icon: Award,
      color: "text-accent",
      bgColor: "bg-accent/10",
      testId: "stat-shortlisted",
    },
    {
      title: "Upcoming Interviews",
      value: upcomingInterviews,
      icon: Calendar,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      testId: "stat-upcoming-interviews",
    },
    {
      title: "Completed Interviews",
      value: completedInterviews,
      icon: TrendingUp,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      testId: "stat-completed-interviews",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back! Here's your recruitment overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover-elevate transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono" data-testid={stat.testId}>
                {loadingCandidates || loadingInterviews ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  stat.value
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Candidates */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg">Recent Candidates</CardTitle>
            <Link href="/candidates">
              <Button variant="ghost" size="sm" data-testid="button-view-all-candidates">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingCandidates ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentCandidates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="empty-recent-candidates">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No candidates yet</p>
                <p className="text-xs mt-1">Upload candidate data to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate"
                    data-testid={`candidate-${candidate.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {candidate.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground">{candidate.position}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {candidate.overallScore !== null && candidate.overallScore !== undefined ? (
                        <div className="text-sm font-mono font-semibold text-accent">
                          {candidate.overallScore}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">Not scored</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="text-lg">Upcoming Interviews</CardTitle>
            <Link href="/interviews">
              <Button variant="ghost" size="sm" data-testid="button-view-all-interviews">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {loadingInterviews ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingInterviewsList.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground" data-testid="empty-upcoming-interviews">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No upcoming interviews</p>
                <p className="text-xs mt-1">Schedule interviews to see them here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInterviewsList.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover-elevate"
                    data-testid={`interview-${interview.id}`}
                  >
                    <div>
                      <p className="text-sm font-medium">{interview.candidateName}</p>
                      <p className="text-xs text-muted-foreground">{interview.position}</p>
                    </div>
                    <div className="text-right">
                      {interview.scheduledDate && (
                        <div className="text-xs text-muted-foreground">
                          {new Date(interview.scheduledDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
