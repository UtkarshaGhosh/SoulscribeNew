import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { HomePage } from "../home/HomePage";
import { ChatInterface } from "../chat/ChatInterface";
import { AnalyticsDashboard } from "../analytics/AnalyticsDashboard";
import { ProfilePage } from "../profile/ProfilePage";
import type { Mood } from "../chat/ChatInterface";

export const MainLayout = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [currentMood, setCurrentMood] = useState<Mood | null>(null);

  // Dynamic background based on mood
  useEffect(() => {
    const body = document.body;
    // Remove any existing mood- classes without clobbering other classes
    Array.from(body.classList)
      .filter((c) => c.startsWith('mood-'))
      .forEach((c) => body.classList.remove(c));

    if (currentMood) {
      body.classList.add(`mood-${currentMood}`);
    }

    return () => {
      Array.from(body.classList)
        .filter((c) => c.startsWith('mood-'))
        .forEach((c) => body.classList.remove(c));
    };
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
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};
