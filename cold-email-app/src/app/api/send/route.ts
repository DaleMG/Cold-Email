import { auth } from "@/auth";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { replacePlaceholders } from "@/lib/replacePlaceholders";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

function createRawEmail(to: string, subject: string, body: string) {
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\n");

  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || !session.accessToken) {
    return NextResponse.json(
      { error: "Not authenticated or missing Gmail access token." },
      { status: 401 }
    );
  }

  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }

  const { contactIds } = await request.json();

  if (!Array.isArray(contactIds) || contactIds.length === 0) {
    return NextResponse.json(
      { error: "No contacts selected." },
      { status: 400 }
    );
  }

  const { data: template, error: templateError } = await supabase
    .from("templates")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (templateError || !template) {
    return NextResponse.json(
      { error: "No template found." },
      { status: 400 }
    );
  }

  if (!template.subject || !template.body) {
    return NextResponse.json(
      { error: "Template subject and body are required." },
      { status: 400 }
    );
  }

  const { data: contacts, error: contactsError } = await supabase
    .from("contacts")
    .select("*")
    .eq("owner_id", user.id)
    .eq("status", "not_sent")
    .in("id", contactIds);

  if (contactsError) {
    return NextResponse.json({ error: contactsError.message }, { status: 500 });
  }

  if (!contacts || contacts.length === 0) {
    return NextResponse.json(
      { error: "No valid not-sent contacts selected." },
      { status: 400 }
    );
  }

  let sentCount = 0;

  for (const contact of contacts) {
    const subject = replacePlaceholders(template.subject, contact);
    const body = replacePlaceholders(template.body, contact);
    const raw = createRawEmail(contact.email, subject, body);

    const gmailResponse = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
      }
    );

    if (!gmailResponse.ok) {
      const errorText = await gmailResponse.text();

      return NextResponse.json(
        {
          error: "Gmail send failed.",
          details: errorText,
          sentCount,
        },
        { status: 500 }
      );
    }

    await supabase
      .from("contacts")
      .update({ status: "sent" })
      .eq("id", contact.id)
      .eq("owner_id", user.id);

    sentCount++;
  }

  return NextResponse.json({
    success: true,
    sentCount,
  });
}