import { useState, useEffect } from "react";
import { AppProvider, useApp } from "./contexts/AppContext";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";

function AppContent() {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LandingPage />;
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
