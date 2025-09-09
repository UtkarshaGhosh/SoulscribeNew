import { Home, MessageCircle, User, BarChart3, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigation = [
  { id: "home", icon: Home, label: "Home" },
  { id: "chat", icon: MessageCircle, label: "Chat" },
  { id: "profile", icon: User, label: "Profile" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
];

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <div className="w-16 h-screen bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 shadow-soft">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Heart className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="icon"
              className={cn(
                "w-12 h-12 rounded-xl transition-smooth hover:bg-sidebar-accent hover:shadow-soft",
                isActive && "bg-sidebar-accent shadow-glow border border-primary/20"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon 
                className={cn(
                  "w-5 h-5 transition-smooth",
                  isActive ? "text-primary" : "text-sidebar-foreground"
                )} 
              />
            </Button>
          );
        })}
      </nav>
    </div>
  );
};
