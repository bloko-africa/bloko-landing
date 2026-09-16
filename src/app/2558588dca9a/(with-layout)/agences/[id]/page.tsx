import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { db } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AgenceForm } from "../_components/agence-form";

export const metadata: Metadata = {
  title: "Modifier agence",
};

export const dynamic = "force-dynamic";

export default async function EditAgencePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agence = await db.agence.findUnique({ where: { id } });

  if (!agence) notFound();

  return (
    <div className="mx-auto w-full max-w-180">
      <Breadcrumb pageName="Modifier l'agence" />
      <AgenceForm initial={agence} />
    </div>
  );
}
