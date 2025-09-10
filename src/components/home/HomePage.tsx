import { Button } from "@/components/ui/button";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, BarChart3, Heart, Sparkles } from "lucide-react";

interface HomePageProps {
  onNavigate: (tab: string) => void;
}

export const HomePage = ({ onNavigate }: HomePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="max-w-6xl mx-auto p-6 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-8 py-12">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              A calmer way to understand your{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">mind</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              SoulSCRIBE is your AI companion for reflection, journaling, and emotional wellbeing.
              Chat naturally, track moods, and see gentle insights that help you grow.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-primary hover:shadow-glow transition-smooth px-8 py-6 text-lg"
              onClick={() => onNavigate("chat")}
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Start Chatting
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-primary hover:bg-primary hover:text-primary-foreground transition-smooth px-8 py-6 text-lg"
              onClick={() => onNavigate("analytics")}
            >
              <BarChart3 className="mr-2 w-5 h-5" />
              View Analytics
            </Button>
          </div>

          {/* Decorative Element */}
          <div className="flex justify-center mt-12">
            <div className="w-32 h-32 rounded-full bg-gradient-glow flex items-center justify-center shadow-depth">
              <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <Heart className="w-10 h-10 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">What it does</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-card border-border shadow-soft hover:shadow-glow transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-foreground">Guided AI conversations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Talk freely. Your assistant listens, reflects, and offers supportive prompts grounded in 
                  CBT-inspired techniques.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-soft hover:shadow-glow transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-foreground">Mood tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Log how you feel in the moment. Over time, spot patterns and micro-trends that 
                  help you take action.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-soft hover:shadow-glow transition-smooth">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-foreground">Gentle insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Simple visuals and summaries—no overwhelming charts. Just enough clarity to 
                  guide your next step.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why it helps</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-card border-border shadow-soft">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-glow"></div>
                  Build awareness
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Understanding your emotional patterns is the first step toward positive change.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-soft">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent shadow-glow"></div>
                  Reduce friction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No complex setups or overwhelming features. Just simple, accessible mental health support.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card border-border shadow-soft">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary shadow-glow"></div>
                  Stay consistent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Build healthy habits through gentle reminders and an interface that adapts to your mood.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
