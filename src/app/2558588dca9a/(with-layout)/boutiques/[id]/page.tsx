import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { db } from "@/lib/db";
import { parseTrustBadges } from "@/lib/trust-badge-icons";
import { getWalletSummary } from "@/lib/wallet";
import {
  DEFAULT_BOUTIQUE_MENTIONS_LEGALES,
  DEFAULT_BOUTIQUE_CGV,
} from "@/lib/legal-content";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BoutiqueEditForm } from "../_components/boutique-edit-form";
import { WalletPanel } from "../_components/wallet-panel";

export const metadata: Metadata = {
  title: "Modifier boutique",
};

export const dynamic = "force-dynamic";

export default async function BoutiqueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const boutique = await db.boutique.findUnique({
    where: { id },
    include: { owner: { select: { name: true, email: true } } },
  });

  if (!boutique) notFound();

  const [wallet, payouts] = await Promise.all([
    getWalletSummary(boutique.id),
    db.payoutRecord.findMany({
      where: { boutiqueId: boutique.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-180 space-y-8">
      <Breadcrumb pageName={boutique.displayName} />

      <ShowcaseSection title="Vendeuse" className="p-6.5!">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">Nom</p>
            <p className="font-medium text-dark dark:text-white">
              {boutique.owner.name}
            </p>
          </div>
          <div>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">Email</p>
            <p className="font-medium text-dark dark:text-white">
              {boutique.owner.email}
            </p>
          </div>
          <div>
            <p className="text-body-sm text-dark-5 dark:text-dark-6">
              Lien public
            </p>
            <p className="font-medium text-dark dark:text-white">
              /b/{boutique.handle}
            </p>
          </div>
        </div>

        <a
          href={`/2558588dca9a/api/boutiques/${boutique.id}/export?format=csv`}
          className="mt-5 inline-block text-body-sm font-medium text-primary hover:underline"
        >
          Exporter le grand livre (CSV) →
        </a>
      </ShowcaseSection>

      <ShowcaseSection title="Portefeuille" className="p-6.5!">
        <WalletPanel
          boutiqueId={boutique.id}
          totalEarned={wallet.totalEarned}
          totalPaidOut={wallet.totalPaidOut}
          balance={wallet.balance}
          currency={wallet.currency}
          payouts={payouts.map((p) => ({
            id: p.id,
            amount: Number(p.amount),
            method: p.method,
            reference: p.reference,
            note: p.note,
            createdAt: p.createdAt.toISOString(),
          }))}
        />
      </ShowcaseSection>

      <BoutiqueEditForm
        initial={{
          id: boutique.id,
          displayName: boutique.displayName,
          status: boutique.status,
          pays: boutique.pays,
          ville: boutique.ville,
          quartier: boutique.quartier,
          adresse: boutique.adresse,
          accentColor: boutique.accentColor,
          bio: boutique.bio,
          heroEyebrow: boutique.heroEyebrow,
          heroTitle: boutique.heroTitle,
          heroSubtitle: boutique.heroSubtitle,
          heroCtaLabel: boutique.heroCtaLabel,
          socialFacebook: boutique.socialFacebook,
          socialInstagram: boutique.socialInstagram,
          socialTiktok: boutique.socialTiktok,
          socialWhatsapp: boutique.socialWhatsapp,
          logoUrl: boutique.logoUrl,
          coverImage: boutique.coverImage,
          trustBadges: parseTrustBadges(boutique.trustBadges),
          deliveryFee: Number(boutique.deliveryFee),
          deliveryFeeMode: boutique.deliveryFeeMode,
          legalMentions: boutique.legalMentions ?? DEFAULT_BOUTIQUE_MENTIONS_LEGALES,
          cgvContent: boutique.cgvContent ?? DEFAULT_BOUTIQUE_CGV,
        }}
      />
    </div>
  );
}
