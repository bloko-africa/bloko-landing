import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { BoutiqueCreateForm } from "../_components/boutique-create-form";

export const metadata: Metadata = {
  title: "Nouvelle boutique",
};

export default function NewBoutiquePage() {
  return (
    <div className="mx-auto w-full max-w-180">
      <Breadcrumb pageName="Nouvelle boutique" />
      <BoutiqueCreateForm />
    </div>
  );
}
