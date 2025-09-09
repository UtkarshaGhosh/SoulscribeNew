import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Heart, Zap, Target } from "lucide-react";
import { useMoodDistribution, useWellness } from "@/hooks/useSupabaseData";

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export const AnalyticsDashboard = () => {
  const today = new Date();
  const { data: wellness = [] } = useWellness(7);
  const { data: moodDist = [] } = useMoodDistribution(formatDate(today));

  const wellbeingData = wellness.map((w) => ({ date: w.date, wellbeing: Number(w.wellbeing_score ?? 0), energy: Number(w.energy_level ?? 0) }));
  const resilienceData = wellness.map((w) => ({ date: w.date, resilience: Number(w.resilience_score ?? 0) * 10 }));
  const avgWellbeing = wellbeingData.length ? wellbeingData.reduce((acc, curr) => acc + curr.wellbeing, 0) / wellbeingData.length : 0;
  const avgEnergy = wellbeingData.length ? wellbeingData.reduce((acc, curr) => acc + curr.energy, 0) / wellbeingData.length : 0;
  const currentResilience = resilienceData.length ? resilienceData[resilienceData.length - 1].resilience : 0;
  const totalMoods = moodDist.reduce((acc, curr) => acc + curr.count, 0);

  const moodDistribution = moodDist.map((m) => ({ mood: m.mood, count: m.count }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Your Wellness Journey</h1>
        <p className="text-muted-foreground">Track your emotional patterns and mental health insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wellbeing Score</CardTitle>
            <Heart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{avgWellbeing.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground mt-1">7-day average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Energy Level</CardTitle>
            <Zap className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{avgEnergy.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground mt-1">Daily energy trend</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resilience Score</CardTitle>
            <Target className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{currentResilience}</div>
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
            <p className="text-xs text-muted-foreground mt-1">Mood logs today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  <YAxis stroke="hsl(var(--muted-foreground))" domain={[0, 10]} />
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
                    width={120}
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
