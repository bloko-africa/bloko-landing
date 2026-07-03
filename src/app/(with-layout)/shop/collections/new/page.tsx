import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { CollectionForm } from "../_components/collection-form";

export const metadata: Metadata = {
  title: "Nouvelle collection",
};

export default function NewCollectionPage() {
  return (
    <div className="mx-auto w-full max-w-180">
      <Breadcrumb pageName="Nouvelle collection" />
      <CollectionForm />
    </div>
  );
}
