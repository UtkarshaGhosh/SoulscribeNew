import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Heart, Zap, Target } from "lucide-react";

const wellbeingData = [
  { date: "2025-09-03", wellbeing: 4.2, energy: 3.8 },
  { date: "2025-09-04", wellbeing: 4.8, energy: 4.2 },
  { date: "2025-09-05", wellbeing: 3.9, energy: 3.5 },
  { date: "2025-09-06", wellbeing: 5.1, energy: 4.6 },
  { date: "2025-09-07", wellbeing: 4.7, energy: 4.1 },
  { date: "2025-09-08", wellbeing: 5.3, energy: 4.8 },
  { date: "2025-09-09", wellbeing: 4.9, energy: 4.4 },
];

const moodDistribution = [
  { mood: "Happy", count: 12, color: "#fbbf24" },
  { mood: "Calm", count: 18, color: "#10b981" },
  { mood: "Excited", count: 8, color: "#8b5cf6" },
  { mood: "Anxious", count: 6, color: "#f59e0b" },
  { mood: "Sad", count: 3, color: "#3b82f6" },
  { mood: "Frustrated", count: 4, color: "#ef4444" },
];

const resilienceData = [
  { date: "2025-09-03", resilience: 65 },
  { date: "2025-09-04", resilience: 72 },
  { date: "2025-09-05", resilience: 68 },
  { date: "2025-09-06", resilience: 78 },
  { date: "2025-09-07", resilience: 75 },
  { date: "2025-09-08", resilience: 82 },
  { date: "2025-09-09", resilience: 79 },
];

export const AnalyticsDashboard = () => {
  const avgWellbeing = wellbeingData.reduce((acc, curr) => acc + curr.wellbeing, 0) / wellbeingData.length;
  const avgEnergy = wellbeingData.reduce((acc, curr) => acc + curr.energy, 0) / wellbeingData.length;
  const currentResilience = resilienceData[resilienceData.length - 1].resilience;
  const totalMoods = moodDistribution.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Your Wellness Journey</h1>
        <p className="text-muted-foreground">Track your emotional patterns and mental health insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wellbeing Score</CardTitle>
            <Heart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{avgWellbeing.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground mt-1">7-day average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Energy Level</CardTitle>
            <Zap className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{avgEnergy.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground mt-1">Daily energy trend</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resilience Score</CardTitle>
            <Target className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{currentResilience}%</div>
            <p className="text-xs text-muted-foreground mt-1">Stress coping ability</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Entries</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalMoods}</div>
            <p className="text-xs text-muted-foreground mt-1">Mood logs this week</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wellbeing & Energy Trends */}
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground">Daily Average: Wellbeing & Energy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wellbeingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 6]} />
                  <Line 
                    type="monotone" 
                    dataKey="wellbeing" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="energy" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mood Distribution */}
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground">Daily Mood Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodDistribution} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    type="category" 
                    dataKey="mood" 
                    stroke="hsl(var(--muted-foreground))"
                    width={80}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resilience Progress */}
      <Card className="bg-gradient-card border-border shadow-soft">
        <CardHeader>
          <CardTitle className="text-foreground">Resilience Score Over Time</CardTitle>
          <p className="text-muted-foreground text-sm">Your ability to bounce back from challenges</p>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resilienceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Line 
                  type="monotone" 
                  dataKey="resilience" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};