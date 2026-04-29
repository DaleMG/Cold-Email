import { auth } from "@/auth";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import ContactsClient from "./ContactsClient";
import AppHeader from "@/components/AppHeader";

export default async function ContactsPage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { data: contacts, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (
    <div className="min-h-screen bg-white text-black">
      <AppHeader />

      <main className="mx-auto max-w-[1150px] px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold">Contacts</h1>

        <ContactsClient initialContacts={contacts ?? []} />
      </main>
    </div>
  );
}