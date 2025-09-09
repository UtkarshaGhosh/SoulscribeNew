import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Heart, Target, Calendar } from "lucide-react";

export const ProfilePage = () => {
  const [preferences, setPreferences] = useState({
    mindfulness: true,
    breathingExercises: true,
    journalingPrompts: true,
    distractionTechniques: false,
  });

  const [primaryConcern, setPrimaryConcern] = useState("Motivation");

  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
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
          <p className="text-muted-foreground mt-2">Welcome, simonadams181!</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground">24</div>
            <p className="text-sm text-muted-foreground">Days Active</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-accent mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground">156</div>
            <p className="text-sm text-muted-foreground">Total Sessions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-secondary mx-auto mb-3" />
            <div className="text-2xl font-bold text-foreground">89%</div>
            <p className="text-sm text-muted-foreground">Weekly Goal</p>
          </CardContent>
        </Card>
      </div>

      {/* Preferences & Goals */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Your Preferences & Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Concern */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium">My primary concern is:</Label>
            <div className="flex flex-wrap gap-2">
              {["Motivation", "Anxiety", "Stress", "Depression", "Self-esteem", "Relationships"].map((concern) => (
                <Badge
                  key={concern}
                  variant={primaryConcern === concern ? "default" : "outline"}
                  className={`cursor-pointer transition-smooth ${
                    primaryConcern === concern 
                      ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                      : "hover:border-primary hover:shadow-soft"
                  }`}
                  onClick={() => setPrimaryConcern(concern)}
                >
                  {concern}
                </Badge>
              ))}
            </div>
          </div>

          {/* Coping Strategies */}
          <div className="space-y-4">
            <Label className="text-foreground font-medium">I prefer coping strategies like:</Label>
            <div className="space-y-3">
              {Object.entries({
                mindfulness: "Mindfulness",
                breathingExercises: "Breathing Exercises", 
                journalingPrompts: "Journaling Prompts",
                distractionTechniques: "Distraction Techniques"
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-3">
                  <Checkbox
                    id={key}
                    checked={preferences[key as keyof typeof preferences]}
                    onCheckedChange={(checked) => handlePreferenceChange(key, !!checked)}
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label htmlFor={key} className="text-foreground cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button 
            className="w-full bg-gradient-primary hover:shadow-glow transition-smooth"
          >
            Save Preferences
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