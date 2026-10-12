import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavbarLogo from "./NavbarLogo";
import DesktopNavigation from "./DesktopNavigation";
import DesktopActions from "./DesktopActions";
import MobileMenu from "./MobileMenu";
import LanguageToggle from "./LanguageToggle";
import NavIconButton from "./NavIconButton";
import NotificationBell from "../notifications/NotificationBell";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { i18n, t } = useTranslation();
  const { openSignUp, openSignIn, isSignedIn, getToken, profile } = useAuth();
  const location = useLocation();

  const isHomePage = location.pathname === "/";
  const userRole = profile?.role || null;

  useEffect(() => {
    const preferredLanguage = profile?.preferredLanguage;
    if (
      isSignedIn &&
      ["en", "hi"].includes(preferredLanguage) &&
      preferredLanguage !== i18n.language
    ) {
      i18n.changeLanguage(preferredLanguage);
    }
  }, [isSignedIn, profile?.preferredLanguage, i18n]);

  const changeLanguage = async (language) => {
    i18n.changeLanguage(language);
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      await fetch("/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ preferredLanguage: language }),
      });
    } catch {
      /* the local preference remains available */
    }
  };

  const handleSignIn = () => {
    setMobileOpen(false);
    openSignIn();
  };

  const handleSignUp = () => {
    setMobileOpen(false);
    openSignUp();
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/80 bg-white/95 backdrop-blur-md">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ===================================================
            1. BRAND LOGO (LEFT)
        ==================================================== */}
        <div className="flex items-center gap-6">
          <NavbarLogo onClick={closeMobileMenu} />

          {/* DESKTOP NAVIGATION (CENTER-LEFT) */}
          <DesktopNavigation isHomePage={isHomePage} userRole={userRole} />
        </div>

        {/* ===================================================
            2. DESKTOP ACTIONS (RIGHT)
        ==================================================== */}
        <DesktopActions
          language={i18n.language}
          onChangeLanguage={changeLanguage}
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          userRole={userRole}
        />

        {/* ===================================================
            3. MOBILE QUICK ACTIONS & HAMBURGER (RIGHT)
        ==================================================== */}
        <div className="flex items-center gap-1.5 md:hidden">
          <LanguageToggle
            language={i18n.language}
            onChange={changeLanguage}
            mobile
          />

          {isSignedIn && userRole === "customer" && (
            <NavIconButton
              to="/orders"
              label={t("navbar.orders", "My Orders")}
              type="orders"
              mobile
            />
          )}

          <NotificationBell mobile />

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-800 transition hover:bg-stone-100 active:scale-95"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* ===================================================
          MOBILE MENU DRAWER
      ================================================== */}
      <MobileMenu
        open={mobileOpen}
        isHomePage={isHomePage}
        language={i18n.language}
        onChangeLanguage={changeLanguage}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onClose={closeMobileMenu}
        userRole={userRole}
      />
    </header>
  );
};

export default Navbar;
