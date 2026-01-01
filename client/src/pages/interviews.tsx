import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Video, Mail, AlertCircle, TrendingUp, Award, ExternalLink } from "lucide-react";
import type { Interview, Candidate } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const statusColors: Record<string, string> = {
  scheduled: "bg-chart-4 text-white",
  in_progress: "bg-chart-3 text-white",
  completed: "bg-accent text-accent-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

export default function Interviews() {
  const { toast } = useToast();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  const { data: interviews = [], isLoading: loadingInterviews } = useQuery<Interview[]>({
    queryKey: ["/api/interviews"],
  });

  const { data: candidates = [] } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const scheduleInterviewMutation = useMutation({
    mutationFn: async (data: { candidateId: string; scheduledDate: string }) => {
      return apiRequest("POST", "/api/interviews/schedule", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      setScheduleDialogOpen(false);
      setSelectedCandidate("");
      setScheduledDate("");
      toast({
        title: "Success",
        description: data.calendarLink ? 
          "Interview scheduled with Google Calendar event and email sent to candidate" :
          "Interview scheduled and email sent to candidate",
      });
    },
  });

  const joinInterviewMutation = useMutation({
    mutationFn: async (interviewId: string) => {
      const response = await apiRequest("POST", `/api/interviews/${interviewId}/join`);
      return response;
    },
    onSuccess: (data) => {
      console.log('Join interview response:', data);
      
      // Redirect to Google Meet
      if (data.meetUrl) {
        window.open(data.meetUrl, '_blank');
        toast({
          title: "Interview Joined",
          description: "Redirected to Google Meet. Interview status updated to in progress.",
        });
      } else {
        toast({
          title: "Interview Joined",
          description: "Interview status updated to in progress.",
        });
      }
      
      // Update interview status
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
    },
    onError: (error) => {
      console.error('Join interview error:', error);
      toast({
        title: "Error",
        description: "Failed to join interview",
        variant: "destructive",
      });
    },
  });

  const analyzeInterviewMutation = useMutation({
    mutationFn: async (interviewId: string) => {
      return apiRequest("POST", `/api/interviews/${interviewId}/analyze`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/interviews"] });
      queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
      toast({
        title: "Analysis Complete",
        description: "AI analysis completed and candidate evaluated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to complete interview analysis",
        variant: "destructive",
      });
    },
  });

  const upcomingInterviews = interviews.filter((i) => i.status === "scheduled" || i.status === "in_progress");
  const completedInterviews = interviews.filter((i) => i.status === "completed");

  const handleSchedule = () => {
    if (!selectedCandidate || !scheduledDate) return;
    scheduleInterviewMutation.mutate({
      candidateId: selectedCandidate,
      scheduledDate,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Interviews</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Schedule and manage candidate interviews
          </p>
        </div>
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-schedule-interview">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Interview</DialogTitle>
              <DialogDescription>
                Select a candidate and schedule an interview time
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="candidate">Candidate</Label>
                <Select value={selectedCandidate} onValueChange={setSelectedCandidate}>
                  <SelectTrigger id="candidate" data-testid="select-candidate">
                    <SelectValue placeholder="Select a candidate" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id}>
                        {candidate.name} - {candidate.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="datetime">Date & Time</Label>
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  data-testid="input-schedule-datetime"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSchedule}
                disabled={!selectedCandidate || !scheduledDate || scheduleInterviewMutation.isPending}
                data-testid="button-confirm-schedule"
              >
                {scheduleInterviewMutation.isPending ? "Scheduling..." : "Schedule & Send Email"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Interviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Interviews</CardTitle>
          <CardDescription>
            {upcomingInterviews.length} interview{upcomingInterviews.length !== 1 ? "s" : ""} scheduled or in progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingInterviews ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : upcomingInterviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="empty-upcoming-interviews">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No upcoming interviews</p>
              <p className="text-xs mt-1">Schedule your first interview to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((interview) => (
                <Card
                  key={interview.id}
                  className="hover-elevate transition-all"
                  data-testid={`interview-card-${interview.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold">{interview.candidateName}</h4>
                            <Badge className={statusColors[interview.status]}>
                              {interview.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{interview.position}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {interview.scheduledDate && (
                              <>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(interview.scheduledDate).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(interview.scheduledDate).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {interview.interviewData?.calendarLink && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(interview.interviewData.calendarLink, '_blank')}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Calendar
                          </Button>
                        )}
                        {interview.status === "scheduled" && (
                          <Button
                            size="sm"
                            onClick={() => joinInterviewMutation.mutate(interview.id)}
                            disabled={joinInterviewMutation.isPending}
                            data-testid={`button-join-${interview.id}`}
                          >
                            <Video className="h-3 w-3 mr-1" />
                            {joinInterviewMutation.isPending ? "Joining..." : "Join"}
                          </Button>
                        )}
                        {interview.status === "in_progress" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => analyzeInterviewMutation.mutate(interview.id)}
                            disabled={analyzeInterviewMutation.isPending}
                            data-testid={`button-analyze-${interview.id}`}
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {analyzeInterviewMutation.isPending ? "Analyzing..." : "Analyze"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Interviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Completed Interviews</CardTitle>
          <CardDescription>
            Review candidate performance and AI recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingInterviews ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : completedInterviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="empty-completed-interviews">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No completed interviews yet</p>
              <p className="text-xs mt-1">Completed interviews will appear here with AI analysis</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedInterviews.map((interview) => (
                <Card
                  key={interview.id}
                  className="hover-elevate transition-all"
                  data-testid={`completed-interview-${interview.id}`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                            <Award className="h-6 w-6 text-accent" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold">{interview.candidateName}</h4>
                              <Badge className={statusColors[interview.status]}>
                                {interview.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">{interview.position}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {interview.overallScore !== null && interview.overallScore !== undefined && (
                            <>
                              <div className="text-3xl font-mono font-bold text-accent">
                                {interview.overallScore}
                              </div>
                              <div className="text-xs text-muted-foreground">Overall Score</div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      {(interview.confidenceScore !== null || interview.communicationScore !== null) && (
                        <div className="grid grid-cols-2 gap-4">
                          {interview.confidenceScore !== null && (
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Confidence</span>
                                <span className="font-mono font-semibold">{interview.confidenceScore}</span>
                              </div>
                              <Progress value={interview.confidenceScore} className="h-1.5" />
                            </div>
                          )}
                          {interview.communicationScore !== null && (
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Communication</span>
                                <span className="font-mono font-semibold">{interview.communicationScore}</span>
                              </div>
                              <Progress value={interview.communicationScore} className="h-1.5" />
                            </div>
                          )}
                          {interview.technicalScore !== null && (
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Technical</span>
                                <span className="font-mono font-semibold">{interview.technicalScore}</span>
                              </div>
                              <Progress value={interview.technicalScore} className="h-1.5" />
                            </div>
                          )}
                          {interview.problemSolvingScore !== null && (
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">Problem Solving</span>
                                <span className="font-mono font-semibold">{interview.problemSolvingScore}</span>
                              </div>
                              <Progress value={interview.problemSolvingScore} className="h-1.5" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* AI Recommendation */}
                      {interview.aiRecommendation && (
                        <div className="p-3 bg-muted/50 rounded-md">
                          <p className="text-xs font-semibold mb-1 flex items-center gap-2">
                            <TrendingUp className="h-3 w-3" />
                            AI Recommendation
                          </p>
                          <p className="text-xs text-muted-foreground">{interview.aiRecommendation}</p>
                        </div>
                      )}

                      {/* Proctor Alerts */}
                      {interview.proctorAlerts && interview.proctorAlerts.length > 0 && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                          <p className="text-xs font-semibold mb-2 flex items-center gap-2 text-destructive">
                            <AlertCircle className="h-3 w-3" />
                            Proctor Alerts ({interview.proctorAlerts.length})
                          </p>
                          <ul className="space-y-1">
                            {interview.proctorAlerts.map((alert, idx) => (
                              <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                <span className="text-destructive mt-0.5">•</span>
                                <span>{alert}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
