import React from "react";
import { UserCheck, Scissors, Building2, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import AudienceCard from "./AudienceCard";

const AudienceSection = () => {
  const { t } = useTranslation();

  const customerPoints = t("home.audience.customerPoints", { returnObjects: true });
  const tailorPoints = t("home.audience.tailorPoints", { returnObjects: true });
  const bulkPoints = t("home.audience.bulkPoints", { returnObjects: true });

  return (
    <section className="border-t border-[#eadfd4] bg-[#f7f2eb] py-14 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-800">
            <Sparkles size={13} />
            <span>{t("home.everyoneEyebrow", "Built For Everyone in Tailoring")}</span>
          </div>

          <h2 className="mt-3 font-serif text-2xl font-bold tracking-tight text-[#231b1a] sm:text-3xl lg:text-4xl">
            {t("home.everyoneTitle", "One Unified Platform for All Tailoring Needs")}
          </h2>

          <p className="mt-2 text-sm text-stone-600 leading-relaxed">
            {t("home.everyoneSubtitle", "Whether you need a single outfit stitched with perfection or manage bulk uniform production, MeraTailor connects you seamlessly.")}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <AudienceCard
            icon={<UserCheck size={24} />}
            badge={t("home.audience.customerBadge", "For Individuals")}
            title={t("home.audience.customerTitle", "Customers & Shoppers")}
            subtitle={t("home.audience.customerSubtitle", "Get perfect-fitting garments crafted by verified local masters without the hassle.")}
            points={Array.isArray(customerPoints) ? customerPoints : [
              "Save measurements once in your digital cloud vault",
              "AI Voice & radius search for nearby specialists",
              "1-tap direct call, upfront prices & fabric guidance",
              "Real-time progress updates from cutting to delivery",
            ]}
            ctaText={t("home.audience.customerCta", "Find a Tailor Near You")}
            ctaLink="/find-tailors"
            popular={false}
          />

          <AudienceCard
            icon={<Scissors size={24} />}
            badge={t("home.audience.tailorBadge", "Dual Role for Tailors")}
            title={t("home.audience.tailorTitle", "Tailors & Boutiques")}
            subtitle={t("home.audience.tailorSubtitle", "Grow your business by taking local retail orders and bidding on profitable bulk contracts.")}
            points={Array.isArray(tailorPoints) ? tailorPoints : [
              "Dual earning: retail customers + institutional orders",
              "Free digital order management & measurement book",
              "Direct client communication with zero hidden commission",
              "Get verified studio badge to build trust in your city",
            ]}
            ctaText={t("home.audience.tailorCta", "Join as a Tailor")}
            ctaLink="/dashboard"
            popular={true}
          />

          <AudienceCard
            icon={<Building2 size={24} />}
            badge={t("home.audience.bulkBadge", "Bulk & Corporate")}
            title={t("home.audience.bulkTitle", "Businesses & Brands")}
            subtitle={t("home.audience.bulkSubtitle", "Source uniforms, boutique runs, and event attire from vetted manufacturing tailors.")}
            points={Array.isArray(bulkPoints) ? bulkPoints : [
              "Post bulk RFQs and compare competitive bids",
              "Sample verification before full batch manufacturing",
              "Production milestone tracking & timeline guarantees",
              "GST invoices and dedicated procurement support",
            ]}
            ctaText={t("home.audience.bulkCta", "Post Bulk Requirement")}
            ctaLink="/bulk"
            popular={false}
          />
        </div>
      </div>
    </section>
  );
};

export default AudienceSection;
