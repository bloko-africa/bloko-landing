import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { CreateStaffForm } from "../_components/create-staff-form";

export const metadata: Metadata = { title: "Nouveau compte staff" };

export default function NewStaffPage() {
  return (
    <div className="mx-auto w-full max-w-180">
      <Breadcrumb pageName="Nouveau compte staff" />
      <CreateStaffForm />
    </div>
  );
}
