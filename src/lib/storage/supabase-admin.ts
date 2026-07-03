import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants.",
  );
}

/**
 * Client Supabase avec la service_role key : ne jamais importer ce module
 * depuis un composant client. Bypass RLS — utilisé uniquement côté serveur,
 * après vérification du rôle admin via Better Auth.
 */
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const PRODUCT_IMAGES_BUCKET = "product-images";
