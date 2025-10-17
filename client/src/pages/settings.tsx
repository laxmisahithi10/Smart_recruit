import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Mail, Key, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully",
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your application preferences and integrations
        </p>
      </div>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Configure email settings for sending interview invitations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smtp-host">SMTP Host</Label>
            <Input
              id="smtp-host"
              placeholder="smtp.gmail.com"
              data-testid="input-smtp-host"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input
                id="smtp-port"
                placeholder="587"
                data-testid="input-smtp-port"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-secure">Security</Label>
              <Input
                id="smtp-secure"
                placeholder="TLS"
                data-testid="input-smtp-secure"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-user">Email Address</Label>
            <Input
              id="smtp-user"
              type="email"
              placeholder="your-email@example.com"
              data-testid="input-smtp-user"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="smtp-password">Email Password</Label>
            <Input
              id="smtp-password"
              type="password"
              placeholder="••••••••"
              data-testid="input-smtp-password"
            />
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Manage API keys for external integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key</Label>
            <Input
              id="openai-key"
              type="password"
              placeholder="sk-••••••••••••••••"
              data-testid="input-openai-key"
            />
            <p className="text-xs text-muted-foreground">
              Used for AI chatbot, bias detection, and interview analysis
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="google-api-key">Google API Key</Label>
            <Input
              id="google-api-key"
              type="password"
              placeholder="••••••••••••••••"
              data-testid="input-google-key"
            />
            <p className="text-xs text-muted-foreground">
              Used for Google Meet integration and calendar scheduling
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Manage your application data and storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
            <div>
              <p className="text-sm font-medium">Export Data</p>
              <p className="text-xs text-muted-foreground">Download all candidate and interview data</p>
            </div>
            <Button variant="outline" size="sm" data-testid="button-export-data">
              Export CSV
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div>
              <p className="text-sm font-medium text-destructive">Clear All Data</p>
              <p className="text-xs text-muted-foreground">Permanently delete all candidates and interviews</p>
            </div>
            <Button variant="destructive" size="sm" data-testid="button-clear-data">
              Clear Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} data-testid="button-save-settings">
          Save Settings
        </Button>
      </div>
    </div>
  );
}
