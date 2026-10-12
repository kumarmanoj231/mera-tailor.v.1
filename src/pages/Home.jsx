import React, { lazy } from "react";
import { useAuth } from "../context/AuthContext";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import HeroSection from "../components/home/HeroSection";
import TrustMetricsSection from "../components/home/TrustMetricsSection";
import HowItWorksSection from "../components/home/HowItWorksSection";
import StitchCategoriesSection from "../components/home/StitchCategoriesSection";
import FeaturedTailorsSection from "../components/home/FeaturedTailorsSection";
import AudienceSection from "../components/home/AudienceSection";
import DashboardSkeleton from "../components/common/DashboardSkeleton";

const TailorHomeSection = lazy(() => import("../components/home/TailorHomeSection"));
const BusinessHomeSection = lazy(() => import("../components/home/BusinessHomeSection"));
const AdminHomeSection = lazy(() => import("../components/home/AdminHomeSection"));
const CustomerHomeSection = lazy(() => import("../components/home/CustomerHomeSection"));

const Home = () => {
  const { openSignUp, isSignedIn, isProfileLoaded, profile, user } = useAuth();

  const handleSignUp = () => {
    openSignUp();
  };

  const cachedRole = typeof window !== "undefined" ? localStorage.getItem("meraTailor.userRole") : null;
  const userRole = isSignedIn
    ? (profile?.role || cachedRole || user?.publicMetadata?.appRole || (isProfileLoaded ? "customer" : null))
    : "guest";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbf9f5] text-[#111827] selection:bg-[#f59e0b] selection:text-stone-900">
      <Navbar />

      <main>
        {/* Loading skeleton while profile is resolving */}
        {isSignedIn && !isProfileLoaded && !userRole && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <DashboardSkeleton />
          </div>
        )}

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
