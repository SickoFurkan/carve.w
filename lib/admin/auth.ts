import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * De rolcontrole voor /admin.
 *
 * @ai-why: Op de naam van de rol en niet op een vastgelegde UUID. Tot 2026-09-08 stond
 * hier `ADMIN_ROLE_ID = "7171e054-3cd4-4cae-b552-f6c6ad2b9114"` hardgecodeerd, terwijl de
 * admin-rol in de database `1f9da99c-8fbd-4fdd-86d5-758c0519476a` is. Gevolg: `isAdmin()`
 * gaf voor iedereen false en `requireAdminOrRedirect()` stuurde de beheerder vanaf /admin
 * terug naar /chat. Er faalde niets, er kwam geen foutmelding, en het zag eruit als een
 * kapotte redirect in plaats van een rechtencontrole.
 *
 * Een UUID in code die moet matchen met een rij in de database is precies die val: bij een
 * database-reset of een seed op een andere omgeving loopt hij stil uit de pas. De naam
 * `admin` staat in `user_roles.name` en overleeft dat wel.
 *
 * @ai-gotcha: Verander je de naam van de rol in `user_roles`, dan verliest iedereen zijn
 * toegang tot /admin. Dat is bewust luidruchtig: je merkt het meteen, in tegenstelling tot
 * de stille versie hierboven.
 *
 * @ai-sync: app/actions/admin/overview.ts — dezelfde controle beschermt de server action
 */
const ADMIN_ROLE_NAME = "admin";

async function hasAdminRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("user_roles(name)")
    .eq("id", userId)
    .single();

  // @ai-gotcha: PostgREST geeft de ingesloten relatie als object óf als array terug,
  // afhankelijk van hoe hij de foreign key leest. Beide vormen afvangen, want de ene
  // omgeving kan de andere vorm geven dan de andere.
  const roles = (data as { user_roles?: { name?: string } | { name?: string }[] } | null)
    ?.user_roles;
  const name = Array.isArray(roles) ? roles[0]?.name : roles?.name;

  return name === ADMIN_ROLE_NAME;
}

export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  return hasAdminRole(supabase, user.id);
}

export async function requireAdmin(): Promise<{
  supabase: SupabaseClient;
  user: User;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");
  if (!(await hasAdminRole(supabase, user.id))) throw new Error("Unauthorized");

  return { supabase, user };
}

export async function requireAdminOrRedirect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (!(await hasAdminRole(supabase, user.id))) redirect("/chat");

  return { supabase, user };
}
