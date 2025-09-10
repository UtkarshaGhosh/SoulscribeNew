import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Heart, Zap, Target, AlertTriangle } from "lucide-react";
import { useWellness } from "@/hooks/useSupabaseData";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

function formatDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export const AnalyticsDashboard = () => {
  const qc = useQueryClient();
  const { data: wellness = [], refetch } = useWellness(7);

  // Re-derive datasets from the fetched wellness data
  const wellbeingData = wellness.map((w) => ({ date: w.date, wellbeing: Number(w.wellbeing_score ?? 0), energy: Number(w.energy_level ?? 0) }));
  const volatilityData = wellness.map((w) => ({ date: w.date, volatility: Number(w.emotional_volatility ?? 0) }));
  const resilienceData = wellness.map((w) => ({ date: w.date, resilience: Math.round(Number(w.resilience_score ?? 0) * 10) }));
  const avgWellbeing = wellbeingData.length ? wellbeingData.reduce((acc, curr) => acc + curr.wellbeing, 0) / wellbeingData.length : 0;
  const avgEnergy = wellbeingData.length ? wellbeingData.reduce((acc, curr) => acc + curr.energy, 0) / wellbeingData.length : 0;
  const avgVolatility = volatilityData.length ? volatilityData.reduce((acc, curr) => acc + curr.volatility, 0) / volatilityData.length : 0;
  const currentResilience = resilienceData.length ? resilienceData[resilienceData.length - 1].resilience : 0;
  const currentVolatility = volatilityData.length ? volatilityData[volatilityData.length - 1].volatility : 0;

  // Realtime subscriptions to keep analytics live
  useEffect(() => {
    // Listen to wellness_metrics and mood_entries changes
    const wellnessSub = supabase
      .channel('public:wellness_metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wellness_metrics' }, () => {
        qc.invalidateQueries({ queryKey: ['wellness'] });
        // also trigger immediate refetch
        refetch();
      })
      .subscribe();

    const moodSub = supabase
      .channel('public:mood_entries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mood_entries' }, () => {
        qc.invalidateQueries({ queryKey: ['wellness'] });
        refetch();
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(wellnessSub);
      } catch (e) {}
      try {
        supabase.removeChannel(moodSub);
      } catch (e) {}
    };
  }, [qc, refetch]);

  const getResilienceClass = (r: number) => {
    if (r >= 75) return 'text-primary';
    if (r >= 40) return 'text-accent';
    return 'text-destructive';
  };

  const resilienceStroke = currentResilience >= 75 ? 'hsl(var(--primary))' : currentResilience >= 40 ? 'hsl(var(--accent))' : 'hsl(var(--destructive))';

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
            <div className={`text-2xl font-bold ${getResilienceClass(currentResilience)}`}>{currentResilience}%</div>
            <p className="text-xs text-muted-foreground mt-1">Stress coping ability</p>
          </CardContent>
        </Card>


        <Card className="bg-gradient-card border-border shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Emotional Volatility</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentVolatility <= 2 ? 'text-primary' : currentVolatility <=5 ? 'text-accent' : 'text-destructive'}`}>{avgVolatility.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">Lower is steadier; higher indicates more fluctuation</p>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
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
                    stroke="#ffffff"
                    tick={{ fill: '#ffffff' }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#ffffff" tick={{ fill: '#ffffff' }} domain={[0, 10]} />
                  <Line
                    type="monotone"
                    dataKey="wellbeing"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "#ffffff", stroke: "#ffffff", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="energy"
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    dot={{ fill: "#ffffff", stroke: "#ffffff", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
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
                  stroke="#ffffff"
                  tick={{ fill: '#ffffff' }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#ffffff" tick={{ fill: '#ffffff' }} domain={[0, 100]} tickFormatter={(v)=>`${v}%`} />
                <Line
                  type="monotone"
                  dataKey="resilience"
                  stroke={resilienceStroke}
                  strokeWidth={3}
                  dot={{ fill: "#ffffff", stroke: "#ffffff", strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
