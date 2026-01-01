import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, CheckCircle, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function GoogleCalendarSetup() {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);

  const getAuthUrlMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("GET", "/api/auth/google");
    },
    onSuccess: (data) => {
      if (data.authUrl) {
        window.open(data.authUrl, '_blank', 'width=500,height=600');
        toast({
          title: "Success",
          description: "Google Calendar authorization opened. Complete the process in the popup.",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Working in Demo Mode",
        description: "Google Calendar not configured. Using mock meeting links for now.",
      });
    },
  });

  const handleConnect = () => {
    getAuthUrlMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>
          Connect Google Calendar for automatic meeting scheduling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant="secondary">
              <Settings className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
          </div>
          <Button
            onClick={handleConnect}
            disabled={getAuthUrlMutation.isPending}
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            {getAuthUrlMutation.isPending ? "Connecting..." : "Connect Google Calendar"}
          </Button>
        </div>

        <div className="p-3 bg-muted/50 rounded-md">
          <p className="text-xs text-muted-foreground">
            <strong>Current Status:</strong> The system works with mock Google Meet links. 
            Interviews can be scheduled normally. Google Calendar integration is optional.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}