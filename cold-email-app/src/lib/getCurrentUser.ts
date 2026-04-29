import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  const email = session.user.email;
  const name = session.user.name ?? null;

  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (existingUser) {
    return existingUser;
  }

  if (fetchError && fetchError.code !== "PGRST116") {
    throw fetchError;
  }

  const { data: newUser, error: insertError } = await supabase
    .from("users")
    .insert([{ email, name }])
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return newUser;
}