import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { User, Heart, Target, Calendar } from "lucide-react";
import { useProfile, useUpsertProfile, useMoodEntries } from "@/hooks/useSupabaseData";

export const ProfilePage = () => {
  const { data: profile } = useProfile();
  const saveProfile = useUpsertProfile();
  const { data: moods } = useMoodEntries(30);

  const daysActive = new Set((moods ?? []).map((m) => new Date(m.created_at).toDateString())).size;
  const totalSessions = (moods ?? []).length;
  const weeklyGoal = Math.min(100, Math.round(((moods ?? []).filter((m) => {
    const d = new Date(m.created_at);
    const diff = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length / 14) * 100));

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [timezone, setTimezone] = useState(profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
    setTimezone(profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, [profile]);

  const handleSave = () => {
    saveProfile.mutate({ display_name: displayName, timezone });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-24 h-24 mx-auto rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
          <User className="w-12 h-12 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primary">Your Profile</h1>
          <p className="text-muted-foreground mt-2">{profile?.display_name ? `Welcome, ${profile.display_name}!` : "Update your display name"}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground">{daysActive}</div>
            <p className="text-sm text-muted-foreground">Days Active</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground">{totalSessions}</div>
            <p className="text-sm text-muted-foreground">Mood Entries</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-secondary mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground">{weeklyGoal}%</div>
            <p className="text-sm text-muted-foreground">Weekly Goal</p>
          </CardContent>
        </Card>
      </div>

      {/* Preferences & Goals */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input id="display_name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            </div>
          </div>
          <Button
            onClick={handleSave}
            className="w-full bg-gradient-primary hover:shadow-glow transition-smooth"
          >
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { activity: "Completed mindfulness session", time: "2 hours ago", mood: "calm" },
              { activity: "Logged mood: Happy", time: "5 hours ago", mood: "happy" },
              { activity: "Chat session with AI therapist", time: "1 day ago", mood: "motivated" },
              { activity: "Weekly reflection completed", time: "2 days ago", mood: "neutral" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-glow"></div>
                  <div>
                    <p className="text-foreground text-sm font-medium">{item.activity}</p>
                    <p className="text-muted-foreground text-xs">{item.time}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {item.mood}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
