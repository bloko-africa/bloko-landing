import { Suspense } from "react";
import { AccessForm } from "../AccessForm";

export default function Signin() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <AccessForm callbackURL="/2558588dca9a" />
    </Suspense>
  );
}
