import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

import Home from "@/pages/Home";
import EventDetails from "@/pages/EventDetails";
import Classes from "@/pages/Classes";
import Sponsors from "@/pages/Sponsors";
import SponsorDetail from "@/pages/SponsorDetail";
import BecomeSponsor from "@/pages/BecomeSponsor";
import Register from "@/pages/Register";
import Contact from "@/pages/Contact";
import Faq from "@/pages/Faq";
import Privacy from "@/pages/Privacy";
import PaymentSuccess from "@/pages/PaymentSuccess";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminAcceptInvite from "@/pages/admin/AdminAcceptInvite";
import AdminForgotPassword from "@/pages/admin/AdminForgotPassword";
import AdminResetPassword from "@/pages/admin/AdminResetPassword";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminPrint from "@/pages/admin/AdminPrint";
import NotFound from "@/pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let raf;
    function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}

function App() {
  return (
    <div className="App">
      <div className="noise-overlay" />
      <BrowserRouter>
        <AuthProvider>
          <SmoothScroll />
          <ScrollToTop />
          <Toaster theme="dark" position="top-right" richColors />
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/event" element={<Layout><EventDetails /></Layout>} />
            <Route path="/classes" element={<Layout><Classes /></Layout>} />
            <Route path="/sponsors" element={<Layout><Sponsors /></Layout>} />
            <Route path="/become-a-sponsor" element={<Layout><BecomeSponsor /></Layout>} />
            <Route path="/sponsors/:id" element={<Layout><SponsorDetail /></Layout>} />
            <Route path="/register" element={<Layout><Register /></Layout>} />
            <Route path="/contact" element={<Layout><Contact /></Layout>} />
            <Route path="/faq" element={<Layout><Faq /></Layout>} />
            <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
            <Route path="/payment/success" element={<Layout><PaymentSuccess /></Layout>} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/accept-invite" element={<AdminAcceptInvite />} />
            <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
            <Route path="/admin/reset-password" element={<AdminResetPassword />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/print/:type"
              element={
                <ProtectedRoute>
                  <AdminPrint />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
