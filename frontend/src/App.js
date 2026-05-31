import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthCallback from "@/components/AuthCallback";
import Home from "@/pages/Home";
import Analizler from "@/pages/Analizler";
import AnalysisDetail from "@/pages/AnalysisDetail";
import ReverseEngineering from "@/pages/ReverseEngineering";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import { Toaster } from "sonner";

function AppRouter() {
  const location = useLocation();
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <div className="min-h-screen flex flex-col relative" style={{ zIndex: 2 }}>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analizler" element={<Analizler />} />
          <Route path="/analizler/:slug" element={<AnalysisDetail />} />
          <Route path="/reverse-engineering" element={<ReverseEngineering />} />
          <Route path="/hakkimizda" element={<About />} />
          <Route path="/iletisim" element={<Contact />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
        <Toaster theme="dark" position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
