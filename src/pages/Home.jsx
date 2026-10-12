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
  const { openSignUp, isSignedIn, profile, profileError, retryProfile } = useAuth();

  const handleSignUp = () => {
    openSignUp();
  };

  const userRole = isSignedIn
    ? (profile?.role || null)
    : "guest";

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbf9f5] text-[#111827] selection:bg-[#f59e0b] selection:text-stone-900">
      <Navbar />

      <main>
        {/* Loading skeleton while profile is resolving */}
        {isSignedIn && !profile && profileError && (
          <section role="alert" className="mx-auto my-10 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-950 shadow-sm sm:p-8">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-amber-100 text-xl font-bold text-amber-700">!</span>
            <h1 className="mt-4 text-xl font-bold">{"Unable to load account permissions"}</h1>
            <p className="mt-2 text-sm leading-relaxed text-amber-900">{profileError || "Your account profile is not ready yet. Try again in a moment."}</p>
            <button type="button" onClick={() => retryProfile()} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#8f2338] px-5 text-sm font-semibold text-white transition hover:bg-[#781c2e]">
              {"Retry connection"}
            </button>
          </section>
        )}

        {isSignedIn && !profileError && !profile && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <DashboardSkeleton />
          </div>
        )}

        {/* =====================================================
            1. TAILOR VIEW: Atelier cockpit, pipeline, bulk feed
        ====================================================== */}
        {isSignedIn && !profileError && userRole === "tailor" && (
          <div className="mx-auto max-w-[1536px] px-3 sm:px-6 lg:px-8 py-4">
            <TailorHomeSection />
          </div>
        )}

        {/* =====================================================
            2. BUSINESS VIEW: Corporate RFQs, batch procurement
        ====================================================== */}
        {isSignedIn && !profileError && userRole === "business" && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <BusinessHomeSection />
          </div>
        )}

        {/* =====================================================
            3. ADMIN VIEW: Verification audits, platform queues
        ====================================================== */}
        {isSignedIn && !profileError && userRole === "admin" && (
          <div className="mx-auto max-w-[1536px] px-3 sm:px-6 lg:px-8 py-4">
            <AdminHomeSection />
          </div>
        )}

        {/* =====================================================
            4. CUSTOMER VIEW: Personalized bespoke cockpit, vault, orders
        ====================================================== */}
        {isSignedIn && !profileError && userRole === "customer" && (
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
