import { auth } from "@/auth";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import SendEmailsSection from "./SendEmailsSection";
import AppHeader from "@/components/AppHeader";
import TemplateManager from "./TemplateManager";

export default async function TemplatePage() {
  const session = await auth();

  if (!session?.user) redirect("/");

  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { data: template } = await supabase
    .from("templates")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { data: sendableContacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("owner_id", user.id)
    .eq("status", "not_sent")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white text-black">
      <AppHeader />

      <main className="mx-auto max-w-[1150px] px-6 py-10">
        <h1 className="mb-8 text-3xl font-bold">Template</h1>

        <TemplateManager template={template ?? null} />

        <SendEmailsSection contacts={sendableContacts ?? []} />
      </main>
    </div>
  );
}