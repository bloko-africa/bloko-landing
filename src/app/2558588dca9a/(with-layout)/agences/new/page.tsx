import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { AgenceForm } from "../_components/agence-form";

export const metadata: Metadata = {
  title: "Nouvelle agence",
};

export default function NewAgencePage() {
  return (
    <div className="mx-auto w-full max-w-180">
      <Breadcrumb pageName="Nouvelle agence" />
      <AgenceForm />
    </div>
  );
}
