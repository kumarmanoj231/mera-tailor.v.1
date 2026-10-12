import React from "react";

export function SkeletonBlock({ className = "", children }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-shimmer rounded-xl bg-stone-200/70 ${className}`}
    >
      {children}
    </div>
  );
}

export function PageContentSkeleton({ role = "customer" }) {
  const isAdmin = role === "admin";
  const isTailor = role === "tailor";
  const isBusiness = role === "business";

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn" role="status" aria-label="Loading content">
      {/* 1. Breadcrumbs Placeholder */}
      <div className="flex items-center gap-2">
        <SkeletonBlock className="h-4 w-16" />
        <span className="text-stone-300">/</span>
        <SkeletonBlock className="h-4 w-28" />
        <span className="text-stone-300">/</span>
        <SkeletonBlock className="h-4 w-20" />
      </div>

      {/* 2. Hero Profile / Studio Header Card */}
      <div className="rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Avatar skeleton */}
            <SkeletonBlock className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-stone-100" />
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <SkeletonBlock className="h-6 w-36 sm:w-48 rounded-lg" />
                <SkeletonBlock className="h-5 w-20 rounded-full bg-rose-100/60" />
              </div>
              <SkeletonBlock className="h-4 w-44 sm:w-60 rounded-md" />
              <div className="flex items-center gap-2 pt-1">
                <SkeletonBlock className="h-4 w-24 rounded-md" />
                <SkeletonBlock className="h-4 w-20 rounded-md" />
              </div>
            </div>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <SkeletonBlock className="h-9 w-28 rounded-xl" />
            <SkeletonBlock className="h-9 w-32 rounded-xl bg-[#8f2338]/20" />
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-stone-200/80 pb-1">
        <SkeletonBlock className="h-9 w-24 rounded-xl bg-[#8f2338]/25" />
        <SkeletonBlock className="h-9 w-28 rounded-xl" />
        <SkeletonBlock className="h-9 w-32 rounded-xl" />
        <SkeletonBlock className="h-9 w-28 rounded-xl" />
      </div>

      {/* 4. Core Metrics KPI Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-4 w-20 rounded-md" />
              <SkeletonBlock className="h-8 w-8 rounded-xl bg-stone-100" />
            </div>
            <SkeletonBlock className="h-7 w-16 sm:w-24 rounded-lg" />
            <SkeletonBlock className="h-3 w-28 rounded-md" />
          </div>
        ))}
      </div>

      {/* 5. Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column / Recent Orders & Inquiries (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-5 w-40 rounded-lg" />
              <SkeletonBlock className="h-4 w-16 rounded-md" />
            </div>

            {/* List items */}
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-stone-100 bg-[#fbf9f5]/60 p-4"
              >
                <div className="flex items-center gap-3">
                  <SkeletonBlock className="h-11 w-11 rounded-xl bg-stone-200/80" />
                  <div className="space-y-1.5">
                    <SkeletonBlock className="h-4 w-32 sm:w-44 rounded-md" />
                    <SkeletonBlock className="h-3 w-24 rounded-sm" />
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <SkeletonBlock className="h-6 w-20 rounded-full" />
                  <SkeletonBlock className="h-7 w-20 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column / Quick Checklist or Activity (1 col) */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-5 w-32 rounded-lg" />
              <SkeletonBlock className="h-5 w-12 rounded-full bg-emerald-100/60" />
            </div>
            <SkeletonBlock className="h-2 w-full rounded-full" />
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-start gap-3">
                  <SkeletonBlock className="h-5 w-5 rounded-full mt-0.5 shrink-0" />
                  <div className="space-y-1 flex-1">
                    <SkeletonBlock className="h-4 w-3/4 rounded-md" />
                    <SkeletonBlock className="h-3 w-1/2 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton({ role = "customer" }) {
  return (
    <div className="min-h-screen bg-[#fbf9f5] text-[#111827]">
      {/* 1. Header Navbar Skeleton */}
      <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-9 w-9 rounded-xl bg-[#8f2338]/20" />
              <SkeletonBlock className="h-5 w-28 rounded-lg" />
            </div>

            {/* Desktop Nav Items */}
            <div className="hidden md:flex items-center gap-4 pl-4">
              <SkeletonBlock className="h-4 w-16 rounded-md" />
              <SkeletonBlock className="h-4 w-24 rounded-md" />
              <SkeletonBlock className="h-4 w-20 rounded-md" />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-8 w-8 rounded-xl bg-stone-100" />
            <SkeletonBlock className="h-8 w-8 rounded-xl bg-stone-100" />
            <SkeletonBlock className="h-9 w-9 rounded-full bg-stone-200" />
          </div>
        </div>
      </header>

      {/* 2. Main Dashboard Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <PageContentSkeleton role={role} />
      </main>
    </div>
  );
}

export default DashboardSkeleton;
