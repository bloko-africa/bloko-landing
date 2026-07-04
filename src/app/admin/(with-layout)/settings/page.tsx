import { PushNotificationsToggle } from "@/components/Admin/push-notifications-toggle";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import type { Metadata } from "next";
import { StoreSettingsForm } from "./_components/store-settings-form";

export const metadata: Metadata = {
  title: "Paramètres",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, collections] = await Promise.all([
    getStoreSettings(),
    db.collection.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-180 space-y-8">
      <Breadcrumb pageName="Paramètres" />

      <StoreSettingsForm
        collections={collections}
        initial={{
          storeName: settings.storeName,
          currency: settings.currency,
          accentColor: settings.accentColor,
          heroEyebrow: settings.heroEyebrow,
          heroTitle: settings.heroTitle,
          heroSubtitle: settings.heroSubtitle,
          heroCtaLabel: settings.heroCtaLabel,
          featuredCollectionId: settings.featuredCollectionId,
          socialFacebook: settings.socialFacebook,
          socialInstagram: settings.socialInstagram,
          socialTiktok: settings.socialTiktok,
          socialWhatsapp: settings.socialWhatsapp,
          legalMentions: settings.legalMentions,
          cgvContent: settings.cgvContent,
        }}
      />

      <ShowcaseSection title="Notifications" className="p-6.5!">
        <PushNotificationsToggle />
      </ShowcaseSection>
    </div>
  );
}
