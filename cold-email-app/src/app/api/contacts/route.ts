import { getCurrentUser } from "@/lib/getCurrentUser";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { email, name, company, job_title } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const { data: existingContact } = await supabase
    .from("contacts")
    .select("id")
    .eq("owner_id", user.id)
    .eq("email", email)
    .maybeSingle();

  if (existingContact) {
    return NextResponse.json(
      { error: "Contact already exists." },
      { status: 409 }
    );
  }

  const { error } = await supabase.from("contacts").insert([
    {
      owner_id: user.id,
      email,
      name: name || null,
      company: company || null,
      job_title: job_title || null,
      status: "not_sent",
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}