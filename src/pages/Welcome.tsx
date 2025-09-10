import React from "react";
import LoadingScreen from "@/components/visual/LoadingScreen";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen">
      <LoadingScreen onContinue={() => navigate('/')} />
    </div>
  );
}
