import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "product-images";

async function main() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();
  if (listError) throw listError;

  if (buckets.some((b) => b.name === BUCKET)) {
    console.log(`Bucket "${BUCKET}" existe déjà.`);
    return;
  }

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true, // lecture publique (URLs directes pour affichage produit)
    fileSizeLimit: "5MB",
    allowedMimeTypes: ["image/webp", "image/jpeg", "image/png"],
  });

  if (error) throw error;

  console.log(
    `Bucket "${BUCKET}" créé (lecture publique, écriture réservée à la service_role key — aucune policy RLS pour anon/authenticated).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
