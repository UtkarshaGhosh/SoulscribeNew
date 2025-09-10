import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { HomePage } from "../home/HomePage";
import { ChatInterface } from "../chat/ChatInterface";
import { AnalyticsDashboard } from "../analytics/AnalyticsDashboard";
import { ProfilePage } from "../profile/ProfilePage";
import type { Mood } from "../chat/ChatInterface";
import { applyThemeForMood } from "@/lib/moodTheme";

export const MainLayout = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);

  // Apply theme class based on current mood
  useEffect(() => {
    applyThemeForMood(currentMood);
    return () => applyThemeForMood(null);
  }, [currentMood]);

  const handleMoodChange = (mood: Mood) => {
    setCurrentMood(mood);

    // Store mood with timestamp
    const moodEntry = {
      mood,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString(),
    };

    // Save to localStorage for persistence
    const existingMoods = JSON.parse(localStorage.getItem("soulscribe-moods") || "[]");
    existingMoods.push(moodEntry);
    localStorage.setItem("soulscribe-moods", JSON.stringify(existingMoods));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomePage onNavigate={setActiveTab} />;
      case "chat":
        return <ChatInterface onMoodChange={handleMoodChange} />;
      case "analytics":
        return <AnalyticsDashboard />;
      case "profile":
        return <ProfilePage />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen relative">
      {/* Live ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore */}
        {require('@/components/visual/LiveBackground').default ? require('@/components/visual/LiveBackground').default() : null}
      </div>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};
