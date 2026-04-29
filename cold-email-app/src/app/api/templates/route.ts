import { getCurrentUser } from "@/lib/getCurrentUser";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { subject, body } = await request.json();

  const cleanSubject = String(subject || "").trim();
  const cleanBody = String(body || "").trim();

  const { data: existing } = await supabase
    .from("templates")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existing) {
    const { data: template, error } = await supabase
      .from("templates")
      .update({
        subject: cleanSubject,
        body: cleanBody,
        updated_at: new Date().toISOString(),
      })
      .eq("owner_id", user.id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ template });
  }

  const { data: template, error } = await supabase
    .from("templates")
    .insert([
      {
        owner_id: user.id,
        subject: cleanSubject,
        body: cleanBody,
      },
    ])
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ template });
}