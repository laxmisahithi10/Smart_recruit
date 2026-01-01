import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import type { Candidate } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

const statusColors: Record<string, string> = {
  applied: "bg-chart-4 text-white",
  shortlisted: "bg-accent text-accent-foreground",
  interviewed: "bg-chart-3 text-white",
  rejected: "bg-destructive text-destructive-foreground",
  hired: "bg-chart-2 text-white",
};

export default function Candidates() {
  const { data: candidates = [], isLoading } = useQuery<Candidate[]>({
    queryKey: ["/api/candidates"],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || candidate.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const statuses = ["all", "applied", "shortlisted", "interviewed", "rejected", "hired"];

  return (
    <div className="space-y-8">
      <div className="pb-2">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Candidates</h1>
        <p className="text-muted-foreground mt-2 text-base">
          Manage and review all candidate applications
        </p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or position..."
                className="pl-9 h-11 border-border/50 focus:border-primary/50 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-candidates"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {statuses.map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  data-testid={`button-filter-${status}`}
                  className="capitalize h-11 px-4 font-medium transition-all duration-200"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : filteredCandidates.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground" data-testid="empty-candidates">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No candidates found</p>
              <p className="text-xs mt-1">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your filters"
                  : "Upload candidate data from the Analytics page"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCandidates.map((candidate) => (
            <Card
              key={candidate.id}
              className="hover-elevate transition-all duration-300 border-0 shadow-sm hover:shadow-md"
              data-testid={`card-candidate-${candidate.id}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                      <span className="text-lg font-bold text-primary">
                        {candidate.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold" data-testid={`text-name-${candidate.id}`}>
                        {candidate.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{candidate.email}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5 pt-0">
                <div>
                  <p className="text-base font-semibold text-foreground">
                    {candidate.position}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {candidate.experience} years experience
                  </p>
                </div>

                {candidate.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 4).map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs"
                        data-testid={`skill-${skill}`}
                      >
                        {skill}
                      </Badge>
                    ))}
                    {candidate.skills.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{candidate.skills.length - 4}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <Badge className={`${statusColors[candidate.status]} no-default-hover-elevate px-3 py-1 font-medium`}>
                    {candidate.status}
                  </Badge>
                  {candidate.overallScore !== null && candidate.overallScore !== undefined && (
                    <div className="text-right">
                      <div className="text-xl font-mono font-bold text-accent">
                        {candidate.overallScore}
                      </div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
