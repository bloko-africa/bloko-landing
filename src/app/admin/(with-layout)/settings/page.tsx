import { PushNotificationsToggle } from "@/components/Admin/push-notifications-toggle";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { getStoreSettings } from "@/lib/store-settings";
import type { Metadata } from "next";
import { StoreSettingsForm } from "./_components/store-settings-form";

export const metadata: Metadata = {
  title: "Paramètres",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto w-full max-w-180 space-y-8">
      <Breadcrumb pageName="Paramètres" />

      <StoreSettingsForm
        initial={{
          currency: settings.currency,
          heroTitle: settings.heroTitle,
          heroSubtitle: settings.heroSubtitle,
          heroCtaLabel: settings.heroCtaLabel,
        }}
      />

      <ShowcaseSection title="Notifications" className="p-6.5!">
        <PushNotificationsToggle />
      </ShowcaseSection>
    </div>
  );
}
