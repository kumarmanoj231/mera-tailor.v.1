import React from "react";
import { useAuth } from "../context/AuthContext";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import HeroSection from "../components/home/HeroSection";
import TrustMetricsSection from "../components/home/TrustMetricsSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import StitchCategoriesSection from "../components/home/StitchCategoriesSection";
import FeaturedTailorsSection from "../components/home/FeaturedTailorsSection";
import AudienceSection from "../components/home/AudienceSection";
import TailorHomeSection from "../components/home/TailorHomeSection";
import BusinessHomeSection from "../components/home/BusinessHomeSection";
import AdminHomeSection from "../components/home/AdminHomeSection";
import CustomerHomeSection from "../components/home/CustomerHomeSection";

const Home = () => {
  const { openSignUp, isSignedIn, profile, user } = useAuth();

  const handleSignUp = () => {
    openSignUp();
  };

  const userRole = isSignedIn ? (profile?.role || user?.publicMetadata?.appRole || "customer") : "guest";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbf9f5] text-[#111827] selection:bg-[#f59e0b] selection:text-stone-900">
      <Navbar />

      <main>
        {/* =====================================================
            1. TAILOR VIEW: Atelier cockpit, pipeline, bulk feed
        ====================================================== */}
        {isSignedIn && userRole === "tailor" && (
          <div className="mx-auto max-w-[1536px] px-3 sm:px-6 lg:px-8 py-4">
            <TailorHomeSection />
          </div>
        )}

        {/* =====================================================
            2. BUSINESS VIEW: Corporate RFQs, batch procurement
        ====================================================== */}
        {isSignedIn && userRole === "business" && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <BusinessHomeSection />
          </div>
        )}

        {/* =====================================================
            3. ADMIN VIEW: Verification audits, platform queues
        ====================================================== */}
        {isSignedIn && userRole === "admin" && (
          <div className="mx-auto max-w-[1536px] px-3 sm:px-6 lg:px-8 py-4">
            <AdminHomeSection />
          </div>
        )}

        {/* =====================================================
            4. CUSTOMER VIEW: Personalized bespoke cockpit, vault, orders
        ====================================================== */}
        {isSignedIn && userRole === "customer" && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <CustomerHomeSection />
          </div>
        )}

        {/* =====================================================
            5. GUEST (NOT SIGNED IN): Full landing & audience onboarding
               (UNMODIFIED - Preserved exactly as requested)
        ====================================================== */}
        {!isSignedIn && (
          <>
            <HeroSection
              isSignedIn={false}
              onSignUp={handleSignUp}
            />

            <TrustMetricsSection />

            <HowItWorksSection />

            <StitchCategoriesSection />

            <FeaturedTailorsSection />

            <AudienceSection />
          </>
        )}
      </main>

      <Footer
        isSignedIn={isSignedIn}
        onSignUp={handleSignUp}
      />
    </div>
  );
};

export default Home;